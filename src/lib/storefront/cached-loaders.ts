import { unstable_cache } from 'next/cache';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { getDefaultHomepageConfig, ensureHomepageConfig } from '@/lib/homepage-config';
import { getDefaultAppSettings } from '@/lib/admin-settings-types';
import { getDefaultCinematicContent } from '@/lib/cinematic-content-defaults';
import {
  categoryToNavItem,
  getStaticCategoryNavItems,
  type HeaderNavItem,
} from '@/lib/nav-menu';
import {
  groupProductsForListing,
  mapDbProductToCatalog,
} from '@/lib/mappers/catalog-product';
import {
  CATALOG_PRODUCTS,
  getStaticCustomLayoutProducts,
  getStaticIslamicProducts,
  mergeStaticProductOverrides,
  type CatalogProduct,
  type CategorySlug,
} from '@/lib/products-data';
import { shouldLoadCatalogFromDatabase } from '@/lib/storefront/catalog-source';
import { CACHE_TAGS, STOREFRONT_CACHE_SECONDS } from '@/lib/storefront/cache-tags';
import { withTimeout } from '@/lib/server/with-timeout';
import { getBrandId } from '@/server/db/brand';
import { getCategories, getMenuCategories } from '@/server/db/queries/categories';
import { getCinematicContentOrDefault } from '@/server/db/queries/cinematic-content';
import { getHomepageConfigOrDefault, getAppSettings } from '@/server/db/queries/homepage';
import { getProducts } from '@/server/db/queries/products';
import type { AppSettings } from '@/lib/admin-settings-types';
import type { Category } from '@/server/db/schema';
import type { CinematicContent } from '@/lib/cinematic-content-types';
import type { HomepageConfig } from '@/lib/homepage-config-types';

const loadPublicSettingsCached = unstable_cache(
  async (): Promise<AppSettings> => {
    try {
      return (await withTimeout('getAppSettings', getAppSettings())) ?? getDefaultAppSettings();
    } catch {
      return getDefaultAppSettings();
    }
  },
  ['storefront-settings'],
  { revalidate: STOREFRONT_CACHE_SECONDS, tags: [CACHE_TAGS.settings] }
);

const loadCategoriesCached = unstable_cache(
  async (): Promise<Category[]> => {
    try {
      const brandId = await getBrandId();
      return await withTimeout('getCategories', getCategories(brandId));
    } catch {
      return [];
    }
  },
  ['storefront-categories'],
  { revalidate: STOREFRONT_CACHE_SECONDS, tags: [CACHE_TAGS.categories, CACHE_TAGS.brand] }
);

const loadHeaderNavCached = unstable_cache(
  async (): Promise<HeaderNavItem[]> => {
    try {
      const brandId = await getBrandId();
      const menuCategories = await withTimeout(
        'getMenuCategories',
        getMenuCategories(brandId, 12)
      );
      if (!menuCategories.length) return getStaticCategoryNavItems();
      return menuCategories.map(categoryToNavItem);
    } catch {
      return getStaticCategoryNavItems();
    }
  },
  ['storefront-nav'],
  { revalidate: STOREFRONT_CACHE_SECONDS, tags: [CACHE_TAGS.nav, CACHE_TAGS.categories] }
);

const loadStoredHomepageConfigCached = unstable_cache(
  async (): Promise<HomepageConfig> => {
    const stored = await withTimeout('getHomepageConfigOrDefault', getHomepageConfigOrDefault());
    return ensureHomepageConfig(stored);
  },
  ['storefront-homepage-config'],
  { revalidate: STOREFRONT_CACHE_SECONDS, tags: [CACHE_TAGS.homepage] }
);

const loadCinematicContentCached = unstable_cache(
  async (): Promise<CinematicContent> =>
    withTimeout('getCinematicContentOrDefault', getCinematicContentOrDefault()),
  ['storefront-cinematic-content'],
  { revalidate: STOREFRONT_CACHE_SECONDS, tags: [CACHE_TAGS.cinematic] }
);

