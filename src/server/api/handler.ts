/**
 * API route wrappers: Supabase guard, admin auth, and error mapping.
 * Rate limiting is applied in `src/middleware.ts` for `/api/v1/*`.
 */
import type { NextRequest } from 'next/server';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { apiError, apiNotConfigured, apiUnauthorized } from './response';
import { requireAdmin } from './auth';

function mapAuthError(err: unknown): Response | null {
  if (err instanceof Error) {
    if (err.message === 'UNAUTHORIZED') return apiUnauthorized();
    if (err.message === 'FORBIDDEN') return apiError('Forbidden', 403, 'FORBIDDEN');
  }
  return null;
}

export function ensureSupabase() {
  if (!isSupabaseAdminConfigured()) {
    console.error(
      '[API] Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY'
    );
    return apiNotConfigured();
  }
  return null;
}

export async function withAdmin(
  request: NextRequest,
  handler: () => Promise<Response>
): Promise<Response> {
  const notConfigured = ensureSupabase();
  if (notConfigured) return notConfigured;

  try {
    await requireAdmin(request);
  } catch (err) {
    const mapped = mapAuthError(err);
    if (mapped) return mapped;
    return apiUnauthorized();
  }

  try {
    return await handler();
  } catch (err) {
    const mapped = mapAuthError(err);
    if (mapped) return mapped;
    const message = err instanceof Error ? err.message : 'Internal server error';
    return apiError(message, 500, 'INTERNAL_ERROR');
  }
}

export async function withPublicDb(
  handler: () => Promise<Response>
): Promise<Response> {
  const notConfigured = ensureSupabase();
  if (notConfigured) return notConfigured;

  try {
    return await handler();
  } catch (err) {
    const mapped = mapAuthError(err);
    if (mapped) return mapped;
    const message = err instanceof Error ? err.message : 'Internal server error';
    return apiError(message, 500, 'INTERNAL_ERROR');
  }
}
