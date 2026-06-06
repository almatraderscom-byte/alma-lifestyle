import type { MurdaMoshariContent } from '@/lib/landing-content-types';
import type { CatalogProduct } from '@/lib/products-data';

export type MurdaProductPricingSource = Pick<CatalogProduct, 'price' | 'compareAtPrice'>;

/** Product catalog is the single source of truth for Murda landing prices. */
export function syncMurdaPricingFromProduct(
  content: MurdaMoshariContent,
  product: MurdaProductPricingSource
): MurdaMoshariContent {
  const offerPrice = Math.max(0, Math.round(product.price));
  const compareAt =
    product.compareAtPrice != null ? Math.max(0, Math.round(product.compareAtPrice)) : null;
  const originalPrice =
    compareAt != null && compareAt > offerPrice ? compareAt : offerPrice;

  return {
    ...content,
    pricing: {
      ...content.pricing,
      offerPrice,
      originalPrice,
    },
  };
}

export function murdaPricingFromDbProduct(product: {
  price_bdt: number | string;
  compare_at_price_bdt?: number | string | null;
}): MurdaProductPricingSource {
  const price = Math.round(Number(product.price_bdt));
  const compareRaw = product.compare_at_price_bdt;
  const compareAtPrice =
    compareRaw != null && compareRaw !== '' ? Math.round(Number(compareRaw)) : undefined;

  return {
    price,
    compareAtPrice:
      compareAtPrice != null && !Number.isNaN(compareAtPrice) ? compareAtPrice : undefined,
  };
}
