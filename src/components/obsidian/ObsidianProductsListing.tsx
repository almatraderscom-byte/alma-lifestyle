'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductFiltersPanel } from '@/components/product/ProductFiltersPanel';
import { PRODUCTS_PAGE } from '@/lib/content';
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
import { ObsidianShell } from './ObsidianShell';
import { SplitBadge } from './SplitBadge';
import { FloatingWord } from './FloatingWord';
import { ObProductCard } from './ObProductCard';
import { hexFromBgClass } from './obsidian-theme';

interface ObsidianProductsListingProps {
  initialProducts?: CatalogProduct[];
  /** Footer collage strip (reuses the homepage strip images). */
  stripImages?: string[];
}

const CATEGORY_ORDER: CategorySlug[] = [
  'panjabi',
  'islamic',
  'accessories',
  'electronics',
  'home-decor',
];

export function ObsidianProductsListing({
  initialProducts,
  stripImages = [],
}: ObsidianProductsListingProps) {
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
      setFilters((prev) => ({ ...prev, categories: [categoryParam] }));
      setAppliedFilters((prev) => ({ ...prev, categories: [categoryParam] }));
    } else if (!categoryParam) {
      setFilters((prev) => (prev.categories.length === 0 ? prev : { ...prev, categories: [] }));
      setAppliedFilters((prev) =>
        prev.categories.length === 0 ? prev : { ...prev, categories: [] }
      );
    }
  }, [categoryParam]);

  function syncCategoryUrl(categories: CategorySlug[]) {
    if (categories.length === 1) {
      router.replace(`/products?category=${categories[0]}`, { scroll: false });
    } else if (categories.length === 0 && categoryParam) {
      router.replace('/products', { scroll: false });
    }
  }

  function handleFiltersChange(next: ProductFilters) {
    setFilters(next);
    setAppliedFilters(next);
    syncCategoryUrl(next.categories);
  }

  function selectCategory(cat: CategorySlug | null) {
    const categories = cat ? [cat] : [];
    const next = { ...appliedFilters, categories };
    setFilters(next);
    setAppliedFilters(next);
    syncCategoryUrl(categories);
  }

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
    syncCategoryUrl(filters.categories);
    setFilterOpen(false);
  }

  function resetFilters() {
    const next = { ...DEFAULT_FILTERS };
    setFilters(next);
    setAppliedFilters(next);
    setFilterOpen(false);
    router.push('/products');
  }

  // Tint the page to the active category's signature swatch (reusing catalog
  // bgClass colours — no new data) so the shop respects the dynamic-theme system.
  const themeColor = useMemo(() => {
    const first = pagination.items[0];
    return hexFromBgClass(first?.bgClass) ?? '#2f7dff';
  }, [pagination.items]);

  const activeCat = appliedFilters.categories[0] ?? null;

  return (
    <ObsidianShell
      stripImages={stripImages}
      themeColor={themeColor}
      className="ob-shop"
      marquee={{ cta: { label: 'সব পণ্য দেখুন', href: '/products' } }}
    >
      {/* Dark cinematic header band — the massive floating chromatic wordmark
          lives here (requirement #3), with the real Bengali title beneath. */}
      <section className="shop-hero">
        <div className="container">
          <SplitBadge dark="ALMA" light="COLLECTION" />
          <FloatingWord text="ALL PRODUCTS" tone="light" className="shop-hero-word" />
          <h1 className="shop-hero-title bn-serif">{pageTitle}</h1>
          <p className="shop-hero-sub bn">{formatTotalProducts(pagination.total)}</p>
        </div>
      </section>

      <section className="shop-body">
        <div className="container">
          {/* Category filter as split/pill chips (unified badge system, #2). */}
          <div className="shop-cats" data-ob-reveal>
            <button
              type="button"
              className={`shop-cat${!activeCat ? ' on' : ''}`}
              onClick={() => selectCategory(null)}
            >
              {PRODUCTS_PAGE.titleAll}
            </button>
            {CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`shop-cat${activeCat === cat ? ' on' : ''}`}
                onClick={() => selectCategory(cat)}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Toolbar: set toggle · result count · sort · advanced filters. */}
          <div className="shop-toolbar">
            <div className="shop-set">
              {(
                [
                  ['all', PRODUCTS_PAGE.filterAll],
                  ['matching', PRODUCTS_PAGE.filterMatchingSet],
                  ['single', PRODUCTS_PAGE.filterSingleProduct],
                ] as [ListingSetFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`shop-set-chip${appliedFilters.listingSet === value ? ' on' : ''}`}
                  onClick={() => setListingSetFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="shop-count bn">
              {pagination.total > 0
                ? formatProductRange(pagination.start, pagination.end, pagination.total)
                : formatTotalProducts(0)}
            </p>

            <div className="shop-tools">
              <label className="shop-sort">
                <span className="bn">{PRODUCTS_PAGE.sortLabel}</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                  {(Object.entries(PRODUCTS_PAGE.sortOptions) as [SortKey, string][]).map(
                    ([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </label>
              <button type="button" className="ob-btn dark shop-filter-btn" onClick={() => setFilterOpen(true)}>
                {PRODUCTS_PAGE.filter}
              </button>
            </div>
          </div>

          {pagination.items.length === 0 ? (
            <ObEmptyState onReset={resetFilters} />
          ) : (
            <>
              <div className="ob-shop-grid">
                {pagination.items.map((product, idx) => (
                  <ObProductCard key={product.id} product={toCardProduct(product)} index={idx} />
                ))}
              </div>
              <ObPagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </section>

      {/* Advanced filter drawer — reuses the existing ProductFiltersPanel to keep
          full colour/size/price parity, presented in an Obsidian drawer. */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            className="ob-filter-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="ob-filter-scrim"
              aria-label={PRODUCTS_PAGE.closeFilter}
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              className="ob-filter-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className="ob-filter-head">
                <h2 className="bn-serif">{PRODUCTS_PAGE.filter}</h2>
                <button type="button" className="ob-filter-close" onClick={() => setFilterOpen(false)}>
                  {PRODUCTS_PAGE.closeFilter}
                </button>
              </div>
              <div className="ob-filter-body">
                <ProductFiltersPanel
                  filters={filters}
                  onChange={handleFiltersChange}
                  onApply={applyFilters}
                  onReset={resetFilters}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ObsidianShell>
  );
}

function ObEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="ob-empty" data-ob-reveal>
      <p className="ob-empty-emoji" aria-hidden>
        😔
      </p>
      <h2 className="bn-serif">{PRODUCTS_PAGE.emptyTitle}</h2>
      <p className="bn">{PRODUCTS_PAGE.emptySubtitle}</p>
      <button type="button" className="ob-btn dark solid" onClick={onReset}>
        {PRODUCTS_PAGE.emptyReset}
      </button>
    </div>
  );
}

function ObPagination({
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
    <nav className="ob-pager" aria-label="পৃষ্ঠা নম্বর">
      <button
        type="button"
        className="ob-pager-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {PRODUCTS_PAGE.prevPage}
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`ob-pager-num${p === page ? ' on' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {formatPageNumber(p)}
        </button>
      ))}
      <button
        type="button"
        className="ob-pager-btn"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        {PRODUCTS_PAGE.nextPage}
      </button>
    </nav>
  );
}
