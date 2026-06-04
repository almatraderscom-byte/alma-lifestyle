/**
 * Premium Alma SVG gradient placeholders when admin has not uploaded an image.
 * No external stock photos — intentional "image coming soon" treatment.
 */

import { createAlmaPlaceholderSvg, type PlaceholderTone } from '@/lib/placeholder-svg';

function p(tone: PlaceholderTone, w = 800, h = 600) {
  return createAlmaPlaceholderSvg(tone, w, h);
}

export const DEFAULT_IMAGES = {
  hero: p('warm', 1920, 1080),
  collectionBanner: p('warm', 1920, 1080),

  brandStoryMain: p('warm', 1200, 800),
  brandStoryDetail1: p('neutral', 800, 600),
  brandStoryDetail2: p('family', 800, 600),

  familyMatchingMain: p('family', 1200, 800),
  familyMen: p('family', 800, 600),
  familyWomen: p('family', 800, 600),
  familyBoy: p('family', 800, 600),
  familyGirl: p('family', 800, 600),

  categoryPanjabi: p('cool', 800, 600),
  categoryElectronics: p('cool', 800, 600),
  categoryAccessories: p('cool', 800, 600),
  categoryHomeDecor: p('cool', 800, 600),

  processCuration: p('process', 800, 600),
  processQualityCheck: p('process', 800, 600),
  processPhotography: p('process', 800, 600),
  processListing: p('process', 800, 600),
  processPackaging: p('process', 800, 600),
  processDelivery: p('process', 800, 600),

  communityDefault: p('sand', 600, 600),

  productPanjabi: p('neutral', 600, 800),
  productElectronics: p('cool', 600, 800),
  productAccessories: p('cool', 600, 800),
  productHomeDecor: p('cool', 600, 800),
  productGeneric: p('neutral', 600, 800),

  productRoyalNavyPanjabi: p('neutral', 600, 800),
  productClassicWhitePanjabi: p('neutral', 600, 800),
  productPremiumCottonPanjabi: p('neutral', 600, 800),
  productSilkPanjabi: p('neutral', 600, 800),
  productMaroonPanjabi: p('warm', 600, 800),
  productGreenPanjabi: p('neutral', 600, 800),

  productBluetoothSpeaker: p('cool', 600, 800),
  productWirelessEarbuds: p('cool', 600, 800),
  productSmartWatch: p('cool', 600, 800),
  productDeskLamp: p('cool', 600, 800),

  productLeatherBelt: p('cool', 600, 800),
  productLeatherWallet: p('cool', 600, 800),
  productJuteBag: p('cool', 600, 800),
  productSunglasses: p('cool', 600, 800),

  productCeramicVase: p('sand', 600, 800),
  productCushionSet: p('sand', 600, 800),

  fallback: p('neutral', 800, 600),
} as const;

/** Neutral product placeholder for empty galleries (no Unsplash). */
export const PLACEHOLDER_PRODUCT_IMAGE = DEFAULT_IMAGES.productGeneric;

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
