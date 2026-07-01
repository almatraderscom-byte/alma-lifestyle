import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ObsidianProductsListing } from '@/components/obsidian/ObsidianProductsListing';
import { AlmaBrandedLoader } from '@/components/layout/AlmaBrandedLoader';
import { CATEGORY_LABELS, type CategorySlug } from '@/lib/products-data';
import { buildCategoryListingMetadata } from '@/lib/seo/category-metadata';
import { loadCatalogProductsServer } from '@/lib/storefront/server-data';
import { resolveProductImageUrl } from '@/lib/default-images';

export const revalidate = 60;

function ProductsFallback() {
  return <AlmaBrandedLoader className="min-h-screen" />;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category as CategorySlug | undefined;
  const valid = category && category in CATEGORY_LABELS ? category : null;
  return buildCategoryListingMetadata(valid);
}

export default async function ProductsPage() {
  const { products } = await loadCatalogProductsServer({ limit: 200 });
  const stripImages = products
    .slice(0, 12)
    .map((p) => resolveProductImageUrl(p.images?.[0]?.url, p.slug, p.categorySlug));
  return (
    <Suspense fallback={<ProductsFallback />}>
      <ObsidianProductsListing initialProducts={products} stripImages={stripImages} />
    </Suspense>
  );
}
