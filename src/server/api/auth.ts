import type { NextRequest } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  parseAdminSessionCookie,
  type AdminRole,
  type AdminSession,
} from '@/lib/admin-session';
import { canPerformDestructiveActions, canManageAdminUsers, canManageSettings } from '@/lib/admin-roles';

export interface AdminAuthContext {
  userId: string;
  email: string;
  name: string;
  role: AdminRole;
  source: 'session';
}

function sessionToContext(session: AdminSession): AdminAuthContext {
  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
    source: 'session',
  };
}

export function getAdminFromRequest(request: NextRequest): AdminAuthContext | null {
  const value = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = parseAdminSessionCookie(value);
  return session ? sessionToContext(session) : null;
}

export async function requireAdmin(request: NextRequest): Promise<AdminAuthContext> {
  const admin = getAdminFromRequest(request);
  if (!admin) throw new Error('UNAUTHORIZED');
  return admin;
}

export async function requireRole(
  request: NextRequest,
  roles: AdminRole[]
): Promise<AdminAuthContext> {
  const admin = await requireAdmin(request);
  if (!roles.includes(admin.role)) throw new Error('FORBIDDEN');
  return admin;
}

export async function requireDestructiveRole(request: NextRequest): Promise<AdminAuthContext> {
  const admin = await requireAdmin(request);
  if (!canPerformDestructiveActions(admin.role)) throw new Error('FORBIDDEN');
  return admin;
}

export async function requireSettingsRole(request: NextRequest): Promise<AdminAuthContext> {
  const admin = await requireAdmin(request);
  if (!canManageSettings(admin.role)) throw new Error('FORBIDDEN');
  return admin;
}

export async function requireOwnerRole(request: NextRequest): Promise<AdminAuthContext> {
  const admin = await requireAdmin(request);
  if (!canManageAdminUsers(admin.role)) throw new Error('FORBIDDEN');
  return admin;
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

export interface CustomerAuthContext {
  userId: string;
  email: string;
}

export async function tryRequireCustomer(
  request: NextRequest
): Promise<CustomerAuthContext | null> {
  const { isSupabaseAdminConfigured } = await import('@/lib/supabase/config');
  const { getSupabaseAdmin } = await import('@/server/db/client');

  if (!isSupabaseAdminConfigured()) return null;

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data.user?.id || !data.user.email) return null;

  return { userId: data.user.id, email: data.user.email };
}
