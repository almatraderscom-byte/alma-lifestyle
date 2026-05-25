import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import {
  formatZodError,
  HomepageConfigSchema,
} from '@/lib/api-validation';
import {
  getHomepageConfigOrDefault,
  saveHomepageConfig,
} from '@/server/db/queries/homepage';
import { ensureHomepageConfig, getDefaultHomepageConfig } from '@/lib/homepage-config';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function methodNotAllowed() {
  return apiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
}

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
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError('Invalid JSON body', 400, 'VALIDATION_ERROR');
    }

    const parsed = HomepageConfigSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 400, 'VALIDATION_ERROR');
    }

    const normalized = ensureHomepageConfig(parsed.data);
    const saved = await saveHomepageConfig(normalized);
    revalidatePath('/');
    return apiSuccess(saved);
  });
}

export const POST = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
