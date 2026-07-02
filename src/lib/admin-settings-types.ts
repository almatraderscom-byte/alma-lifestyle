/** One link inside a footer column or the header nav. */
export interface NavLinkConfig {
  label: string;
  href: string;
  /** Header-only: renders the floating contact-icon cluster on hover. */
  social?: boolean;
}

export interface FooterColumnConfig {
  title: string;
  links: NavLinkConfig[];
}

/** Admin override for a static content/legal page (about, faq, privacy, …).
 *  Every field is optional: an unset field falls back to the page's built-in
 *  default, so an empty override changes nothing on the live page. */
export interface ContentPageConfig {
  title?: string;
  subtitle?: string;
  badge?: string;
  heroWord?: string;
  lastUpdated?: string;
  /** Optional raw-HTML body. When set, it replaces the page's built-in prose. */
  bodyHtml?: string;
  /** Per-page SEO overrides (fall back to the page's built-in metadata). */
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

/** Slugs of the editable content pages, in the order shown in admin. */
export const CONTENT_PAGE_SLUGS = [
  'about',
  'faq',
  'delivery',
  'refund',
  'privacy',
  'terms',
  'size-guide',
] as const;
export type ContentPageSlug = (typeof CONTENT_PAGE_SLUGS)[number];

export const CONTENT_PAGE_LABELS: Record<ContentPageSlug, string> = {
  about: 'About (আমাদের সম্পর্কে)',
  faq: 'FAQ (সচরাচর জিজ্ঞাসা)',
  delivery: 'Delivery (ডেলিভারি)',
  refund: 'Refund (রিটার্ন ও রিফান্ড)',
  privacy: 'Privacy (প্রাইভেসি)',
  terms: 'Terms (শর্তাবলী)',
  'size-guide': 'Size Guide (সাইজ গাইড)',
};

/** ALMA AI assistant (Gemini-powered storefront concierge) — admin-tunable. */
export interface AssistantSettings {
  enabled: boolean;
  /** Display name shown in the chat header, e.g. "আলমা". */
  name: string;
  /** First message the assistant shows when the panel opens. */
  greeting: string;
  /** Quick-tap suggestion chips shown under the greeting. */
  suggestions: string[];
  /** Owner's extra instructions appended to the AI system prompt. */
  extraInstructions: string;
  /** Owner trust card at the top of the chat (photo + intro + WhatsApp). */
  showOwnerCard: boolean;
  ownerName: string;
  ownerPhotoUrl: string;
  ownerCardText: string;
}

/** One pre-recorded voice clip (ElevenLabs-generated) played by the storefront. */
export interface VoiceClipSetting {
  enabled: boolean;
  /** Optional hosted URL override; empty = bundled /voice/<key>.mp3. */
  url: string;
}

export const VOICE_CLIP_KEYS = [
  'greeting',
  'priceReveal',
  'familyHook',
  'addToCart',
  'assistantOpen',
] as const;
export type VoiceClipKey = (typeof VOICE_CLIP_KEYS)[number];

export const VOICE_CLIP_LABELS: Record<VoiceClipKey, string> = {
  greeting: 'হোমপেজ সালাম/গ্রিটিং (প্রথম ভিজিটে)',
  priceReveal: 'প্রোডাক্ট দামে ক্লিক করলে',
  familyHook: 'ফ্যামিলি ম্যাচিং সেট পেজে (অটো হুক)',
  addToCart: 'কার্টে যোগ করলে',
  assistantOpen: 'AI সহকারী খুললে',
};

export interface VoiceSettings {
  enabled: boolean;
  clips: Record<VoiceClipKey, VoiceClipSetting>;
}

export interface AppSettings {
  storeName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  contactPhone: string;
  whatsappCountryCode: string;
  whatsappNumber: string;
  physicalAddress: string;
  businessHours: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  freeDeliveryThresholdBdt: number;
  defaultDeliveryChargeBdt: number;
  dhakaCityDeliveryChargeBdt: number;
  dhakaDistrictDeliveryChargeBdt: number;
  freeDeliveryCities: string[];
  outsideCityDeliveryChargeBdt: number;
  estimatedDeliveryTime: string;
  codEnabled: boolean;
  codInstructions: string;
  bkashEnabled: boolean;
  bkashMerchantNumber: string;
  bkashInstructions: string;
  nagadEnabled: boolean;
  nagadMerchantNumber: string;
  nagadInstructions: string;
  primaryCurrency: 'BDT';
  usdExchangeRate: number;
  aedExchangeRate: number;
  showMultiCurrency: boolean;
  seoSiteTitleTemplate: string;
  seoSiteDescription: string;
  seoDefaultOgImageUrl: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  orderConfirmationEmailEnabled: boolean;
  newOrderAdminNotificationEnabled: boolean;
  emailFromName: string;
  emailFromAddress: string;
  lowStockThreshold: number;
  // Footer & navigation chrome (admin-editable)
  footerTagline: string;
  footerColumns: FooterColumnConfig[];
  footerCopyright: string;
  footerLegalLine: string;
  headerNav: NavLinkConfig[];
  /** Per-page overrides for the static content/legal pages, keyed by slug. */
  contentPages: Record<string, ContentPageConfig>;
  /** Overrides for user-facing shop/cart/checkout UI labels, keyed by dot-path
   *  (e.g. "cart.title"). Blank/unset keys fall back to the built-in copy. */
  uiCopy: Record<string, string>;
  /** ALMA AI assistant (chat concierge) config. */
  assistant: AssistantSettings;
  /** Pre-recorded voice clip playback config. */
  voice: VoiceSettings;
  createdAt: string;
  updatedAt: string;
}

export function getDefaultAssistantSettings(): AssistantSettings {
  return {
    enabled: true,
    name: 'আলমা',
    greeting:
      'আসসালামু আলাইকুম! 🌙 আমি আলমা — ALMA Lifestyle-এর AI সহকারী। পাঞ্জাবি, ফ্যামিলি ম্যাচিং সেট, দাম, ডেলিভারি — যেকোনো প্রশ্ন করুন, আমি সাহায্য করছি।',
    suggestions: [
      'ফ্যামিলি ম্যাচিং সেট দেখান',
      'ডেলিভারি চার্জ কত?',
      'নতুন কালেকশন কী আছে?',
      'অর্ডার কীভাবে করব?',
    ],
    extraInstructions: '',
    showOwnerCard: true,
    ownerName: 'Maruf Chowdhury',
    ownerPhotoUrl: '/owner/maruf.jpg',
    ownerCardText:
      'আমি আলমা — ওনার AI সহকারী। সরাসরি মালিকের সাথে কথা বলতে চাইলে WhatsApp করুন 👇',
  };
}

export function getDefaultVoiceSettings(): VoiceSettings {
  const clip = (): VoiceClipSetting => ({ enabled: true, url: '' });
  return {
    enabled: true,
    clips: {
      greeting: clip(),
      priceReveal: clip(),
      familyHook: clip(),
      addToCart: clip(),
      assistantOpen: clip(),
    },
  };
}

/** Current storefront footer columns — the defaults shown until the owner edits them. */
export const DEFAULT_FOOTER_COLUMNS: FooterColumnConfig[] = [
  {
    title: 'শপ',
    links: [
      { label: 'সব পণ্য', href: '/products' },
      { label: 'পাঞ্জাবি', href: '/products?category=panjabi' },
      { label: 'ইসলামিক', href: '/products?category=islamic' },
      { label: 'এক্সেসরিজ', href: '/products?category=accessories' },
    ],
  },
  {
    title: 'কোম্পানি',
    links: [
      { label: 'আমাদের সম্পর্কে', href: '/about' },
      { label: 'যোগাযোগ', href: '/contact' },
      { label: 'ডেলিভারি', href: '/delivery' },
      { label: 'অর্ডার ট্র্যাক', href: '/track' },
    ],
  },
  {
    title: 'সাপোর্ট',
    links: [
      { label: 'সচরাচর জিজ্ঞাসা', href: '/faq' },
      { label: 'রিটার্ন ও রিফান্ড', href: '/refund' },
      { label: 'প্রাইভেসি পলিসি', href: '/privacy' },
      { label: 'শর্তাবলী', href: '/terms' },
    ],
  },
];

/** Current storefront header nav — defaults until the owner edits them. */
export const DEFAULT_HEADER_NAV: NavLinkConfig[] = [
  { label: 'পাঞ্জাবি', href: '/products?category=panjabi' },
  { label: 'কালেকশন', href: '/products' },
  { label: 'সব পণ্য', href: '/products' },
  { label: 'যোগাযোগ', href: '/contact', social: true },
];

export function getDefaultAppSettings(): AppSettings {
  const now = new Date().toISOString();
  return {
    storeName: 'ALMA Lifestyle',
    tagline: 'Premium style and quality without luxury-level prices',
    logoUrl: '',
    faviconUrl: '',
    contactEmail: 'support@alma.com',
    contactPhone: '8801307777733',
    whatsappCountryCode: '+880',
    whatsappNumber: '1307777733',
    physicalAddress: 'Dhaka, Bangladesh',
    businessHours: 'Sat–Thu 10:00–20:00',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    tiktokUrl: '',
    freeDeliveryThresholdBdt: 2000,
    defaultDeliveryChargeBdt: 80,
    dhakaCityDeliveryChargeBdt: 80,
    dhakaDistrictDeliveryChargeBdt: 120,
    freeDeliveryCities: ['Dhaka'],
    outsideCityDeliveryChargeBdt: 120,
    estimatedDeliveryTime: '২–৪ কর্মদিবস',
    codEnabled: true,
    codInstructions: 'Pay cash when your order arrives.',
    bkashEnabled: false,
    bkashMerchantNumber: '',
    bkashInstructions: '',
    nagadEnabled: false,
    nagadMerchantNumber: '',
    nagadInstructions: '',
    primaryCurrency: 'BDT',
    usdExchangeRate: 110,
    aedExchangeRate: 30,
    showMultiCurrency: true,
    seoSiteTitleTemplate: '%s | ALMA Lifestyle',
    seoSiteDescription: 'Premium Bangladeshi fashion and lifestyle.',
    seoDefaultOgImageUrl: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
    orderConfirmationEmailEnabled: true,
    newOrderAdminNotificationEnabled: true,
    emailFromName: 'ALMA Lifestyle',
    emailFromAddress: 'orders@alma.com',
    lowStockThreshold: 10,
    footerTagline:
      'প্রিমিয়াম পাঞ্জাবি, ইসলামিক এসেনশিয়ালস ও লাইফস্টাইল পণ্য — সেই মুহূর্তগুলোর জন্য যেগুলো সত্যিই গুরুত্বপূর্ণ।',
    footerColumns: DEFAULT_FOOTER_COLUMNS,
    footerCopyright: '© 2026 Alma Lifestyle',
    footerLegalLine: 'Terms of Service · Privacy Notice',
    headerNav: DEFAULT_HEADER_NAV,
    contentPages: {},
    uiCopy: {},
    assistant: getDefaultAssistantSettings(),
    voice: getDefaultVoiceSettings(),
    createdAt: now,
    updatedAt: now,
  };
}

export function migrateLegacySettings(raw: Record<string, unknown>): AppSettings {
  const defaults = getDefaultAppSettings();
  return {
    ...defaults,
    storeName: String(raw.storeName ?? defaults.storeName),
    tagline: String(raw.tagline ?? defaults.tagline),
    logoUrl: String(raw.logoUrl ?? defaults.logoUrl),
    faviconUrl: String(raw.faviconUrl ?? defaults.faviconUrl),
    seoDefaultOgImageUrl: String(raw.seoDefaultOgImageUrl ?? defaults.seoDefaultOgImageUrl),
    contactEmail: String(raw.supportEmail ?? raw.contactEmail ?? defaults.contactEmail),
    contactPhone: String(raw.supportPhone ?? raw.contactPhone ?? defaults.contactPhone),
    usdExchangeRate:
      typeof raw.bdtToUsd === 'number' && raw.bdtToUsd < 1
        ? Math.round(1 / raw.bdtToUsd)
        : Number(raw.usdExchangeRate ?? defaults.usdExchangeRate),
    aedExchangeRate:
      typeof raw.bdtToAed === 'number' && raw.bdtToAed < 1
        ? Math.round(1 / raw.bdtToAed)
        : Number(raw.aedExchangeRate ?? defaults.aedExchangeRate),
    lowStockThreshold: Number(raw.lowStockThreshold ?? defaults.lowStockThreshold),
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
    createdAt: String(raw.createdAt ?? defaults.createdAt),
  };
}
