import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SEC,
  createAdminSessionPayload,
  signSession,
  verifySession,
  type AdminSessionRole,
} from '@/lib/admin-session';
import { apiError, apiSuccess } from '@/server/api/response';
import { getSupabaseAdmin } from '@/server/db/client';
import { isSupabaseAdminConfigured, isSupabaseConfigured } from '@/lib/supabase/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_ROLES: AdminSessionRole[] = ['admin', 'editor'];

function methodNotAllowed() {
  return apiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
  };
}

function isAllowedRole(role: string): role is AdminSessionRole {
  return ALLOWED_ROLES.includes(role as AdminSessionRole);
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return apiError('Authentication is not configured', 503, 'SUPABASE_NOT_CONFIGURED');
  }

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return apiError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const email = body.email?.trim();
  const password = body.password;
  if (!email || !password) {
    return apiError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: signInData, error: signInError } =
    await authClient.auth.signInWithPassword({ email, password });

  if (signInError || !signInData.user?.id || !signInData.user.email) {
    return apiError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const { data: adminRow, error: adminError } = await getSupabaseAdmin()
    .from('admin_users')
    .select('role')
    .eq('id', signInData.user.id)
    .maybeSingle();

  const role = (adminRow as { role: string } | null)?.role;
  if (adminError || !role || !isAllowedRole(role)) {
    return apiError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const payload = createAdminSessionPayload(signInData.user.id, signInData.user.email, role);
  const token = signSession(payload);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, cookieOptions());

  return apiSuccess({ email: signInData.user.email, role });
}

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const verified = token ? verifySession(token) : null;

  if (verified?.ok) {
    try {
      await getSupabaseAdmin().auth.admin.signOut(verified.payload.uid, 'global');
    } catch {
      /* cookie clear is sufficient for app session */
    }
  }

  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return apiSuccess({ signedOut: true });
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
