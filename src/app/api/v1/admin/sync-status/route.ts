import type { NextRequest } from 'next/server';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { getDefaultAppSettings } from '@/lib/admin-settings-types';
import { ensureHomepageConfig, getDefaultHomepageConfig } from '@/lib/homepage-config';
import { getAppSettings, getHomepageConfigOrDefault } from '@/server/db/queries/homepage';
import { apiSuccess } from '@/server/api/response';
import { withAdmin } from '@/server/api/handler';
import { STOREFRONT_REVALIDATE } from '@/lib/storefront/server-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    const useApi = isSupabaseAdminConfigured();
    let homepageLastSaved = getDefaultHomepageConfig().lastSaved;
    let settingsUpdatedAt = getDefaultAppSettings().updatedAt;

    if (useApi) {
      try {
        const config = ensureHomepageConfig(await getHomepageConfigOrDefault());
        homepageLastSaved = config.lastSaved;
        const settings = (await getAppSettings()) ?? getDefaultAppSettings();
        settingsUpdatedAt = settings.updatedAt;
      } catch {
        /* use defaults */
      }
    }

    return apiSuccess({
      useApi,
      homepageLastSaved,
      settingsUpdatedAt,
      storefrontRevalidateSeconds: STOREFRONT_REVALIDATE,
      cacheStatus: 'ISR (max 60s on homepage/products)',
    });
  });
}
