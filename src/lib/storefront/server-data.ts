import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { getBrandId } from '@/server/db/brand';
import { getCategories } from '@/server/db/queries/categories';
import { getProducts, getProductBySlug, getFeaturedProducts } from '@/server/db/queries/products';
import { getHomepageConfigOrDefault } from '@/server/db/queries/homepage';
import { getAppSettings } from '@/server/db/queries/homepage';
import {
  groupProductsForListing,
  mapDbProductToCatalog,
} from '@/lib/mappers/catalog-product';
import { getDesignGroupBySlug } from '@/server/db/queries/design-groups';
import {
  CATALOG_PRODUCTS,
  getProductBySlug as getStaticProductBySlug,
  getAllProductSlugs as getStaticSlugs,
  type CatalogProduct,
} from '@/lib/products-data';
import { ensureHomepageConfig, getDefaultHomepageConfig } from '@/lib/homepage-config';
import type {
  CategoriesSectionData,
  CategoryCardConfig,
  FeaturedSectionData,
  HomepageConfig,
} from '@/lib/homepage-config-types';
import type { FeaturedProduct } from '@/lib/content';
import { toCardProduct } from '@/lib/products-data';
import { getDefaultAppSettings } from '@/lib/admin-settings-types';
import type { AppSettings } from '@/lib/admin-settings-types';
import type { Category } from '@/server/db/schema';
import type { StorefrontNavCategory } from '@/lib/storefront/categories';

export const STOREFRONT_REVALIDATE = 60;

function enrichCategoryCard(
  card: CategoryCardConfig,
  categories: Category[],
  countBySlug: Map<string, number>
): CategoryCardConfig {
  const dbCat = categories.find((c) => c.slug === card.categorySlug);
  const count = countBySlug.get(card.categorySlug) ?? 0;
  return {
    ...card,
    displayName: dbCat?.name ?? card.displayName,
    href: dbCat ? `/products?category=${dbCat.slug}` : card.href,
    subtitle:
      count > 0
        ? `${count} ${count === 1 ? 'পণ্য' : 'পণ্য'}`
        : card.subtitle,
  };
}

async function enrichHomepageCategories(
  config: HomepageConfig,
  categories: Category[],
  products: CatalogProduct[]
): Promise<HomepageConfig> {
  if (!categories.length) return config;

  const countBySlug = new Map<string, number>();
  for (const p of products) {
    countBySlug.set(p.categorySlug, (countBySlug.get(p.categorySlug) ?? 0) + 1);
  }

  return {
    ...config,
    sections: config.sections.map((section) => {
      if (section.id !== 'categories') return section;
      const data = section.data as CategoriesSectionData;
      return {
        ...section,
        data: {
          ...data,
          featured: enrichCategoryCard(data.featured, categories, countBySlug),
          stacked: data.stacked.map((c) =>
            enrichCategoryCard(c, categories, countBySlug)
          ) as CategoriesSectionData['stacked'],
        },
      };
    }),
  };
}

export async function loadHomepageConfigServer(): Promise<HomepageConfig> {
  if (!isSupabaseAdminConfigured()) {
    return getDefaultHomepageConfig();
  }
  try {
    const stored = await getHomepageConfigOrDefault();
    let config = ensureHomepageConfig(stored);
    const categories = await fetchActiveCategories();
    const { products } = await loadCatalogProductsServer({ limit: 500 });
    config = await enrichHomepageCategories(config, categories, products);
    return config;
  } catch {
    return getDefaultHomepageConfig();
  }
}

export async function resolveFeaturedProductsServer(
  data: FeaturedSectionData
): Promise<FeaturedProduct[]> {
  const limit = data.productCount;

  if (!isSupabaseAdminConfigured()) {
    const { CATALOG_PRODUCTS } = await import('@/lib/products-data');
    return CATALOG_PRODUCTS.slice(0, limit).map((p, i) => ({
      ...toCardProduct(p),
      layout: (i % 2 === 1 ? 'tall' : 'normal') as 'normal' | 'tall',
    }));
  }

  try {
    const { products } = await loadCatalogProductsServer({ limit: 200 });
    let list = [...products];

    if (data.source === 'latest') {
      list.sort((a, b) => b.createdAt - a.createdAt);
    } else if (data.source === 'bestsellers') {
      list.sort((a, b) => b.popularScore - a.popularScore);
    } else if (data.manualProductIds.length > 0) {
      const byId = new Map(products.map((p) => [p.id, p]));
      list = data.manualProductIds
        .map((id) => byId.get(id))
        .filter((p): p is CatalogProduct => !!p);
    }

    if (list.length === 0) {
      list = await loadFeaturedProductsServer(limit);
    }

    return list.slice(0, limit).map((p, i) => ({
      ...toCardProduct(p),
      layout: (i % 2 === 1 ? 'tall' : 'normal') as 'normal' | 'tall',
    }));
  } catch {
    const fallback = await loadFeaturedProductsServer(limit);
    return fallback.map((p, i) => ({
      ...toCardProduct(p),
      layout: (i % 2 === 1 ? 'tall' : 'normal') as 'normal' | 'tall',
    }));
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

/** Active categories from Supabase (`display_order`, then `name`). */
async function fetchActiveCategories(): Promise<Category[]> {
  if (!isSupabaseAdminConfigured()) return [];
  try {
    const brandId = await getBrandId();
    return getCategories(brandId);
  } catch {
    return [];
  }
}

/**
 * Published categories for header/footer/filters with per-slug product counts.
 * Sorted by `categories.display_order` (see getCategories).
 */
export async function loadCategoriesServer(): Promise<StorefrontNavCategory[]> {
  const rows = await fetchActiveCategories();
  if (rows.length === 0) return [];

  const countBySlug = new Map<string, number>();
  if (isSupabaseAdminConfigured()) {
    try {
      const { products } = await loadCatalogProductsServer({ limit: 500 });
      for (const p of products) {
        countBySlug.set(p.categorySlug, (countBySlug.get(p.categorySlug) ?? 0) + 1);
      }
    } catch {
      // counts stay 0
    }
  }

  return rows.map((c) => ({
    slug: c.slug,
    name: c.name,
    nameBn: c.name,
    productCount: countBySlug.get(c.slug) ?? 0,
  }));
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

    const products = groupProductsForListing(result.data, catById);

    return { products, total: products.length };
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
    const group = await getDesignGroupBySlug(slug);
    if (!group) return getStaticProductBySlug(slug) ?? null;

    const row = group.members.find((m) => m.slug === slug) ?? group.anchor;
    if (!row.published) return getStaticProductBySlug(slug) ?? null;

    const brandId = await getBrandId();
    const categories = await getCategories(brandId);
    const category = categories.find((c) => c.id === row.category_id);

    const catalog = mapDbProductToCatalog(row, category);
    if (group.members.length > 1) {
      catalog.designGroupMembers = group.members.map((m, i) =>
        mapDbProductToCatalog(m, category, i)
      );
      catalog.designGroupId = group.anchor.design_group_id ?? group.anchor.id;
      catalog.designGroupName =
        group.anchor.design_group_name ?? group.anchor.title;
    }
    return catalog;
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
