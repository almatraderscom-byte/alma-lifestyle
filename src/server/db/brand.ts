import { unstable_cache } from 'next/cache';
import { getBrandSlug } from '@/lib/supabase/config';
import { CACHE_TAGS, STOREFRONT_CACHE_SECONDS } from '@/lib/storefront/cache-tags';
import { getSupabaseAdmin } from './client';
import { assertNoError } from './queries/errors';

async function fetchBrandIdFromDb(): Promise<string> {
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

  return row.id;
}

const getCachedBrandId = unstable_cache(fetchBrandIdFromDb, ['storefront-brand-id'], {
  revalidate: STOREFRONT_CACHE_SECONDS,
  tags: [CACHE_TAGS.brand],
});

export async function getBrandId(): Promise<string> {
  return getCachedBrandId();
}

/** @deprecated Tag revalidation handles cache busting. */
export function clearBrandIdCache(): void {
  /* no-op */
}
