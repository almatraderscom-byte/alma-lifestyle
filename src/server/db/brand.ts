import { getBrandSlug } from '@/lib/supabase/config';
import { getSupabaseAdmin } from './client';
import { assertNoError } from './queries/errors';

let cachedBrandId: string | null = null;

export async function getBrandId(): Promise<string> {
  if (cachedBrandId) return cachedBrandId;

  const slug = getBrandSlug();
  const { data, error } = await getSupabaseAdmin()
    .from('brands')
    .select('id')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  assertNoError(error, 'getBrandId');

  const row = data as { id: string } | null;
  if (!row?.id) {
    throw new Error(`Brand not found for slug: ${slug}`);
  }

  cachedBrandId = row.id;
  return row.id;
}

export function clearBrandIdCache(): void {
  cachedBrandId = null;
}
