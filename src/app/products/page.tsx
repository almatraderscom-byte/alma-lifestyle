import { Suspense } from 'react';
import { ProductsListing } from '@/components/product/ProductsListing';
import { loadCatalogProductsServer } from '@/lib/storefront/server-data';
import type { CategorySlug } from '@/lib/products-data';
import { CATEGORY_LABELS } from '@/lib/products-data';

export const revalidate = 60;

function ProductsFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center font-bn-body text-text-light">
      লোড হচ্ছে...
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categorySlug =
    category && category in CATEGORY_LABELS ? (category as CategorySlug) : undefined;

  const { products } = await loadCatalogProductsServer({
    limit: 200,
    categorySlug,
  });

  return (
    <Suspense fallback={<ProductsFallback />}>
      <ProductsListing initialProducts={products} />
    </Suspense>
  );
}
