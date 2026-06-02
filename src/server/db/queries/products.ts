import { supabaseAdmin } from '../client';
import type {
  PaginatedResult,
  ProductImage,
  ProductVariant,
  ProductWithRelations,
} from '../schema';
import { assertNoError, toIlikePattern } from './errors';

const PRODUCT_RELATIONS_SELECT = `
  *,
  product_images (*),
  product_variants (*)
` as const;

export type ProductSortField = 'date' | 'title' | 'price' | 'stock';

export interface GetProductsOptions {
  page: number;
  limit: number;
  categoryId?: string;
  published?: boolean;
  search?: string;
  sort?: ProductSortField;
  sortDir?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

function sortProductRelations(product: ProductWithRelations): ProductWithRelations {
  const images: ProductImage[] = [...(product.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const variants: ProductVariant[] = product.product_variants ?? [];

  return {
    ...product,
    product_images: images,
    product_variants: variants,
  };
}

function mapProducts(rows: ProductWithRelations[]): ProductWithRelations[] {
  return rows.map(sortProductRelations);
}

export async function getProducts(
  options: GetProductsOptions
): Promise<PaginatedResult<ProductWithRelations>> {
  const {
    page,
    limit,
    categoryId,
    published,
    search,
    sort = 'date',
    sortDir = 'desc',
    includeDeleted = false,
  } = options;

  if (page < 1) {
    throw new Error('getProducts: page must be >= 1');
  }
  if (limit < 1) {
    throw new Error('getProducts: limit must be >= 1');
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const ascending = sortDir === 'asc';
  const sortColumn =
    sort === 'title'
      ? 'title'
      : sort === 'price'
        ? 'price_bdt'
        : 'created_at';

  let query = supabaseAdmin
    .from('products')
    .select(PRODUCT_RELATIONS_SELECT, { count: 'exact' })
    .order(sortColumn, { ascending })
    .range(from, to);

  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (published !== undefined) {
    query = query.eq('published', published);
  }

  const ilikePattern = search ? toIlikePattern(search) : '';
  if (ilikePattern) {
    query = query.or(
      `title.ilike.${ilikePattern},sku.ilike.${ilikePattern},description.ilike.${ilikePattern}`
    );
  }

  const { data, error, count } = await query;

  assertNoError(error, 'getProducts');

  const total = count ?? 0;
  let rows = (data ?? []) as ProductWithRelations[];

  if (sort === 'stock') {
    rows = [...rows].sort((a, b) => {
      const stockA = (a.product_variants ?? []).reduce((s, v) => s + v.stock_quantity, 0);
      const stockB = (b.product_variants ?? []).reduce((s, v) => s + v.stock_quantity, 0);
      return ascending ? stockA - stockB : stockB - stockA;
    });
  }

  return {
    data: mapProducts(rows),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 0,
  };
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithRelations | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(PRODUCT_RELATIONS_SELECT)
    .eq('slug', slug)
    .maybeSingle();

  assertNoError(error, 'getProductBySlug');

  if (!data) {
    return null;
  }

  return sortProductRelations(data as ProductWithRelations);
}

/** Storefront PDP / slug routes — published and not soft-deleted. */
export async function getPublishedProductBySlug(
  slug: string
): Promise<ProductWithRelations | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(PRODUCT_RELATIONS_SELECT)
    .eq('slug', slug)
    .eq('published', true)
    .is('deleted_at', null)
    .maybeSingle();

  assertNoError(error, 'getPublishedProductBySlug');

  if (!data) {
    return null;
  }

  return sortProductRelations(data as ProductWithRelations);
}

export async function getProductById(
  id: string
): Promise<ProductWithRelations | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(PRODUCT_RELATIONS_SELECT)
    .eq('id', id)
    .maybeSingle();

  assertNoError(error, 'getProductById');

  if (!data) {
    return null;
  }

  return sortProductRelations(data as ProductWithRelations);
}

export async function getFeaturedProducts(
  limit: number
): Promise<ProductWithRelations[]> {
  if (limit < 1) {
    throw new Error('getFeaturedProducts: limit must be >= 1');
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select(PRODUCT_RELATIONS_SELECT)
    .eq('published', true)
    .is('deleted_at', null)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  assertNoError(error, 'getFeaturedProducts');

  return mapProducts((data ?? []) as ProductWithRelations[]);
}
