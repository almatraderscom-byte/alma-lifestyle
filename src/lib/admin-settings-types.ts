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
  createdAt: string;
  updatedAt: string;
}

export function getDefaultAppSettings(): AppSettings {
  const now = new Date().toISOString();
  return {
    storeName: 'ALMA Lifestyle',
    tagline: 'Premium fashion crafted in Bangladesh',
    logoUrl: '',
    faviconUrl: '',
    contactEmail: 'support@alma.com',
    contactPhone: '8801000000000',
    whatsappCountryCode: '+880',
    whatsappNumber: '1000000000',
    physicalAddress: 'Dhaka, Bangladesh',
    businessHours: 'Sat–Thu 10:00–20:00',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    tiktokUrl: '',
    freeDeliveryThresholdBdt: 3000,
    defaultDeliveryChargeBdt: 120,
    freeDeliveryCities: ['Dhaka', 'Chattogram'],
    outsideCityDeliveryChargeBdt: 200,
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
    createdAt: now,
    updatedAt: now,
  };
}

export function migrateLegacySettings(raw: Record<string, unknown>): AppSettings {
  const defaults = getDefaultAppSettings();
  return {
    ...defaults,
    storeName: String(raw.storeName ?? defaults.storeName),
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
