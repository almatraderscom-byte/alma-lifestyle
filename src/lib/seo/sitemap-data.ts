import { COLLECTIONS } from '@/lib/shop/mock-data';
import { CATALOG_PRODUCTS, CATEGORY_LABELS, type CategorySlug } from '@/lib/products-data';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { getBrandId } from '@/server/db/brand';
import { getCategories } from '@/server/db/queries/categories';
import { getPublishedCollections } from '@/server/db/queries/collections';
import { getProducts } from '@/server/db/queries/products';

export type SitemapEntryInput = {
  path: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
};

export async function loadSitemapEntries(): Promise<SitemapEntryInput[]> {
  const now = new Date();
  const entries: SitemapEntryInput[] = [
    { path: '/', lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { path: '/products', lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { path: '/collections', lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];

  if (!isSupabaseAdminConfigured()) {
    for (const product of CATALOG_PRODUCTS) {
      entries.push({
        path: `/products/${product.slug}`,
        lastModified: new Date(product.createdAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
    // TODO(ARCH-001): replace mock collection slugs when storefront collections use Supabase.
    for (const collection of COLLECTIONS) {
      entries.push({
        path: `/collections/${collection.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.75,
      });
    }
    for (const slug of Object.keys(CATEGORY_LABELS) as CategorySlug[]) {
      entries.push({
        path: `/products?category=${slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.65,
      });
    }
    return entries;
  }

  try {
    const brandId = await getBrandId();

    const productResult = await getProducts({
      page: 1,
      limit: 500,
      published: true,
    });

    for (const row of productResult.data) {
      entries.push({
        path: `/products/${row.slug}`,
        lastModified: new Date(row.updated_at),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    const collections = await getPublishedCollections(brandId);
    if (collections.length > 0) {
      for (const collection of collections) {
        entries.push({
          path: `/collections/${collection.slug}`,
          lastModified: new Date(collection.updated_at),
          changeFrequency: 'weekly',
          priority: 0.75,
        });
      }
    } else {
      // TODO(ARCH-001): remove mock slugs once collections page reads Supabase.
      for (const collection of COLLECTIONS) {
        entries.push({
          path: `/collections/${collection.slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.75,
        });
      }
    }

    const categories = await getCategories(brandId);
    for (const category of categories) {
      entries.push({
        path: `/products?category=${category.slug}`,
        lastModified: new Date(category.updated_at),
        changeFrequency: 'weekly',
        priority: 0.65,
      });
    }
  } catch {
    /* fall back to static catalog on DB errors */
    for (const product of CATALOG_PRODUCTS) {
      entries.push({
        path: `/products/${product.slug}`,
        lastModified: new Date(product.createdAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
    for (const collection of COLLECTIONS) {
      entries.push({
        path: `/collections/${collection.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.75,
      });
    }
  }

  return entries;
}
