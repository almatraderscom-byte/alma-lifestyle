import type { NextRequest } from 'next/server';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { apiError, apiNotConfigured, apiUnauthorized } from './response';
import { requireAdmin } from './auth';

export function ensureSupabase() {
  if (!isSupabaseAdminConfigured()) {
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
  } catch {
    return apiUnauthorized();
  }

  try {
    return await handler();
  } catch (err) {
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
    const message = err instanceof Error ? err.message : 'Internal server error';
    return apiError(message, 500, 'INTERNAL_ERROR');
  }
}
