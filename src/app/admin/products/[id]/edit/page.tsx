'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getProductById, type AdminProduct } from '@/lib/admin-store';
import { ProductForm } from '@/components/admin/products/ProductForm';

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductById(id)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-neutral-500">Loading product…</p>;
  }

  if (!product) {
    return (
      <div className="py-12 text-center">
        <p className="text-neutral-600">Product not found.</p>
        <Link href="/admin/products" className="text-[#C97D5D] mt-4 inline-block">
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Edit Product</h1>
      <ProductForm initial={product} isEdit />
    </div>
  );
}
