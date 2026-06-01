/**
 * Curated Unsplash defaults when admin has not uploaded an image.
 * Direct URLs (whitelisted in next.config.ts); no API key required.
 */

export const DEFAULT_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=1920&q=85',
  collectionBanner:
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920&q=85',

  brandStoryMain:
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=85',
  brandStoryDetail1:
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=85',
  brandStoryDetail2:
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=85',

  familyMatchingMain:
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&q=85',
  familyMen: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&q=85',
  familyWomen: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=85',
  familyBoy: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=85',
  familyGirl: 'https://images.unsplash.com/photo-1631193816258-28b44b21e78b?w=800&q=85',

  categoryPanjabi:
    'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&q=85',
  categoryElectronics:
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=85',
  categoryAccessories:
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=85',
  categoryHomeDecor:
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=85',

  processCuration:
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=85',
  processQualityCheck:
    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=85',
  processPhotography:
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=85',
  processListing:
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=85',
  processPackaging:
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=85',
  processDelivery:
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=85',

  communityDefault:
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=85',

  productPanjabi:
    'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=85',
  productElectronics:
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&q=85',
  productAccessories:
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=85',
  productHomeDecor:
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=85',
  productGeneric:
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=85',

  productRoyalNavyPanjabi:
    'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=85',
  productClassicWhitePanjabi:
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85',
  productPremiumCottonPanjabi:
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=85',
  productSilkPanjabi:
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=85',
  productMaroonPanjabi:
    'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=85',
  productGreenPanjabi:
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85',

  productBluetoothSpeaker:
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=85',
  productWirelessEarbuds:
    'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&q=85',
  productSmartWatch:
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=85',
  productDeskLamp:
    'https://images.unsplash.com/photo-1565636192335-b8826ea0e74c?w=600&q=85',

  productLeatherBelt:
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=85',
  productLeatherWallet:
    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=85',
  productJuteBag:
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=85',
  productSunglasses:
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=85',

  productCeramicVase:
    'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=600&q=85',
  productCushionSet:
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=85',

  fallback: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=85',
} as const;

export type DefaultImageKey = keyof typeof DEFAULT_IMAGES;

/** Admin URL wins; otherwise use explicit or hint-matched default. */
export function resolveImageUrl(
  adminUrl: string | undefined | null,
  fallbackUrl: string
): string {
  const trimmed = adminUrl?.trim();
  if (trimmed) return trimmed;
  return fallbackUrl;
}

