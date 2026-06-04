import type { NextRequest } from 'next/server';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import type { CinematicContent } from '@/lib/cinematic-content-types';
import { getDefaultCinematicContent } from '@/lib/cinematic-content-defaults';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import {
  getCinematicContentOrDefault,
  mergeCinematicContent,
  saveCinematicContent,
} from '@/server/db/queries/cinematic-content';
import { revalidateHomepage } from '@/lib/storefront/revalidate';

export async function GET() {
  if (!isSupabaseAdminConfigured()) {
    return apiSuccess(getDefaultCinematicContent());
  }

  return withPublicDb(async () => {
    const content = await getCinematicContentOrDefault();
    return apiSuccess(content);
  });
}

export async function PUT(request: NextRequest) {
  return withAdmin(request, async () => {
    const body = (await request.json()) as CinematicContent;
    if (!body?.hero || !body?.chapters || !body?.closing || !body?.whyAlma || !body?.faq) {
      return apiError('Invalid cinematic content', 400, 'VALIDATION_ERROR');
    }

    const normalized = mergeCinematicContent(body);
    const saved = await saveCinematicContent(normalized);
    revalidateHomepage();
    return apiSuccess(saved);
  });
}
