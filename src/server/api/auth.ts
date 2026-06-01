import type { NextRequest } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  verifySession,
} from '@/lib/admin-session';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { getSupabaseAdmin } from '@/server/db/client';

export interface AdminAuthContext {
  userId: string;
  email: string;
  role: string;
  source: 'session' | 'supabase';
}

export async function requireAdmin(request: NextRequest): Promise<AdminAuthContext> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) {
    const verified = verifySession(token);
    if (verified.ok) {
      return {
        userId: verified.payload.uid,
        email: verified.payload.email,
        role: verified.payload.role,
        source: 'session',
      };
    }
  }

  if (!isSupabaseAdminConfigured()) {
    throw new Error('UNAUTHORIZED');
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7);
    const { data, error } = await getSupabaseAdmin().auth.getUser(bearer);
    if (!error && data.user?.email) {
      const { data: adminRow } = await getSupabaseAdmin()
        .from('admin_users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      const role = (adminRow as { role: string } | null)?.role;

      if (role) {
        return {
          userId: data.user.id,
          email: data.user.email,
          role,
          source: 'supabase',
        };
      }
    }
  }

  throw new Error('UNAUTHORIZED');
}

export async function tryRequireAdmin(
  request: NextRequest
): Promise<AdminAuthContext | null> {
  try {
    return await requireAdmin(request);
  } catch {
    return null;
  }
}
