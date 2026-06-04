import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductsListing } from '@/components/product/ProductsListing';
import { CATEGORY_LABELS, type CategorySlug } from '@/lib/products-data';
import { buildCategoryListingMetadata } from '@/lib/seo/category-metadata';
import { loadCatalogProductsServer } from '@/lib/storefront/server-data';

export const revalidate = 60;

function ProductsFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center font-bn-body text-text-light">
      লোড হচ্ছে...
    </div>
  );
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
  return (
    <Suspense fallback={<ProductsFallback />}>
      <ProductsListing initialProducts={products} />
    </Suspense>
  );
}
