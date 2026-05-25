'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductFiltersPanel } from '@/components/product/ProductFiltersPanel';
import { PRODUCTS_PAGE } from '@/lib/content';
import {
  buildProductsListHref,
  type ProductsListQuery,
} from '@/lib/storefront/catalog-listing';
import {
  formatPageNumber,
  formatProductRange,
  formatTotalProducts,
} from '@/lib/format-bn';
import type { ListingSetFilter, SortKey } from '@/lib/products-data';
import { cn } from '@/lib/utils';

interface ProductFiltersBarProps {
  query: ProductsListQuery;
  total: number;
  rangeStart: number;
  rangeEnd: number;
}

export function ProductFiltersBar({
  query,
  total,
  rangeStart,
  rangeEnd,
}: ProductFiltersBarProps) {
  const router = useRouter();
  const [filters, setFilters] = useState(query.filters);
  const [filterOpen, setFilterOpen] = useState(false);

  const sort = query.sort;
  const page = query.page;

  function navigate(next: Partial<ProductsListQuery>) {
    const href = buildProductsListHref({
      filters: next.filters ?? filters,
      sort: next.sort ?? sort,
      page: next.page ?? 1,
    });
    router.push(href);
  }

  function applyFilters() {
    navigate({ filters, page: 1 });
    setFilterOpen(false);
  }

  function resetFilters() {
    router.push('/products');
    setFilterOpen(false);
  }

  function setListingSetFilter(value: ListingSetFilter) {
    const next = { ...filters, listingSet: value };
    setFilters(next);
    navigate({ filters: next, page: 1 });
  }

  const sortOptions = useMemo(
    () => Object.entries(PRODUCTS_PAGE.sortOptions) as [SortKey, string][],
    []
  );

  return (
    <>
      <div
        className={cn(
          'sticky top-16 z-30 -mx-4 px-4 py-3 mb-6',
          'bg-background/95 backdrop-blur border-y border-border-subtle'
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-6xl mx-auto">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="min-h-12 px-5 rounded-lg border border-border-subtle bg-background font-bn-body text-base font-medium text-primary"
          >
            {PRODUCTS_PAGE.filter}
          </button>

          <div className="flex flex-wrap gap-2 order-first w-full md:order-none md:w-auto">
            <ListingSetChip
              label={PRODUCTS_PAGE.filterAll}
              active={filters.listingSet === 'all'}
              onClick={() => setListingSetFilter('all')}
            />
            <ListingSetChip
              label={PRODUCTS_PAGE.filterMatchingSet}
              active={filters.listingSet === 'matching'}
              onClick={() => setListingSetFilter('matching')}
            />
            <ListingSetChip
              label={PRODUCTS_PAGE.filterSingleProduct}
              active={filters.listingSet === 'single'}
              onClick={() => setListingSetFilter('single')}
            />
          </div>

          <p className="font-bn-body text-sm text-text-light order-last w-full md:order-none md:w-auto md:flex-1 md:text-center">
            {total > 0
              ? formatProductRange(rangeStart, rangeEnd, total)
              : formatTotalProducts(0)}
          </p>

          <label className="flex items-center gap-2 min-h-12">
            <span className="font-bn-body text-sm text-text-light hidden sm:inline">
              {PRODUCTS_PAGE.sortLabel}:
            </span>
            <select
              value={sort}
              onChange={(e) => navigate({ sort: e.target.value as SortKey, page: 1 })}
              className="min-h-12 rounded-lg border border-border-subtle bg-background px-3 font-bn-body text-base text-primary"
            >
              {sortOptions.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-primary/50"
            aria-label={PRODUCTS_PAGE.closeFilter}
            onClick={() => setFilterOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-background shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 min-h-14">
              <h2 className="font-bn-heading text-lg font-bold text-primary">
                {PRODUCTS_PAGE.filter}
              </h2>
              <button
                type="button"
                className="min-h-12 min-w-12 font-bn-body text-sm"
                onClick={() => setFilterOpen(false)}
              >
                {PRODUCTS_PAGE.closeFilter}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ProductFiltersPanel
                filters={filters}
                onChange={setFilters}
                onApply={applyFilters}
                onReset={resetFilters}
              />
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export function ProductListingPagination({
  query,
  page,
  totalPages,
}: {
  query: ProductsListQuery;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();

  function navigate(nextPage: number) {
    router.push(buildProductsListHref({ ...query, page: nextPage }));
  }

  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 mt-10"
      aria-label="পৃষ্ঠা নম্বর"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => navigate(page - 1)}
        className="min-h-12 px-4 rounded-lg border border-border-subtle font-bn-body text-sm disabled:opacity-40"
      >
        {PRODUCTS_PAGE.prevPage}
      </button>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => navigate(p)}
          className={cn(
            'min-h-12 min-w-12 rounded-lg font-bn-body text-base font-medium',
            p === page ? 'bg-primary text-secondary' : 'border border-border-subtle'
          )}
        >
          {formatPageNumber(p)}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => navigate(page + 1)}
        className="min-h-12 px-4 rounded-lg border border-border-subtle font-bn-body text-sm disabled:opacity-40"
      >
        {PRODUCTS_PAGE.nextPage}
      </button>
    </nav>
  );
}

function ListingSetChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-10 px-4 rounded-full font-bn-body text-sm font-medium border transition-colors',
        active
          ? 'bg-primary text-secondary border-primary'
          : 'bg-background text-primary border-border-subtle hover:border-primary/40'
      )}
    >
      {label}
    </button>
  );
}
