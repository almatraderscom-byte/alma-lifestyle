import { Suspense } from 'react';
import { ProductsListing } from '@/components/product/ProductsListing';
import {
  loadCatalogProductsServer,
  loadCategoriesServer,
} from '@/lib/storefront/server-data';

export const revalidate = 60;

function ProductsFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center font-bn-body text-text-light">
      লোড হচ্ছে...
    </div>
  );
}

export default async function ProductsPage() {
  const [{ products }, categories] = await Promise.all([
    loadCatalogProductsServer({ limit: 200 }),
    loadCategoriesServer(),
  ]);
  return (
    <Suspense fallback={<ProductsFallback />}>
      <ProductsListing initialProducts={products} categories={categories} />
    </Suspense>
  );
}
