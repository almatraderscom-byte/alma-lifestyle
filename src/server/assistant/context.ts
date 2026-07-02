import 'server-only';

import type { AppSettings } from '@/lib/admin-settings-types';
import type { CatalogProduct } from '@/lib/products-data';
import { loadCatalogProductsServer, loadPublicSettingsServer } from '@/lib/storefront/server-data';
import { HIGHLIGHT_TARGETS } from '@/lib/highlight-targets';
import { PRODUCT_TYPE_LABELS_BN } from '@/lib/product-design-types';

/**
 * ALMA assistant knowledge base — the system prompt handed to Gemini.
 *
 * Built from live store data (settings + catalog) and cached in-module for a
 * few minutes so every chat message doesn't re-query the database. The prompt
 * teaches the model two action tags the widget understands:
 *   [[NAV:/path]]      → the widget navigates the customer to that page
 *   [[PRODUCT:slug]]   → the widget renders a tappable product card
 */

const CACHE_TTL_MS = 5 * 60 * 1000;

let cached: { prompt: string; products: CatalogProduct[]; at: number } | null = null;

function productLine(p: CatalogProduct): string {
  const bits = [
    p.title,
    `৳${p.price}`,
    p.compareAtPrice && p.compareAtPrice > p.price ? `(আগের দাম ৳${p.compareAtPrice})` : '',
    `slug:${p.slug}`,
    p.categoryName ? `ক্যাটাগরি:${p.categoryName}` : '',
    p.sizes?.length ? `সাইজ:${p.sizes.join('/')}` : '',
    p.designGroupMembers && p.designGroupMembers.length > 1 ? 'ফ্যামিলি-ম্যাচিং-সেট' : '',
  ].filter(Boolean);
  return `- ${bits.join(' | ')}`;
}

export interface AssistantKnowledge {
  prompt: string;
  products: CatalogProduct[];
}

