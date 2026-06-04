import { isDatabaseUuid } from '@/lib/admin-ids';
import {
  getStaticCustomLayoutProductBySlug,
  getStaticIslamicProductBySlug,
} from '@/lib/products-data';
import type { CatalogProduct } from '@/lib/products-data';
import { supabaseAdmin } from '../client';
import { assertNoError } from './errors';
import { getPublishedProductBySlug } from './products';
import type { ProductWithRelations } from '../schema';

export interface ProductLivePrice {
  price: number;
  originalPrice: number;
  salePrice: number | null;
  isAvailable: boolean;
  title: string;
}

function isProductAvailable(product: ProductWithRelations): boolean {
  if (!product.published) return false;
  const variants = product.product_variants ?? [];
  if (variants.length === 0) return true;
  return variants.some((v) => (v.stock_quantity ?? 0) > 0);
}

function resolveSellingPriceBdt(product: ProductWithRelations): number {
  const ext = product as ProductWithRelations & { compare_at_price_bdt?: number | null };
  const compare = ext.compare_at_price_bdt;
  if (compare != null && compare > 0 && compare < Number(product.price_bdt)) {
    return Number(compare);
  }
  return Number(product.price_bdt);
}

function mapDbRowToLivePrice(product: ProductWithRelations): ProductLivePrice {
  const selling = resolveSellingPriceBdt(product);
  const original = Number(product.price_bdt);
  return {
    price: selling,
    originalPrice: original,
    salePrice: selling < original ? selling : null,
    isAvailable: isProductAvailable(product),
    title: product.title,
  };
}

function mapCatalogToLivePrice(product: CatalogProduct): ProductLivePrice {
  const original = product.compareAtPrice ?? product.price;
  const selling = product.price;
  return {
    price: selling,
    originalPrice: original,
    salePrice: original > selling ? selling : null,
    isAvailable: true,
    title: product.title,
  };
}

async function resolveStaticOrSlugPrice(key: string): Promise<ProductLivePrice | null> {
  const staticProduct =
    getStaticIslamicProductBySlug(key) ??
    getStaticCustomLayoutProductBySlug(key);
  if (staticProduct) return mapCatalogToLivePrice(staticProduct);

  const row = await getPublishedProductBySlug(key);
  if (row) return mapDbRowToLivePrice(row);

  return null;
}

/** Live prices keyed by the same id the cart uses (UUID or catalog slug id). */
export async function getProductsLivePrices(
  identifiers: string[]
): Promise<Record<string, ProductLivePrice>> {
  if (!identifiers.length) return {};

  const unique = [...new Set(identifiers)];
  const prices: Record<string, ProductLivePrice> = {};

  const uuidKeys = unique.filter((k) => isDatabaseUuid(k));
  const otherKeys = unique.filter((k) => !isDatabaseUuid(k));

  if (uuidKeys.length) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(
        'id, title, price_bdt, compare_at_price_bdt, published, product_variants (stock_quantity)'
      )
      .in('id', uuidKeys);

    assertNoError(error, 'getProductsLivePrices');

    for (const row of data ?? []) {
      const product = row as ProductWithRelations;
      prices[product.id] = mapDbRowToLivePrice(product);
    }
  }

  await Promise.all(
    otherKeys.map(async (key) => {
      const live = await resolveStaticOrSlugPrice(key);
      if (live) prices[key] = live;
    })
  );

  return prices;
}
