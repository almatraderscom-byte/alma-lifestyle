import type { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/server/api/response';
import { requireSettingsRole } from '@/server/api/auth';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import { getSiteSetting, saveSiteSetting } from '@/server/db/queries/homepage';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { revalidatePath } from 'next/cache';

export async function GET() {
  if (!isSupabaseAdminConfigured()) {
    return apiSuccess({ enabled: true });
  }
  return withPublicDb(async () => {
    const value = await getSiteSetting('cinematic_mode_enabled');
    return apiSuccess({ enabled: value === null ? true : value === 'true' });
  });
}

export async function PUT(request: NextRequest) {
  return withAdmin(request, async () => {
    await requireSettingsRole(request);
    const body = (await request.json()) as { enabled?: boolean };
    if (typeof body.enabled !== 'boolean') {
      return apiError('enabled must be a boolean', 400, 'VALIDATION_ERROR');
    }
    await saveSiteSetting('cinematic_mode_enabled', body.enabled ? 'true' : 'false');
    revalidatePath('/');
    return apiSuccess({ enabled: body.enabled });
  });
}
