'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProductListingGrid } from '@/components/product/ProductListingGrid';
import type { CatalogProduct } from '@/lib/products-data';

const STORAGE_KEY = 'alma_recently_viewed_slugs';

interface RecentlyViewedClientProps {
  currentSlug: string;
  initialProducts: CatalogProduct[];
  catalog: CatalogProduct[];
}

export function RecentlyViewedClient({
  currentSlug,
  initialProducts,
  catalog,
}: RecentlyViewedClientProps) {
  const catalogBySlug = useMemo(
    () => Object.fromEntries(catalog.map((p) => [p.slug, p])),
    [catalog]
  );

  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[];
      const slugs = [currentSlug, ...prev.filter((s) => s !== currentSlug)].slice(0, 12);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));

      const fromStorage = slugs
        .filter((s) => s !== currentSlug)
        .map((s) => catalogBySlug[s])
        .filter((p): p is CatalogProduct => Boolean(p))
        .slice(0, 4);

      if (fromStorage.length > 0) {
        setProducts(fromStorage);
      }
    } catch {
      /* keep server-rendered list */
    }
  }, [currentSlug, catalogBySlug]);

  if (products.length === 0) {
    return null;
  }

  return <ProductListingGrid products={products} />;
}
