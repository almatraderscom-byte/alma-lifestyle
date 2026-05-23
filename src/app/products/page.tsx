import { Suspense } from 'react';
import { ProductsListing } from '@/components/product/ProductsListing';

function ProductsFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center font-bn-body text-text-light">
      লোড হচ্ছে...
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsFallback />}>
      <ProductsListing />
    </Suspense>
  );
}
