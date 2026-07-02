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
  createdAt: string;
  updatedAt: string;
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
