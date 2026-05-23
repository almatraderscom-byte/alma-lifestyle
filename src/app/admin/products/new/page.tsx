'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductForm } from '@/components/admin/products/ProductForm';
import type { ProductType } from '@/lib/product-design-types';

const VALID_TYPES: ProductType[] = [
  'boy_panjabi',
  'women_three_piece',
  'girl_two_piece',
];

function NewProductForm() {
  const searchParams = useSearchParams();
  const productTypeParam = searchParams.get('productType');
  const productType =
    productTypeParam && VALID_TYPES.includes(productTypeParam as ProductType)
      ? (productTypeParam as ProductType)
      : undefined;

  const prefill =
    searchParams.get('designGroupId')
      ? {
          designGroupId: searchParams.get('designGroupId') ?? undefined,
          designGroupName: searchParams.get('designGroupName') ?? undefined,
          menSlug: searchParams.get('menSlug') ?? undefined,
          productType,
        }
      : undefined;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Add New Product</h1>
      <ProductForm prefill={prefill} />
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="text-neutral-500">Loading…</div>}>
      <NewProductForm />
    </Suspense>
  );
}
