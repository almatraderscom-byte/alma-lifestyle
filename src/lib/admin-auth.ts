import { ADMIN_SESSION_COOKIE } from '@/lib/admin-session/constants';

export { ADMIN_SESSION_COOKIE };

export type AdminUser = {
  email: string;
  name: string;
  role?: string;
};

const ADMIN_USER_STORAGE_KEY = 'alma_admin_display_user';

type SessionSuccess = { status: 'success'; data: { email: string; role: string } };
type SessionError = { status: 'error'; error: string };

function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'Admin';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function saveDisplayUser(email: string, role: string): void {
  if (typeof window === 'undefined') return;
  const user: AdminUser = {
    email,
    name: displayNameFromEmail(email),
    role,
  };
  try {
    sessionStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function loadDisplayAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ADMIN_USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

function clearDisplayUser(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(ADMIN_USER_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** UI hint only — HttpOnly cookie is not readable from JavaScript. */
export function isLoggedIn(): boolean {
  return loadDisplayAdminUser() !== null;
}

export function getAdminUser(): AdminUser | null {
  return loadDisplayAdminUser();
}

export async function login(email: string, password: string): Promise<boolean> {
  const res = await fetch('/api/v1/admin/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const json = (await res.json()) as SessionSuccess | SessionError;
  if (!res.ok || json.status === 'error') {
    return false;
  }

  saveDisplayUser(json.data.email, json.data.role);
  return true;
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/v1/admin/session', {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch {
    /* still clear local display state */
  }
  clearDisplayUser();
}
