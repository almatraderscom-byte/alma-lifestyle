import {
  CATEGORY_LABELS,
  DEFAULT_FILTERS,
  filterCatalogProducts,
  paginateProducts,
  sortCatalogProducts,
  type CatalogProduct,
  type CategorySlug,
  type ListingSetFilter,
  type ProductFilters,
  type SortKey,
} from '@/lib/products-data';
import { PRODUCTS_PAGE } from '@/lib/content';

export type ProductsListQuery = {
  filters: ProductFilters;
  sort: SortKey;
  page: number;
};

function parseListingSet(value: string | undefined): ListingSetFilter {
  if (value === 'matching' || value === 'single') return value;
  return 'all';
}

function parseSort(value: string | undefined): SortKey {
  if (value && value in PRODUCTS_PAGE.sortOptions) {
    return value as SortKey;
  }
  return 'newest';
}

function parseCategories(raw: string | undefined): CategorySlug[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is CategorySlug => s in CATEGORY_LABELS);
}

function parseCsv(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Parse `/products` searchParams into filter/sort/page state. */
export function parseProductsListQuery(
  searchParams: Record<string, string | string[] | undefined>
): ProductsListQuery {
  const get = (key: string): string | undefined => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const legacyCategory = get('category');
  const categories = parseCategories(get('categories') ?? legacyCategory);

  const priceMin = Number(get('priceMin'));
  const priceMax = Number(get('priceMax'));

  const filters: ProductFilters = {
    categories,
    priceMin: Number.isFinite(priceMin) ? priceMin : DEFAULT_FILTERS.priceMin,
    priceMax: Number.isFinite(priceMax) ? priceMax : DEFAULT_FILTERS.priceMax,
    colors: parseCsv(get('colors')),
    sizes: parseCsv(get('sizes')),
    listingSet: parseListingSet(get('set')),
  };

  const pageRaw = Number(get('page'));
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  return {
    filters,
    sort: parseSort(get('sort')),
    page,
  };
}

/** Build URL for `/products` from listing state. */
export function buildProductsListHref(query: ProductsListQuery): string {
  const params = new URLSearchParams();

  if (query.filters.categories.length > 0) {
    params.set('categories', query.filters.categories.join(','));
  }
  if (query.filters.priceMin > DEFAULT_FILTERS.priceMin) {
    params.set('priceMin', String(query.filters.priceMin));
  }
  if (query.filters.priceMax < DEFAULT_FILTERS.priceMax) {
    params.set('priceMax', String(query.filters.priceMax));
  }
  if (query.filters.colors.length > 0) {
    params.set('colors', query.filters.colors.join(','));
  }
  if (query.filters.sizes.length > 0) {
    params.set('sizes', query.filters.sizes.join(','));
  }
  if (query.filters.listingSet !== 'all') {
    params.set('set', query.filters.listingSet);
  }
  if (query.sort !== 'newest') {
    params.set('sort', query.sort);
  }
  if (query.page > 1) {
    params.set('page', String(query.page));
  }

  const qs = params.toString();
  return qs ? `/products?${qs}` : '/products';
}

export function getProductsPageTitle(filters: ProductFilters): string {
  if (filters.categories.length === 1) {
    return CATEGORY_LABELS[filters.categories[0]!];
  }
  return PRODUCTS_PAGE.titleAll;
}

export function applyCatalogListing(
  products: CatalogProduct[],
  query: ProductsListQuery
) {
  const filtered = filterCatalogProducts(products, query.filters);
  const sorted = sortCatalogProducts(filtered, query.sort);
  const pagination = paginateProducts(sorted, query.page, PRODUCTS_PAGE.perPage);

  return {
    filtered,
    sorted,
    pagination,
    pageTitle: getProductsPageTitle(query.filters),
  };
}
