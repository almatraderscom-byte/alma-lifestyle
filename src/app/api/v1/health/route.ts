import { NextResponse } from 'next/server';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { apiError, apiSuccess } from '@/server/api/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REQUIRED_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'ADMIN_SESSION_SECRET',
] as const;

const startTime = Date.now();

function methodNotAllowed() {
  return apiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
}

function checkEnv(): { ok: boolean; vars: Record<string, boolean> } {
  const vars: Record<string, boolean> = {};
  let ok = true;
  for (const key of REQUIRED_ENV_KEYS) {
    const value = process.env[key];
    const present = Boolean(value && String(value).trim().length > 0);
    vars[key] = present;
    if (!present) ok = false;
  }
  return { ok, vars };
}

async function checkDb(): Promise<
  { ok: true; latencyMs: number } | { ok: false; error: string; latencyMs?: number }
> {
  if (!isSupabaseAdminConfigured()) {
    return { ok: false, error: 'Database is not configured' };
  }

  const started = Date.now();
  try {
    const { getSupabaseAdmin } = await import('@/server/db/client');
    const client = getSupabaseAdmin();
    const { error } = await client
      .from('brands')
      .select('id', { count: 'exact', head: true })
      .limit(0);

    const latencyMs = Date.now() - started;
    if (error) {
      return { ok: false, error: error.message, latencyMs };
    }
    return { ok: true, latencyMs };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - started,
    };
  }
}

export async function GET() {
  const envCheck = checkEnv();
  const dbResult = await checkDb();

  const db =
    dbResult.ok ?
      { ok: true as const, latencyMs: dbResult.latencyMs }
    : { ok: false as const, error: dbResult.error, latencyMs: dbResult.latencyMs };

  const overallOk = envCheck.ok && db.ok;

  const payload = {
    ok: overallOk,
    timestamp: new Date().toISOString(),
    uptimeSec: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      db,
      env: { ok: envCheck.ok },
    },
    version: {
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      deployedAt: null as string | null,
    },
  };

  if (overallOk) {
    return apiSuccess(payload);
  }

  return NextResponse.json({ status: 'success', data: payload }, { status: 503 });
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
