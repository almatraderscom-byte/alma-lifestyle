import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { getBrandId } from '@/server/db/brand';
import { getCategories, getMenuCategories } from '@/server/db/queries/categories';
import {
  categoryToNavItem,
  getStaticCategoryNavItems,
  type HeaderNavItem,
} from '@/lib/nav-menu';
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
import {
  dedupeFeaturedCatalogProducts,
  sanitizeFeaturedSectionData,
} from '@/lib/featured-products';
import { toCardProduct } from '@/lib/products-data';
import { getDefaultAppSettings } from '@/lib/admin-settings-types';
import type { AppSettings } from '@/lib/admin-settings-types';
import type { Category, ProductWithRelations } from '@/server/db/schema';

export const STOREFRONT_REVALIDATE = 60;

async function loadRawPublishedProductRows(): Promise<{
  rows: ProductWithRelations[];
  catById: Map<string, Category>;
}> {
  const brandId = await getBrandId();
  const categories = await getCategories(brandId);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const result = await getProducts({ page: 1, limit: 500, published: true });
  return { rows: result.data, catById };
}

function sortCatalogByNewest(list: CatalogProduct[]): CatalogProduct[] {
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

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
    const categories = await loadCategoriesServer();
    const { products } = await loadCatalogProductsServer({ limit: 200 });
    config = await enrichHomepageCategories(config, categories, products);
    return config;
  } catch {
    return getDefaultHomepageConfig();
  }
}

export async function resolveFeaturedProductsServer(
  data: FeaturedSectionData
): Promise<FeaturedProduct[]> {
  const section = sanitizeFeaturedSectionData(data);
  const limit = section.productCount;

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

    if (section.source === 'latest') {
      list = sortCatalogByNewest(list);
    } else if (section.source === 'bestsellers') {
      list = [...list].sort((a, b) => b.popularScore - a.popularScore);
    } else if (section.source === 'manual' && section.manualProductIds.length > 0) {
      const { rows, catById } = await loadRawPublishedProductRows();
      const byId = new Map(rows.map((r) => [r.id, r]));
      const selectedRows = section.manualProductIds
        .map((id) => byId.get(id))
        .filter((r): r is ProductWithRelations => !!r);

      if (selectedRows.length > 0) {
        list = groupProductsForListing(selectedRows, catById);
        const deduped = dedupeFeaturedCatalogProducts(list, limit);
        if (deduped.length < limit) {
          const seen = new Set(deduped.map((p) => p.designGroupId ?? p.slug ?? p.id));
          for (const candidate of sortCatalogByNewest(products)) {
            if (deduped.length >= limit) break;
            const key = candidate.designGroupId ?? candidate.slug ?? candidate.id;
            if (seen.has(key)) continue;
            seen.add(key);
            deduped.push(candidate);
          }
        }
        list = deduped;
      } else {
        list = sortCatalogByNewest(products);
      }
    } else {
      list = sortCatalogByNewest(list);
    }

    if (list.length === 0) {
      list = sortCatalogByNewest(products);
    }

    list = dedupeFeaturedCatalogProducts(list, limit);

    return list.slice(0, limit).map((p, i) => ({
      ...toCardProduct(p),
      layout: (i % 2 === 1 ? 'tall' : 'normal') as 'normal' | 'tall',
    }));
  } catch {
    const { products } = await loadCatalogProductsServer({ limit: 200 });
    const fallback = dedupeFeaturedCatalogProducts(
      sortCatalogByNewest(products),
      limit
    );
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

export async function loadCategoriesServer(): Promise<Category[]> {
  if (!isSupabaseAdminConfigured()) return [];
  try {
    const brandId = await getBrandId();
    return getCategories(brandId);
  } catch {
    return [];
  }
}

/** Header category dropdown: up to 12 menu categories from DB, or static fallback. */
export async function loadHeaderNavItemsServer(): Promise<HeaderNavItem[]> {
  if (!isSupabaseAdminConfigured()) {
    return getStaticCategoryNavItems();
  }
  try {
    const brandId = await getBrandId();
    const menuCategories = await getMenuCategories(brandId, 12);
    if (!menuCategories.length) {
      return getStaticCategoryNavItems();
    }
    return menuCategories.map(categoryToNavItem);
  } catch {
    return getStaticCategoryNavItems();
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

export type OceanCardProduct = ReturnType<typeof toCardProduct> & {
  designGroupName?: string;
};

const BESTSELLER_TAGS = new Set(['bestseller', 'জনপ্রিয়', 'popular']);

function isBestsellerProduct(product: CatalogProduct): boolean {
  const tags = product.tags ?? [];
  return tags.some((t) => BESTSELLER_TAGS.has(t.toLowerCase()));
}

/** Distinct published products for the floating ocean (bestseller-tagged or top popular). */
export async function loadOceanProductsServer(limit = 12): Promise<OceanCardProduct[]> {
  const { products } = await loadCatalogProductsServer({ limit: 120, page: 1 });
  const sorted = [...products].sort((a, b) => {
    const aBest = isBestsellerProduct(a) ? 1 : 0;
    const bBest = isBestsellerProduct(b) ? 1 : 0;
    if (bBest !== aBest) return bBest - aBest;
    return b.popularScore - a.popularScore;
  });

  const seenIds = new Set<string>();
  const seenImageUrls = new Set<string>();
  const out: OceanCardProduct[] = [];

  for (const catalog of sorted) {
    if (seenIds.has(catalog.id)) continue;
    const card = toCardProduct(catalog);
    const imageUrl = card.galleryImages?.[0]?.url?.trim();
    if (imageUrl && seenImageUrls.has(imageUrl)) continue;

    seenIds.add(catalog.id);
    if (imageUrl) seenImageUrls.add(imageUrl);

    out.push({
      ...card,
      designGroupName: catalog.designGroupName,
    });
    if (out.length >= limit) break;
  }

  return out;
}
