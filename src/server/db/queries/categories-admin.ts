import { getSupabaseAdmin } from '../client';
import type { Category } from '../schema';
import { assertNoError } from './errors';
import { getBrandId } from '../brand';

export async function getAllCategoriesAdmin(brandId?: string): Promise<Category[]> {
  const bid = brandId ?? (await getBrandId());
  const { data, error } = await getSupabaseAdmin()
    .from('categories')
    .select('*')
    .eq('brand_id', bid)
    .order('display_order', { ascending: true });

  assertNoError(error, 'getAllCategoriesAdmin');
  return data ?? [];
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  assertNoError(error, 'getCategoryById');
  return data;
}

export async function createCategory(
  input: Pick<
    Category,
    'slug' | 'name' | 'description' | 'image_url' | 'display_order' | 'active' | 'show_in_menu'
  >
): Promise<Category> {
  const brandId = await getBrandId();
  const { data, error } = await getSupabaseAdmin()
    .from('categories')
    .insert({ ...input, brand_id: brandId } as never)
    .select()
    .single();

  assertNoError(error, 'createCategory');
  return data as unknown as Category;
}

export async function updateCategory(
  id: string,
  input: Partial<Category>
): Promise<Category | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('categories')
    .update(input as never)
    .eq('id', id)
    .select()
    .maybeSingle();

  assertNoError(error, 'updateCategory');
  return data;
}

export async function countProductsInCategory(categoryId: string): Promise<number> {
  const brandId = await getBrandId();
  const { count, error } = await getSupabaseAdmin()
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('brand_id', brandId)
    .eq('category_id', categoryId);

  assertNoError(error, 'countProductsInCategory');
  return count ?? 0;
}

/** Soft-deactivate category (legacy hide). */
export async function deactivateCategory(id: string): Promise<boolean> {
  const { error } = await getSupabaseAdmin()
    .from('categories')
    .update({ active: false } as never)
    .eq('id', id);

  assertNoError(error, 'deactivateCategory');
  return true;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const productCount = await countProductsInCategory(id);
  if (productCount > 0) {
    throw new Error(
      `Cannot delete category with ${productCount} products. Move products to another category first.`
    );
  }

  const { error } = await getSupabaseAdmin().from('categories').delete().eq('id', id);
  assertNoError(error, 'deleteCategory');
  return true;
}
