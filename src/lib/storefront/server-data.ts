import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { getBrandId } from '@/server/db/brand';
import { getCategories } from '@/server/db/queries/categories';
import { getProducts, getProductBySlug, getFeaturedProducts } from '@/server/db/queries/products';
import { getHomepageConfigOrDefault } from '@/server/db/queries/homepage';
import { getAppSettings } from '@/server/db/queries/homepage';
import { mapDbProductToCatalog } from '@/lib/mappers/catalog-product';
import {
  CATALOG_PRODUCTS,
  getProductBySlug as getStaticProductBySlug,
  getAllProductSlugs as getStaticSlugs,
  type CatalogProduct,
} from '@/lib/products-data';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import type { HomepageConfig } from '@/lib/homepage-config-types';
import { getDefaultAppSettings } from '@/lib/admin-settings-types';
import type { AppSettings } from '@/lib/admin-settings-types';
import type { Category } from '@/server/db/schema';

export const STOREFRONT_REVALIDATE = 60;

export async function loadHomepageConfigServer(): Promise<HomepageConfig> {
  if (!isSupabaseAdminConfigured()) {
    return getDefaultHomepageConfig();
  }
  try {
    return await getHomepageConfigOrDefault();
  } catch {
    return getDefaultHomepageConfig();
  }
}

export async function loadPublicSettingsServer(): Promise<AppSettings> {
  if (!isSupabaseAdminConfigured()) {
    return getDefaultAppSettings();
  }
  try {
    return (await getAppSettings()) ?? getDefaultAppSettings();
  } catch {
    return getDefaultAppSettings();
  }
}

export async function loadCategoriesServer(): Promise<Category[]> {
  if (!isSupabaseAdminConfigured()) return [];
  try {
    const brandId = await getBrandId();
    return getCategories(brandId);
  } catch {
    return [];
  }
}

export async function loadCatalogProductsServer(options?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}): Promise<{ products: CatalogProduct[]; total: number }> {
  if (!isSupabaseAdminConfigured()) {
    return { products: CATALOG_PRODUCTS, total: CATALOG_PRODUCTS.length };
  }

  try {
    const brandId = await getBrandId();
    const categories = await getCategories(brandId);
    const catById = new Map(categories.map((c) => [c.id, c]));

    const result = await getProducts({
      page: options?.page ?? 1,
      limit: options?.limit ?? 100,
      categoryId: options?.categoryId,
      published: true,
      search: options?.search,
    });

    const products = result.data.map((row, i) =>
      mapDbProductToCatalog(row, catById.get(row.category_id), i)
    );

    return { products, total: result.total };
  } catch {
    return { products: CATALOG_PRODUCTS, total: CATALOG_PRODUCTS.length };
  }
}

export async function loadProductBySlugServer(
  slug: string
): Promise<CatalogProduct | null> {
  if (!isSupabaseAdminConfigured()) {
    return getStaticProductBySlug(slug) ?? null;
  }

  try {
    const row = await getProductBySlug(slug);
    if (!row || !row.published) return getStaticProductBySlug(slug) ?? null;

    const brandId = await getBrandId();
    const categories = await getCategories(brandId);
    const category = categories.find((c) => c.id === row.category_id);

    return mapDbProductToCatalog(row, category);
  } catch {
    return getStaticProductBySlug(slug) ?? null;
  }
}

export async function loadAllProductSlugsServer(): Promise<string[]> {
  if (!isSupabaseAdminConfigured()) {
    return getStaticSlugs();
  }

  try {
    const result = await getProducts({ page: 1, limit: 500, published: true });
    return result.data.map((p) => p.slug);
  } catch {
    return getStaticSlugs();
  }
}

export async function loadFeaturedProductsServer(limit: number): Promise<CatalogProduct[]> {
  if (!isSupabaseAdminConfigured()) {
    return CATALOG_PRODUCTS.slice(0, limit);
  }

  try {
    const brandId = await getBrandId();
    const categories = await getCategories(brandId);
    const catById = new Map(categories.map((c) => [c.id, c]));
    const rows = await getFeaturedProducts(limit);
    return rows.map((row, i) => mapDbProductToCatalog(row, catById.get(row.category_id), i));
  } catch {
    return CATALOG_PRODUCTS.slice(0, limit);
  }
}
