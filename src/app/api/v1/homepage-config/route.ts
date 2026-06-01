import type { NextRequest } from 'next/server';
import type { HomepageConfig } from '@/lib/homepage-config-types';
import {
  getHomepageConfig,
  getHomepageConfigOrDefault,
  saveHomepageConfig,
} from '@/server/db/queries/homepage';
import { ensureHomepageConfig, getDefaultHomepageConfig } from '@/lib/homepage-config';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { revalidateHomepage } from '@/lib/storefront/revalidate';

export async function GET() {
  if (!isSupabaseAdminConfigured()) {
    return apiSuccess(getDefaultHomepageConfig());
  }

  return withPublicDb(async () => {
    const config = ensureHomepageConfig(await getHomepageConfigOrDefault());
    return apiSuccess(config);
  });
}

export async function PUT(request: NextRequest) {
  return withAdmin(request, async () => {
    const body = (await request.json()) as HomepageConfig;
    if (!body?.sections || !Array.isArray(body.sections)) {
      return apiError('Invalid homepage config', 400, 'VALIDATION_ERROR');
    }

    const normalized = ensureHomepageConfig(body);
    const hero = normalized.sections.find((s) => s.id === 'hero');
    console.log('[Config API] Saving homepage, hero backgroundImageUrl:', 
      hero?.id === 'hero' ? hero.data.backgroundImageUrl : '(no hero)');
    const saved = await saveHomepageConfig(normalized);
    revalidateHomepage();
    return apiSuccess(saved);
  });
}
