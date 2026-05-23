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

export interface GetProductsOptions {
  page: number;
  limit: number;
  categoryId?: string;
  published?: boolean;
  search?: string;
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
  const { page, limit, categoryId, published, search } = options;

  if (page < 1) {
    throw new Error('getProducts: page must be >= 1');
  }
  if (limit < 1) {
    throw new Error('getProducts: limit must be >= 1');
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('products')
    .select(PRODUCT_RELATIONS_SELECT, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

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
  const rows = (data ?? []) as ProductWithRelations[];

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
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  assertNoError(error, 'getFeaturedProducts');

  return mapProducts((data ?? []) as ProductWithRelations[]);
}
