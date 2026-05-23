import { Suspense } from 'react';
import { ProductsListing } from '@/components/product/ProductsListing';
import { loadCatalogProductsServer } from '@/lib/storefront/server-data';

export const revalidate = 60;

function ProductsFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center font-bn-body text-text-light">
      লোড হচ্ছে...
    </div>
  );
}

export default async function ProductsPage() {
  const { products } = await loadCatalogProductsServer({ limit: 200 });
  return (
    <Suspense fallback={<ProductsFallback />}>
      <ProductsListing initialProducts={products} />
    </Suspense>
  );
}
