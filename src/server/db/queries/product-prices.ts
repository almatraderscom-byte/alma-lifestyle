import { supabaseAdmin } from '../client';
import { assertNoError } from './errors';
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

export async function getProductsLivePrices(
  ids: string[]
): Promise<Record<string, ProductLivePrice>> {
  if (!ids.length) return {};

  const unique = [...new Set(ids)];
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, title, price_bdt, compare_at_price_bdt, published, product_variants (stock_quantity)')
    .in('id', unique);

  assertNoError(error, 'getProductsLivePrices');

  const prices: Record<string, ProductLivePrice> = {};
  for (const row of data ?? []) {
    const product = row as ProductWithRelations;
    const selling = resolveSellingPriceBdt(product);
    const original = Number(product.price_bdt);
    prices[product.id] = {
      price: selling,
      originalPrice: original,
      salePrice: selling < original ? selling : null,
      isAvailable: isProductAvailable(product),
      title: product.title,
    };
  }
  return prices;
}
