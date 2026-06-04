import type { Json } from '@/server/db/schema';
import { getSupabaseAdmin } from '@/server/db/client';
import type { CinematicContent } from '@/lib/cinematic-content-types';
import {
  getDefaultCinematicContent,
  mergeCinematicContent,
} from '@/lib/cinematic-content-defaults';
import { getConfigRow } from '@/server/db/queries/homepage';
import { assertNoError } from '@/server/db/queries/errors';

export const CINEMATIC_CONTENT_KEY = 'cinematic_content';

export async function getCinematicContent(): Promise<CinematicContent | null> {
  const row = await getConfigRow(CINEMATIC_CONTENT_KEY);
  if (!row?.value || typeof row.value !== 'object') return null;
  return row.value as unknown as CinematicContent;
}

export async function getCinematicContentOrDefault(): Promise<CinematicContent> {
  const stored = await getCinematicContent();
  return mergeCinematicContent(stored);
}

export async function saveCinematicContent(content: CinematicContent): Promise<CinematicContent> {
  const normalized = mergeCinematicContent(content);
  const value = normalized as unknown as Json;
  const existing = await getConfigRow(CINEMATIC_CONTENT_KEY);

  if (existing) {
    const { data, error } = await getSupabaseAdmin()
      .from('site_config')
      .update({ value } as never)
      .eq('key', CINEMATIC_CONTENT_KEY)
      .select()
      .single();
    assertNoError(error, 'saveCinematicContent.update');
    return (data as unknown as { value: CinematicContent }).value;
  }

  const { data, error } = await getSupabaseAdmin()
    .from('site_config')
    .insert({ key: CINEMATIC_CONTENT_KEY, value } as never)
    .select()
    .single();
  assertNoError(error, 'saveCinematicContent.insert');
  return (data as unknown as { value: CinematicContent }).value;
}

export { getDefaultCinematicContent, mergeCinematicContent };
