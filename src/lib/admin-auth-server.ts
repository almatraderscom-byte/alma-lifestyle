import 'server-only';

import { cookies } from 'next/headers';
import {
  ADMIN_SESSION_COOKIE,
  parseAdminSessionCookie,
  type AdminRole,
  type AdminSession,
} from '@/lib/admin-session';

export type { AdminSession, AdminRole };

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return parseAdminSessionCookie(value);
}

export async function requireAdminSession(): Promise<AdminSession> {
  const user = await getCurrentAdmin();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function requireRole(roles: AdminRole[]): Promise<AdminSession> {
  const user = await requireAdminSession();
  if (!roles.includes(user.role)) throw new Error('FORBIDDEN');
  return user;
}
