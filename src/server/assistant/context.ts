import 'server-only';

import type { AppSettings } from '@/lib/admin-settings-types';
import type { CatalogProduct } from '@/lib/products-data';
import { loadCatalogProductsServer, loadPublicSettingsServer } from '@/lib/storefront/server-data';
import { HIGHLIGHT_TARGETS } from '@/lib/highlight-targets';

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

  const pages = [
    '/ — হোমপেজ',
    '/products — সব পণ্য',
    '/products?category=panjabi — পাঞ্জাবি',
    '/products?category=islamic — ইসলামিক',
    '/products/<slug> — নির্দিষ্ট পণ্যের পেজ',
    '/cart — শপিং কার্ট',
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
    '- দাম, স্টক বা পণ্যের তথ্য কখনো বানিয়ে বলবে না — শুধু নিচের ক্যাটালগ থেকে বলবে। ক্যাটালগে না থাকলে বলো জানা নেই এবং WhatsApp-এ যোগাযোগের পরামর্শ দাও।',
    '- অর্ডার নেওয়া, পেমেন্ট নেওয়া বা ব্যক্তিগত তথ্য চাওয়া তোমার কাজ নয় — অর্ডার করতে চাইলে পণ্যের পেজে নিয়ে যাও বা কার্টে যেতে বলো।',
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
    '- উদাহরণ: "আমাদের ফ্যামিলি ম্যাচিং কালেকশনটা দেখাচ্ছি! [[NAV:/]] [[HIGHLIGHT:family-matching]]"',
    '- উদাহরণ (একই পেজে): "এই যে, দামটা এখানে দেখুন! [[HIGHLIGHT:pdp-price]]"',
    '',
    '## দোকানের তথ্য',
    ...storeFacts,
    '',
    '## পেজ-তালিকা',
    ...pages,
    '',
    '## পণ্য ক্যাটালগ (লাইভ)',
    catalogBlock || '(ক্যাটালগ এখন লোড হয়নি — পণ্যের প্রশ্নে WhatsApp-এ যোগাযোগের পরামর্শ দাও)',
    ...(extra ? ['', '## মালিকের অতিরিক্ত নির্দেশনা', extra] : []),
  ].join('\n');

  cached = { prompt, products, at: Date.now() };
  return { prompt, products };
}
