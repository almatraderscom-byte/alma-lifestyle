import 'server-only';

import { getSupabaseAdmin } from '@/server/db/client';
import { assertNoError } from '@/server/db/queries/errors';
import {
  murdaMoshariContentSchema,
  MURDA_MOSHARI_LAYOUT_KEY,
  type MurdaMoshariContent,
} from '@/lib/landing-content-types';

export interface LandingContentRow {
  id: string;
  product_slug: string;
  layout_key: string;
  content: MurdaMoshariContent;
  updated_at: string;
  created_at: string;
}

export interface LandingContentListItem {
  product_slug: string;
  layout_key: string;
  updated_at: string;
}

function parseContent(raw: unknown): MurdaMoshariContent | null {
  const parsed = murdaMoshariContentSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function getLandingContent(slug: string): Promise<MurdaMoshariContent | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('product_landing_contents')
    .select('content')
    .eq('product_slug', slug)
    .maybeSingle();

  assertNoError(error, 'getLandingContent');
  const row = data as { content: unknown } | null;
  if (!row?.content) return null;
  return parseContent(row.content);
}

export async function listLandingContents(): Promise<LandingContentListItem[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('product_landing_contents')
    .select('product_slug, layout_key, updated_at')
    .order('updated_at', { ascending: false });

  assertNoError(error, 'listLandingContents');
  return (data ?? []) as unknown as LandingContentListItem[];
}

export async function saveLandingContent(
  slug: string,
  layoutKey: string,
  content: MurdaMoshariContent,
  updatedBy?: string
): Promise<MurdaMoshariContent> {
  const validated = murdaMoshariContentSchema.parse(content);

  const { data: existing, error: fetchError } = await getSupabaseAdmin()
    .from('product_landing_contents')
    .select('id')
    .eq('product_slug', slug)
    .maybeSingle();

  assertNoError(fetchError, 'saveLandingContent.fetch');

  const existingRow = existing as unknown as { id: string } | null;

  if (existingRow?.id) {
    const { data, error } = await getSupabaseAdmin()
      .from('product_landing_contents')
      .update({
        layout_key: layoutKey,
        content: validated,
        updated_by: updatedBy ?? null,
      } as never)
      .eq('product_slug', slug)
      .select('content')
      .single();

    assertNoError(error, 'saveLandingContent.update');
    const updated = data as unknown as { content: unknown } | null;
    return parseContent(updated?.content) ?? validated;
  }

  const { data, error } = await getSupabaseAdmin()
    .from('product_landing_contents')
    .insert({
      product_slug: slug,
      layout_key: layoutKey,
      content: validated,
      updated_by: updatedBy ?? null,
    } as never)
    .select('content')
    .single();

  assertNoError(error, 'saveLandingContent.insert');
  const inserted = data as unknown as { content: unknown } | null;
  return parseContent(inserted?.content) ?? validated;
}

export function resolveMurdaLayoutKey(layoutKey?: string): string {
  return layoutKey ?? MURDA_MOSHARI_LAYOUT_KEY;
}