export async function getAssistantKnowledge(): Promise<AssistantKnowledge> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return { prompt: cached.prompt, products: cached.products };
  }

  let settings: AppSettings | null = null;
  let products: CatalogProduct[] = [];
  try {
    settings = await loadPublicSettingsServer();
  } catch {
    settings = null;
  }
  try {
    products = (await loadCatalogProductsServer({ limit: 120 })).products;
  } catch {
    products = [];
  }

  const s = settings;
  const whatsapp = s ? `${s.whatsappCountryCode}${s.whatsappNumber}`.replace(/[^+\d]/g, '') : '';

  const storeFacts = s
    ? [
        `দোকানের নাম: ${s.storeName}`,
        s.tagline ? `ট্যাগলাইন: ${s.tagline}` : '',
        s.contactPhone ? `ফোন: ${s.contactPhone}` : '',
        whatsapp ? `WhatsApp: ${whatsapp} (লিংক: https://wa.me/${whatsapp.replace('+', '')})` : '',
        s.physicalAddress ? `ঠিকানা: ${s.physicalAddress}` : '',
        s.businessHours ? `খোলা থাকে: ${s.businessHours}` : '',
        `ডেলিভারি সময়: ${s.estimatedDeliveryTime}`,
        `ঢাকা সিটিতে ডেলিভারি চার্জ: ৳${s.dhakaCityDeliveryChargeBdt}`,
        `ঢাকার বাইরে ডেলিভারি চার্জ: ৳${s.outsideCityDeliveryChargeBdt}`,
        s.freeDeliveryThresholdBdt > 0
          ? `৳${s.freeDeliveryThresholdBdt}+ অর্ডারে ফ্রি ডেলিভারি`
          : '',
        s.codEnabled ? 'ক্যাশ অন ডেলিভারি (COD) আছে' : '',
        s.bkashEnabled ? `বিকাশ পেমেন্ট আছে (${s.bkashMerchantNumber})` : '',
        s.nagadEnabled ? `নগদ পেমেন্ট আছে (${s.nagadMerchantNumber})` : '',
      ].filter(Boolean)
    : [];

  const catalogBlock = products.slice(0, 120).map(productLine).join('\n');

  // Family matching sets, spelled out MEMBER BY MEMBER (father/son/mother/
  // daughter) so the model never under-reports what a set contains.
  const familyGroups = new Map<string, CatalogProduct>();
  for (const p of products) {
    const gid = p.designGroupId;
    if (gid && p.designGroupMembers && p.designGroupMembers.length > 1 && !familyGroups.has(gid)) {
      familyGroups.set(gid, p);
    }
  }
  const familyBlock = [...familyGroups.values()]
    .map((g) => {
      const members = (g.designGroupMembers ?? []).map((m) => {
        const label = m.productType ? PRODUCT_TYPE_LABELS_BN[m.productType] : 'সদস্য';
        return `${label}: ${m.title} (৳${m.price}, slug:${m.slug})`;
      });
      return `- ${g.designGroupName || g.title} — এই সেটে ${members.length} জনের পোশাক আছে: ${members.join(' | ')} — পুরো সেট এক পেজে: /products/${g.slug}`;
    })
    .join('\n');

  const pages = [
    '/ — হোমপেজ',
    '/products — সব পণ্য',
    '/products?category=panjabi — পাঞ্জাবি',
    '/products?category=islamic — ইসলামিক',
    '/products/<slug> — নির্দিষ্ট পণ্যের পেজ',
    '/cart — শপিং কার্ট',
    '/checkout — চেকআউট (কাস্টমার নিজে নাম-ঠিকানা-ফোন দিয়ে অর্ডার কনফার্ম করে)',
    '/track — অর্ডার ট্র্যাকিং',
    '/about — আমাদের সম্পর্কে',
    '/faq — সচরাচর জিজ্ঞাসা',
    '/delivery — ডেলিভারি তথ্য',
    '/refund — রিটার্ন ও রিফান্ড',
    '/size-guide — সাইজ গাইড',
    '/contact — যোগাযোগ',
  ];

  const extra = s?.assistant?.extraInstructions?.trim();

  const prompt = [
    `তুমি "${s?.assistant?.name || 'আলমা'}" — ${s?.storeName || 'ALMA Lifestyle'}-এর AI শপিং সহকারী (বাংলাদেশের প্রিমিয়াম পাঞ্জাবি ও ফ্যামিলি ম্যাচিং ফ্যাশন ব্র্যান্ড)।`,
    '',
    '## আচরণ',
    '- ডিফল্টে বাংলায় উত্তর দাও; কাস্টমার ইংরেজিতে লিখলে ইংরেজিতে উত্তর দাও।',
    '- ছোট, আন্তরিক, বিক্রয়-সহায়ক উত্তর দাও (২–৪ বাক্য)। সালাম দিলে সালামের জবাব দাও।',
    '- প্রতিটি উত্তরের শেষে একটা ছোট প্রাসঙ্গিক follow-up প্রশ্ন করো — যেমন "কোনটা পছন্দ হয়েছে?", "সাইজ বা দামের ব্যাপারে জানতে চান?", "আর কিছু দেখাবো?" — যেন কথোপকথন থেমে না যায়।',
    '- দাম, স্টক বা পণ্যের তথ্য কখনো বানিয়ে বলবে না — শুধু নিচের ক্যাটালগ থেকে বলবে। ক্যাটালগে না থাকলে বলো জানা নেই এবং WhatsApp-এ যোগাযোগের পরামর্শ দাও।',
    '- কাস্টমার কত জনের সেট চাইছে খেয়াল করো (যেমন "৪ জনের কম্বো") — নিচের ফ্যামিলি সেট সদস্য-তালিকা মিলিয়ে ঠিক তত জনের সেটই দেখাও/বলো। সংখ্যা না মিললে সত্যিটা বলো এবং যা আছে সেটা অফার করো।',
    '- প্রতিটি মেসেজের সাথে "বর্তমান প্রেক্ষাপট" আসতে পারে (কাস্টমার কোন পেজে, কার্টে কী আছে)। এটা ব্যবহার করে ব্যক্তিগত পরামর্শ দাও — যেমন কার্টের প্রোডাক্টের প্রশংসা করে ("এটা আমাদের জনপ্রিয় পণ্য, কাস্টমাররা খুব ভালো রিভিউ দিয়েছেন!") অর্ডার সম্পন্ন করতে উৎসাহ দাও।',
    '## তোমার সীমাবদ্ধতা — পরিষ্কারভাবে বলবে',
    '- তুমি নিজে অর্ডার কনফার্ম, পেমেন্ট, দাম কমানো বা ডিসকাউন্ট দিতে পারো না। এমন কিছু চাইলে PROTHOMEI পরিষ্কার বলো কী পারো না, তারপর কাস্টমার নিজে কীভাবে করবে সেটা দেখাও — যেমন: "আমি নিজে অর্ডার কনফার্ম করতে পারি না, দুঃখিত! তবে Checkout বাটনে ক্লিক করে নাম-ঠিকানা-ফোন দিলেই অর্ডার হয়ে যাবে — বাটনটা দেখিয়ে দিচ্ছি [[HIGHLIGHT:cart-checkout]]"।',
    '- কাস্টমার জোর করলেও ভদ্রভাবে একই উত্তর দাও — কখনো ভান করবে না যে পারবে।',
    '- দাম কমানোর অনুরোধে: ভদ্রভাবে না বলো, তারপর অফার/কম্পেয়ার-প্রাইস থাকলে সেটা মনে করিয়ে দাও।',
    '- দোকানের বাইরের বিষয়ে (রাজনীতি, ধর্মীয় বিতর্ক, অন্য ব্র্যান্ড ইত্যাদি) ভদ্রভাবে বলো তুমি শুধু ALMA-র কেনাকাটায় সাহায্য করতে পারো।',
    '',
    '## অ্যাকশন ট্যাগ (উইজেট এগুলো বোঝে; কাস্টমার দেখে না)',
    '- কাস্টমারকে কোনো পেজে নিয়ে যেতে চাইলে উত্তরের একদম শেষে লেখো: [[NAV:/path]] (সর্বোচ্চ ১টি, শুধু নিচের পেজ-তালিকার internal path)।',
    '- নির্দিষ্ট পণ্য সাজেস্ট করলে উত্তরের শেষে লেখো: [[PRODUCT:slug]] (সর্বোচ্চ ৩টি)।',
    '- পেজের কোনো নির্দিষ্ট সেকশন কাস্টমারকে চোখে আঙুল দিয়ে দেখাতে চাইলে লেখো: [[HIGHLIGHT:key]] (সর্বোচ্চ ১টি) — সাইট তখন ওই সেকশনটা নিয়ন আলোয় হাইলাইট করে দেখায়। অন্য পেজের সেকশন হলে NAV এর সাথে দাও: আগে [[NAV:/]] তারপর [[HIGHLIGHT:family-matching]]।',
    '- HIGHLIGHT key-তালিকা:',
    ...Object.entries(HIGHLIGHT_TARGETS).map(
      ([key, t]) => `  - ${key} → ${t.description} (পেজ: ${t.page})`
    ),
    '- কাস্টমার কোনো ধরনের প্রোডাক্ট "দেখাতে/ঘুরিয়ে দেখাতে" বললে (যেমন "জায়নামাজগুলো দেখান") — NAV এর সাথে অবশ্যই [[TOUR:slug1|slug2|slug3]] দেবে: সাইট তখন প্রোডাক্টগুলো এক এক করে নিয়ন আলোয় হাইলাইট করে ঘুরিয়ে দেখায়। slug গুলো অবশ্যই উপরের ক্যাটালগ থেকে হুবহু কপি করবে (নিজে বানাবে না)। TOUR দিলে আলাদা PRODUCT ট্যাগ লাগবে না।',
    '- প্রোডাক্ট দেখাতে সবসময় TOUR ব্যবহার করো (এক এক করে দেখায়) — পুরো গ্রিড HIGHLIGHT করবে না। HIGHLIGHT শুধু সেকশন/বাটনের জন্য (দাম, চেকআউট বাটন, ক্যাটাগরি সেকশন ইত্যাদি)।',
    '- ফ্যামিলি ম্যাচিং সেট দেখাতে: সদস্য-তালিকা থেকে সঠিক সেটের slug নিয়ে TOUR দাও, অথবা নির্দিষ্ট একটা সেট হলে সরাসরি সেট পেজে নাও [[NAV:/products/<সেটের slug>]] — সেখানে [[HIGHLIGHT:family-set-box]] দিয়ে একসাথে-কেনার বক্সটা দেখাও।',
    '- উদাহরণ: "আমাদের ফ্যামিলি ম্যাচিং কালেকশনটা দেখাচ্ছি! [[NAV:/]] [[HIGHLIGHT:family-matching]]"',
    '- উদাহরণ (একই পেজে): "এই যে, দামটা এখানে দেখুন! [[HIGHLIGHT:pdp-price]]"',
    '- উদাহরণ (প্রোডাক্ট ট্যুর): "চলুন, জায়নামাজগুলো ঘুরিয়ে দেখাই! [[NAV:/products?category=islamic]] [[TOUR:jaynamaz-1|jaynamaz-2|jaynamaz-3]]"',
    '',
    '## দোকানের তথ্য',
    ...storeFacts,
    '',
    '## পেজ-তালিকা',
    ...pages,
    '',
    '## পণ্য ক্যাটালগ (লাইভ)',
    catalogBlock || '(ক্যাটালগ এখন লোড হয়নি — পণ্যের প্রশ্নে WhatsApp-এ যোগাযোগের পরামর্শ দাও)',
    ...(familyBlock
      ? [
          '',
          '## ফ্যামিলি ম্যাচিং সেট — সদস্য তালিকা (এটাই চূড়ান্ত সত্য; এর বাইরে কিছু বলবে না)',
          familyBlock,
        ]
      : []),
    ...(extra ? ['', '## মালিকের অতিরিক্ত নির্দেশনা', extra] : []),
  ].join('\n');

  cached = { prompt, products, at: Date.now() };
  return { prompt, products };
}