export function getDefaultImageForHint(hint: string): string {
  const lower = hint.toLowerCase();

  if (lower.includes('editorial hero') || (lower.includes('hero') && !lower.includes('family'))) {
    return DEFAULT_IMAGES.hero;
  }

  if (lower.includes('man') && lower.includes('panjabi')) return DEFAULT_IMAGES.familyMen;
  if (lower.includes('woman') || lower.includes('three-piece') || lower.includes('three piece')) {
    return DEFAULT_IMAGES.familyWomen;
  }
  if (lower.includes('boy')) return DEFAULT_IMAGES.familyBoy;
  if (lower.includes('girl')) return DEFAULT_IMAGES.familyGirl;
  if (lower.includes('family')) return DEFAULT_IMAGES.familyMatchingMain;

  if (lower.includes('panjabi') && lower.includes('collection')) {
    return DEFAULT_IMAGES.categoryPanjabi;
  }
  if (lower.includes('panjabi')) return DEFAULT_IMAGES.categoryPanjabi;
  if (
    lower.includes('electronics') ||
    lower.includes('earbud') ||
    lower.includes('watch') ||
    lower.includes('speaker')
  ) {
    return DEFAULT_IMAGES.categoryElectronics;
  }
  if (lower.includes('accessor') || lower.includes('wallet') || lower.includes('belt')) {
    return DEFAULT_IMAGES.categoryAccessories;
  }
  if (
    lower.includes('home') ||
    lower.includes('decor') ||
    lower.includes('vase') ||
    lower.includes('cushion')
  ) {
    return DEFAULT_IMAGES.categoryHomeDecor;
  }

  if (lower.includes('curation') || lower.includes('selection') || lower.includes('বাছাই')) {
    return DEFAULT_IMAGES.processCuration;
  }
  if (lower.includes('quality') || lower.includes('inspection') || lower.includes('যাচাই')) {
    return DEFAULT_IMAGES.processQualityCheck;
  }
  if (lower.includes('photography') || lower.includes('photo') || lower.includes('ছবি')) {
    return DEFAULT_IMAGES.processPhotography;
  }
  if (lower.includes('listing') || lower.includes('লিস্টিং')) {
    return DEFAULT_IMAGES.processListing;
  }
  if (lower.includes('packaging') || lower.includes('প্যাকেজিং')) {
    return DEFAULT_IMAGES.processPackaging;
  }
  if (lower.includes('delivery') || lower.includes('courier') || lower.includes('ডেলিভারি')) {
    return DEFAULT_IMAGES.processDelivery;
  }

  if (lower.includes('fabric') || lower.includes('material') || lower.includes('কাপড়')) {
    return DEFAULT_IMAGES.brandStoryMain;
  }
  if (lower.includes('eid') || lower.includes('festive') || lower.includes('collection banner')) {
    return DEFAULT_IMAGES.collectionBanner;
  }
  if (lower.includes('community') || lower.includes('instagram')) {
    return DEFAULT_IMAGES.communityDefault;
  }

  return DEFAULT_IMAGES.fallback;
}

export function getDefaultProductImage(slug: string, category?: string): string {
  const specificMap: Record<string, string> = {
    'royal-navy-panjabi': DEFAULT_IMAGES.productRoyalNavyPanjabi,
    'classic-white-panjabi': DEFAULT_IMAGES.productClassicWhitePanjabi,
    'classic-white-boy-panjabi': DEFAULT_IMAGES.familyBoy,
    'premium-cotton-panjabi': DEFAULT_IMAGES.productPremiumCottonPanjabi,
    'silk-premium-panjabi': DEFAULT_IMAGES.productSilkPanjabi,
    'maroon-festive-panjabi': DEFAULT_IMAGES.productMaroonPanjabi,
    'green-casual-panjabi': DEFAULT_IMAGES.productGreenPanjabi,
    'bluetooth-speaker-mini': DEFAULT_IMAGES.productBluetoothSpeaker,
    'wireless-earbuds-pro': DEFAULT_IMAGES.productWirelessEarbuds,
    'smart-watch-elite': DEFAULT_IMAGES.productSmartWatch,
    'usb-led-desk-lamp': DEFAULT_IMAGES.productDeskLamp,
    'leather-belt-classic': DEFAULT_IMAGES.productLeatherBelt,
    'leather-wallet': DEFAULT_IMAGES.productLeatherWallet,
    'handmade-jute-bag': DEFAULT_IMAGES.productJuteBag,
    'sunglasses-classic': DEFAULT_IMAGES.productSunglasses,
    'ceramic-flower-vase': DEFAULT_IMAGES.productCeramicVase,
    'cotton-cushion-set': DEFAULT_IMAGES.productCushionSet,
  };

  if (specificMap[slug]) return specificMap[slug];

  switch (category) {
    case 'panjabi':
      return DEFAULT_IMAGES.productPanjabi;
    case 'electronics':
      return DEFAULT_IMAGES.productElectronics;
    case 'accessories':
      return DEFAULT_IMAGES.productAccessories;
    case 'home-decor':
      return DEFAULT_IMAGES.productHomeDecor;
    default:
      return DEFAULT_IMAGES.productGeneric;
  }
}

export function resolveProductImageUrl(
  url: string | undefined | null,
  slug: string,
  category?: string
): string {
  return resolveImageUrl(url, getDefaultProductImage(slug, category));
}
