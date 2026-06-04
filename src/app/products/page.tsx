import { Suspense } from 'react';
import ProductsLoading from './loading';
import { ProductsListing } from '@/components/product/ProductsListing';
import { loadCatalogProductsServer } from '@/lib/storefront/server-data';

export const revalidate = 60;

export default async function ProductsPage() {
  const { products } = await loadCatalogProductsServer({ limit: 200 });
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsListing initialProducts={products} />
    </Suspense>
  );
}
