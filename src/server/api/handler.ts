/**
 * API route wrappers: Supabase guard, admin auth, and error mapping.
 * Rate limiting is applied in `src/middleware.ts` for `/api/v1/*`.
 */
import type { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { apiError, apiNotConfigured, apiUnauthorized } from './response';
import { requireAdmin } from './auth';

export function ensureSupabase() {
  if (!isSupabaseAdminConfigured()) {
    console.error(
      '[API] Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY'
    );
    return apiNotConfigured();
  }
  return null;
}

function captureUncaughtApiError(err: unknown, request: NextRequest): void {
  const error = err instanceof Error ? err : new Error(String(err));
  Sentry.captureException(error, {
    extra: { route: request.nextUrl.pathname, method: request.method },
  });
}

export async function withAdmin(
  request: NextRequest,
  handler: () => Promise<Response>
): Promise<Response> {
  const notConfigured = ensureSupabase();
  if (notConfigured) return notConfigured;

  try {
    await requireAdmin(request);
  } catch {
    return apiUnauthorized();
  }

  try {
    return await handler();
  } catch (err) {
    captureUncaughtApiError(err, request);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return apiError(message, 500, 'INTERNAL_ERROR');
  }
}

export async function withPublicDb(
  request: NextRequest,
  handler: () => Promise<Response>
): Promise<Response> {
  const notConfigured = ensureSupabase();
  if (notConfigured) return notConfigured;

  try {
    return await handler();
  } catch (err) {
    captureUncaughtApiError(err, request);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return apiError(message, 500, 'INTERNAL_ERROR');
  }
}
