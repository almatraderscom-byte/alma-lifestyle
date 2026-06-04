import {
  getProductBySlug as getCatalogProductBySlug,
  getStaticCustomLayoutProductBySlug,
  getStaticIslamicProductBySlug,
  type CatalogProduct,
} from '@/lib/products-data';
import { supabaseAdmin } from '../client';
import { getBrandId } from '../brand';
import { assertNoError } from './errors';
import { getCategoryBySlug } from './categories';
import { getPublishedProductBySlug } from './products';

const DEFAULT_USD_RATE = 110;
const DEFAULT_AED_RATE = 30;

function bdtToUsd(bdt: number): number {
  return Math.round((bdt / DEFAULT_USD_RATE) * 100) / 100;
}

function bdtToAed(bdt: number): number {
  return Math.round((bdt / DEFAULT_AED_RATE) * 100) / 100;
}

function resolveCatalogBySlug(slug: string): CatalogProduct | undefined {
  return (
    getStaticIslamicProductBySlug(slug) ??
    getStaticCustomLayoutProductBySlug(slug) ??
    getCatalogProductBySlug(slug)
  );
}

/** Ensures a storefront catalog product exists in Supabase for order_items FK. */
export async function ensureCatalogProductForOrder(slug: string): Promise<string> {
  const existing = await getPublishedProductBySlug(slug);
  if (existing?.id) return existing.id;

  const catalog = resolveCatalogBySlug(slug);
  if (!catalog) {
    throw new Error(`Catalog product not found for slug: ${slug}`);
  }

  const brandId = await getBrandId();
  const category =
    (await getCategoryBySlug(catalog.categorySlug)) ??
    (await getCategoryBySlug('accessories')) ??
    (await getCategoryBySlug('panjabi'));

  if (!category) {
    throw new Error(`No category available for catalog product: ${slug}`);
  }

  const sku = catalog.sku ?? `CAT-${slug.replace(/[^a-z0-9-]/gi, '-').slice(0, 80)}`;
  const priceBdt = catalog.price;
  const compareAt = catalog.compareAtPrice ?? null;

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      brand_id: brandId,
      category_id: category.id,
      sku,
      slug: catalog.slug,
      title: catalog.title,
      description: catalog.description?.slice(0, 2000) ?? catalog.title,
      price_bdt: priceBdt,
      compare_at_price_bdt: compareAt,
      price_usd: bdtToUsd(priceBdt),
      price_aed: bdtToAed(priceBdt),
      published: true,
      published_at: new Date().toISOString(),
    } as never)
    .select('id')
    .single();

  assertNoError(error, 'ensureCatalogProductForOrder');

  const id = (data as { id: string } | null)?.id;
  if (!id) {
    throw new Error(`Failed to create catalog product row for slug: ${slug}`);
  }

  return id;
}
