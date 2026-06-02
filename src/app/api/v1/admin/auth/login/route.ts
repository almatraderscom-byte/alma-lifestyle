import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { getSupabaseAdmin } from '@/server/db/client';
import { insertAuditLog } from '@/server/db/queries/audit-log';
import { apiError, apiSuccess } from '@/server/api/response';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SEC,
  type AdminSession,
} from '@/lib/admin-session';

export async function POST(req: NextRequest) {
  if (!isSupabaseAdminConfigured()) {
    return apiError('Admin login requires Supabase configuration', 503, 'SUPABASE_NOT_CONFIGURED');
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? '';
  if (!email || !password) {
    return apiError('Email and password are required', 400);
  }

  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from('admin_users')
    .select('id, email, password_hash, name, role, active')
    .eq('email', email)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    console.error('[admin/login] lookup failed:', error.message);
    return apiError('Login failed', 500);
  }

  if (!user) {
    return apiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const row = user as {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    role: AdminSession['role'];
    active: boolean;
  };

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) {
    return apiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  await supabase
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString() } as never)
    .eq('id', row.id);

  const ua = req.headers.get('user-agent')?.substring(0, 100) ?? '';
  await insertAuditLog({
    action: 'login',
    entity_type: 'admin_user',
    entity_id: row.id,
    performed_by_id: row.id,
    performed_by_email: row.email,
    performed_by_name: row.name,
    performed_by: row.email,
    notes: ua ? `Logged in (${ua})` : 'Logged in',
  });

  const session: AdminSession = {
    userId: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
  };

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
    path: '/',
  });

  return apiSuccess({
    user: {
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
}
