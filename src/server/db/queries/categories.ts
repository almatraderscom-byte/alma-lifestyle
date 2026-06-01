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

/** Categories shown in storefront header (active + show_in_menu). */
export async function getMenuCategories(brandId: string, limit = 4): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id, slug, name, display_order, active, show_in_menu')
    .eq('brand_id', brandId)
    .eq('active', true)
    .eq('show_in_menu', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })
    .limit(limit);

  assertNoError(error, 'getMenuCategories');

  return (data ?? []) as Category[];
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
