'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFiltersPanel } from '@/components/product/ProductFiltersPanel';
import { BREADCRUMB, PRODUCTS_PAGE } from '@/lib/content';
import { shouldUseStaticDemoCatalog } from '@/lib/storefront/catalog-source';
import {
  CATALOG_PRODUCTS,
  CATEGORY_LABELS,
  DEFAULT_FILTERS,
  filterCatalogProducts,
  sortCatalogProducts,
  paginateProducts,
  toCardProduct,
  type CatalogProduct,
  type CategorySlug,
  type ProductFilters,
  type ListingSetFilter,
  type SortKey,
} from '@/lib/products-data';
import {
  formatPageNumber,
  formatProductRange,
  formatTotalProducts,
} from '@/lib/format-bn';
import { cn } from '@/lib/utils';

interface ProductsListingProps {
  initialProducts?: CatalogProduct[];
}

export function ProductsListing({ initialProducts }: ProductsListingProps) {
  /** Always trust server-passed catalog; static demo only when the server sent nothing. */
  const catalogSource =
    initialProducts && initialProducts.length > 0
      ? initialProducts
      : shouldUseStaticDemoCatalog()
        ? CATALOG_PRODUCTS
        : [];
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get('category') as CategorySlug | null;
  const sortParam = (searchParams.get('sort') as SortKey) || 'newest';
  const pageParam = Number(searchParams.get('page') ?? '1');

  const [filters, setFilters] = useState<ProductFilters>(() => ({
    ...DEFAULT_FILTERS,
    categories: categoryParam && categoryParam in CATEGORY_LABELS ? [categoryParam] : [],
  }));
  const [appliedFilters, setAppliedFilters] = useState<ProductFilters>(filters);
  const [sort, setSort] = useState<SortKey>(
    sortParam in PRODUCTS_PAGE.sortOptions ? sortParam : 'newest'
  );
  const [page, setPage] = useState(pageParam > 0 ? pageParam : 1);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (categoryParam && categoryParam in CATEGORY_LABELS) {
      const next = { ...DEFAULT_FILTERS, categories: [categoryParam] };
      setFilters(next);
      setAppliedFilters(next);
    }
  }, [categoryParam]);

  const pageTitle = useMemo(() => {
    if (appliedFilters.categories.length === 1) {
      return CATEGORY_LABELS[appliedFilters.categories[0]];
    }
    return PRODUCTS_PAGE.titleAll;
  }, [appliedFilters.categories]);

  const filtered = useMemo(() => {
    const list = filterCatalogProducts(catalogSource, appliedFilters);
    return sortCatalogProducts(list, sort);
  }, [catalogSource, appliedFilters, sort]);

  function setListingSetFilter(value: ListingSetFilter) {
    const next = { ...appliedFilters, listingSet: value };
    setFilters(next);
    setAppliedFilters(next);
  }

  const pagination = useMemo(
    () => paginateProducts(filtered, page, PRODUCTS_PAGE.perPage),
    [filtered, page]
  );

  useEffect(() => {
    setPage(1);
  }, [appliedFilters, sort]);

  function applyFilters() {
    setAppliedFilters(filters);
    setFilterOpen(false);
  }

  function resetFilters() {
    const next = { ...DEFAULT_FILTERS };
    setFilters(next);
    setAppliedFilters(next);
    setFilterOpen(false);
    router.push('/products');
  }

  return (
    <div className="bg-warm-white min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <Breadcrumb
          items={[
            { label: BREADCRUMB.home, href: '/' },
            { label: pageTitle },
          ]}
          className="mb-4"
        />

        <header className="mb-6">
          <h1 className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-primary">
            {pageTitle}
          </h1>
          <p className="font-bn-body text-base text-text-light mt-2">
            {formatTotalProducts(pagination.total)}
          </p>
        </header>

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
              className="min-h-12 px-5 rounded-lg border border-border-subtle bg-background font-bn-body text-base font-medium text-primary md:hidden"
            >
              {PRODUCTS_PAGE.filter}
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="hidden md:inline-flex min-h-12 px-5 rounded-lg border border-border-subtle bg-background font-bn-body text-base font-medium text-primary"
            >
              {PRODUCTS_PAGE.filter}
            </button>

            <div className="flex flex-wrap gap-2 order-first w-full md:order-none md:w-auto">
              <ListingSetChip
                label={PRODUCTS_PAGE.filterAll}
                active={appliedFilters.listingSet === 'all'}
                onClick={() => setListingSetFilter('all')}
              />
              <ListingSetChip
                label={PRODUCTS_PAGE.filterMatchingSet}
                active={appliedFilters.listingSet === 'matching'}
                onClick={() => setListingSetFilter('matching')}
              />
              <ListingSetChip
                label={PRODUCTS_PAGE.filterSingleProduct}
                active={appliedFilters.listingSet === 'single'}
                onClick={() => setListingSetFilter('single')}
              />
            </div>

            <p className="font-bn-body text-sm text-text-light order-last w-full md:order-none md:w-auto md:flex-1 md:text-center">
              {pagination.total > 0
                ? formatProductRange(pagination.start, pagination.end, pagination.total)
                : formatTotalProducts(0)}
            </p>

            <label className="flex items-center gap-2 min-h-12">
              <span className="font-bn-body text-sm text-text-light hidden sm:inline">
                {PRODUCTS_PAGE.sortLabel}:
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="min-h-12 rounded-lg border border-border-subtle bg-background px-3 font-bn-body text-base text-primary"
              >
                {(Object.entries(PRODUCTS_PAGE.sortOptions) as [SortKey, string][]).map(
                  ([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-36 rounded-xl border border-border-subtle bg-background p-5">
              <ProductFiltersPanel
                filters={filters}
                onChange={setFilters}
                onApply={applyFilters}
                onReset={resetFilters}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {pagination.items.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                  {pagination.items.map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={toCardProduct(product)}
                      index={idx}
                    />
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {filterOpen && (
          <motion.div className="fixed inset-0 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
              type="button"
              className="absolute inset-0 bg-primary/50"
              aria-label={PRODUCTS_PAGE.closeFilter}
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-full max-w-sm bg-background shadow-xl flex flex-col"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border-subtle bg-background">
      <p className="text-5xl mb-4" aria-hidden>
        😔
      </p>
      <h2 className="font-bn-heading text-xl font-bold text-primary">
        {PRODUCTS_PAGE.emptyTitle}
      </h2>
      <p className="font-bn-body text-base text-text-light mt-2">{PRODUCTS_PAGE.emptySubtitle}</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 min-h-12 px-8 rounded-lg bg-accent text-white font-bn-body text-base font-semibold"
      >
        {PRODUCTS_PAGE.emptyReset}
      </button>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5);

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 mt-10"
      aria-label="পৃষ্ঠা নম্বর"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="min-h-12 px-4 rounded-lg border border-border-subtle font-bn-body text-sm disabled:opacity-40"
      >
        {PRODUCTS_PAGE.prevPage}
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
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
        onClick={() => onPageChange(page + 1)}
        className="min-h-12 px-4 rounded-lg border border-border-subtle font-bn-body text-sm disabled:opacity-40"
      >
        {PRODUCTS_PAGE.nextPage}
      </button>
    </nav>
  );
}
