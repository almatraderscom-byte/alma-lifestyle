'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { isDatabaseUuid, isLegacyLocalId } from '@/lib/admin-ids';
import { shouldUseApi } from '@/lib/data-source';
import { getProductById, type AdminProduct } from '@/lib/admin-store';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { AdminCustomerLink } from '@/components/admin/AdminCustomerLink';

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setLoadError(null);
    console.log('[EditProduct] Loading id:', id, 'useApi:', shouldUseApi());
    if (shouldUseApi() && isLegacyLocalId(id)) {
      setLoadError(
        'This link uses an old localStorage product ID. Open Products and click Edit again to use the Supabase UUID.'
      );
      setLoading(false);
      return;
    }
    if (shouldUseApi() && !isDatabaseUuid(id)) {
      setLoadError('Invalid product ID in URL. Expected a UUID from the database.');
      setLoading(false);
      return;
    }
    getProductById(id)
      .then((p) => {
        console.log('[EditProduct] Loaded:', p?.title ?? 'not found');
        setProduct(p);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-neutral-500">Loading product…</p>;
  }

  if (loadError || !product) {
    return (
      <div className="py-12 text-center max-w-lg mx-auto space-y-3">
        <p className="text-neutral-800 font-medium">
          {loadError ?? 'Product not found.'}
        </p>
        {shouldUseApi() && isLegacyLocalId(id) && (
          <p className="text-sm text-neutral-600">
            Tip: If you recently enabled Supabase, refresh the products list — edit links must use UUIDs like{' '}
            <code className="text-xs bg-neutral-100 px-1">a1b2c3d4-e5f6-...</code>
          </p>
        )}
        <Link href="/admin/products" className="text-[#C97D5D] mt-4 inline-block">
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900">Edit Product</h1>
        {product.slug && (
          <AdminCustomerLink href={`/products/${product.slug}`} />
        )}
      </div>
      <ProductForm initial={product} isEdit />
    </div>
  );
}
