'use client';

import { ProductForm } from '@/components/admin/products/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Add New Product</h1>
      <ProductForm />
    </div>
  );
}
