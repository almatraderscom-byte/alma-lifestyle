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
  input: Pick<Category, 'slug' | 'name' | 'description' | 'image_url' | 'display_order' | 'active'>
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

export async function deleteCategory(id: string): Promise<boolean> {
  const { error } = await getSupabaseAdmin()
    .from('categories')
    .update({ active: false } as never)
    .eq('id', id);

  assertNoError(error, 'deleteCategory');
  return true;
}
