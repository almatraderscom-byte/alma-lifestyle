'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductFiltersPanel } from '@/components/product/ProductFiltersPanel';
import {
  buildProductsListHref,
  type ProductsListQuery,
} from '@/lib/storefront/catalog-listing';

interface ProductFiltersSidebarProps {
  query: ProductsListQuery;
}

export function ProductFiltersSidebar({ query }: ProductFiltersSidebarProps) {
  const router = useRouter();
  const [filters, setFilters] = useState(query.filters);

  function applyFilters() {
    router.push(buildProductsListHref({ ...query, filters, page: 1 }));
  }

  function resetFilters() {
    router.push('/products');
  }

  return (
    <ProductFiltersPanel
      filters={filters}
      onChange={setFilters}
      onApply={applyFilters}
      onReset={resetFilters}
    />
  );
}
