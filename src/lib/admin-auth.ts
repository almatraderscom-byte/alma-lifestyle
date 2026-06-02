import type { AdminRole, AdminSession } from '@/lib/admin-session';

export type AdminUser = AdminSession;

export { ADMIN_SESSION_COOKIE } from '@/lib/admin-session';

export async function fetchCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const res = await fetch('/api/v1/admin/auth/me', { credentials: 'include' });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { user?: AdminUser } };
    return json.data?.user ?? null;
  } catch {
    return null;
  }
}

export async function loginWithApi(email: string, password: string): Promise<AdminUser | null> {
  const res = await fetch('/api/v1/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { user?: AdminUser } };
  return json.data?.user ?? null;
}

export async function logoutWithApi(): Promise<void> {
  await fetch('/api/v1/admin/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export function roleLabel(role: AdminRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
