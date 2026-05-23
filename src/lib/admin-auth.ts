const ADMIN_EMAIL = 'admin@alma.com';
const ADMIN_PASSWORD = 'admin123';
const COOKIE_NAME = 'alma_admin_session';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

/** @deprecated Use COOKIE_NAME — kept for middleware / API imports */
export const ADMIN_SESSION_COOKIE = COOKIE_NAME;

export const ADMIN_CREDENTIALS = {
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
} as const;

export type AdminUser = {
  email: string;
  name: string;
};

export function login(email: string, password: string): boolean {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    if (typeof document !== 'undefined') {
      document.cookie = `${COOKIE_NAME}=authenticated; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    }
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
  }
}

export function isLoggedIn(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes(`${COOKIE_NAME}=authenticated`);
}

export function getAdminUser(): AdminUser | null {
  return isLoggedIn() ? { email: ADMIN_EMAIL, name: 'Admin' } : null;
}

/** Server/middleware helper — cookie value must be exactly "authenticated" */
export function isAdminSessionCookie(value: string | undefined): boolean {
  return value === 'authenticated';
}

/** Used by API routes — maps simple cookie to session shape */
export function parseSessionCookie(
  value: string | undefined
): { user: AdminUser; expiresAt: number } | null {
  if (!isAdminSessionCookie(value)) return null;
  return {
    user: { email: ADMIN_EMAIL, name: 'Admin' },
    expiresAt: Date.now() + COOKIE_MAX_AGE * 1000,
  };
}
