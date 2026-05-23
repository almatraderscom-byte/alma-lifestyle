import { supabaseAdmin } from '../client';
import type { Category } from '../schema';
import { assertNoError } from './errors';

export async function getCategories(brandId: string): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('brand_id', brandId)
    .eq('active', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  assertNoError(error, 'getCategories');

  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  assertNoError(error, 'getCategoryBySlug');

  return data;
}
