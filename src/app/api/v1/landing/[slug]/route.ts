import type { NextRequest } from 'next/server';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { getDefaultMurdaMoshariContent } from '@/lib/murda-moshari-default-content';
import {
  MURDA_MOSHARI_LAYOUT_KEY,
  MURDA_MOSHARI_SLUG,
  murdaMoshariContentSchema,
} from '@/lib/landing-content-types';
import { apiError, apiNotFound, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import { getAdminFromRequest } from '@/server/api/auth';
import {
  getLandingContent,
  resolveMurdaLayoutKey,
  saveLandingContent,
} from '@/server/db/queries/landing-content';
import { revalidateProductPages } from '@/lib/storefront/revalidate';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  if (!isSupabaseAdminConfigured()) {
    if (slug === MURDA_MOSHARI_SLUG) {
      return apiSuccess(getDefaultMurdaMoshariContent());
    }
    return apiNotFound('Landing content');
  }

  return withPublicDb(async () => {
    const content = await getLandingContent(slug);
    if (!content) {
      if (slug === MURDA_MOSHARI_SLUG) {
        return apiSuccess(getDefaultMurdaMoshariContent());
      }
      return apiNotFound('Landing content');
    }
    return apiSuccess(content);
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return withAdmin(request, async () => {
    const { slug } = await context.params;
    const body = (await request.json()) as { content?: unknown; layoutKey?: string };

    const parsed = murdaMoshariContentSchema.safeParse(body.content);
    if (!parsed.success) {
      return apiError('Invalid landing content', 400, 'VALIDATION_ERROR');
    }

    const admin = getAdminFromRequest(request);
    const layoutKey = resolveMurdaLayoutKey(
      body.layoutKey ?? (slug === MURDA_MOSHARI_SLUG ? MURDA_MOSHARI_LAYOUT_KEY : undefined)
    );

    const saved = await saveLandingContent(slug, layoutKey, parsed.data, admin?.userId);
    revalidateProductPages(slug);
    return apiSuccess(saved);
  });
}