type CatalogCacheOptions = {
  page: number;
  limit: number;
  categoryId: string;
  categorySlug: string;
  search: string;
};

async function loadCatalogProductsUncached(
  options: CatalogCacheOptions
): Promise<{ products: CatalogProduct[]; total: number }> {
  const brandId = await getBrandId();
  const categories = await getCategories(brandId);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const categoryId =
    options.categoryId ||
    (options.categorySlug
      ? categories.find((c) => c.slug.toLowerCase() === options.categorySlug.toLowerCase())?.id
      : undefined);

  const result = await withTimeout(
    'getProducts',
    getProducts({
      page: options.page,
      limit: options.limit,
      categoryId,
      published: true,
      search: options.search || undefined,
    })
  );

  const products = groupProductsForListing(result.data, catById).map(mergeStaticProductOverrides);
  const seen = new Set(products.map((p) => p.slug));
  for (const staticProduct of [
    ...getStaticIslamicProducts(),
    ...getStaticCustomLayoutProducts(),
  ]) {
    if (!seen.has(staticProduct.slug)) {
      products.push(mergeStaticProductOverrides(staticProduct));
      seen.add(staticProduct.slug);
    }
  }

  const filtered = options.categorySlug
    ? products.filter(
        (p) => p.categorySlug.toLowerCase() === options.categorySlug.toLowerCase()
      )
    : products;

  return { products: filtered, total: filtered.length };
}

const loadCatalogProductsCached = unstable_cache(
  async (cacheKey: string) => loadCatalogProductsUncached(JSON.parse(cacheKey)),
  ['storefront-catalog'],
  { revalidate: STOREFRONT_CACHE_SECONDS, tags: [CACHE_TAGS.catalog, CACHE_TAGS.categories] }
);

function catalogFallback(): { products: CatalogProduct[]; total: number } {
  const fallback = [...getStaticIslamicProducts(), ...getStaticCustomLayoutProducts()];
  const seen = new Set<string>();
  const products = fallback.filter((p) => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
  return { products, total: products.length };
}

export async function getCachedPublicSettings(): Promise<AppSettings> {
  if (!isSupabaseAdminConfigured()) return getDefaultAppSettings();
  return loadPublicSettingsCached();
}

export async function getCachedCategories(): Promise<Category[]> {
  if (!isSupabaseAdminConfigured()) return [];
  return loadCategoriesCached();
}

export async function getCachedHeaderNavItems(): Promise<HeaderNavItem[]> {
  if (!isSupabaseAdminConfigured()) return getStaticCategoryNavItems();
  return loadHeaderNavCached();
}

export async function getCachedStoredHomepageConfig(): Promise<HomepageConfig> {
  if (!isSupabaseAdminConfigured()) return getDefaultHomepageConfig();
  try {
    return await loadStoredHomepageConfigCached();
  } catch {
    return getDefaultHomepageConfig();
  }
}

export async function getCachedCinematicContent(): Promise<CinematicContent> {
  if (!isSupabaseAdminConfigured()) return getDefaultCinematicContent();
  try {
    return await loadCinematicContentCached();
  } catch {
    return getDefaultCinematicContent();
  }
}

export async function getCachedCatalogProducts(options?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  categorySlug?: CategorySlug;
  search?: string;
}): Promise<{ products: CatalogProduct[]; total: number }> {
  if (!shouldLoadCatalogFromDatabase()) {
    let products = CATALOG_PRODUCTS;
    if (options?.categorySlug) {
      products = products.filter((p) => p.categorySlug === options.categorySlug);
    }
    return { products, total: products.length };
  }

  try {
    const cacheKey = JSON.stringify({
      page: options?.page ?? 1,
      limit: options?.limit ?? 100,
      categoryId: options?.categoryId ?? '',
      categorySlug: options?.categorySlug ?? '',
      search: options?.search ?? '',
    });
    return await loadCatalogProductsCached(cacheKey);
  } catch (err) {
    console.error('[storefront] getCachedCatalogProducts failed:', err);
    return catalogFallback();
  }
}
