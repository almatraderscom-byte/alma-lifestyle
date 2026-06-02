export type AdminRole = 'owner' | 'manager' | 'staff';

export type AdminSession = {
  userId: string;
  email: string;
  name: string;
  role: AdminRole;
};

export const ADMIN_SESSION_COOKIE = 'alma_admin_session';
export const ADMIN_SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;

export function parseAdminSessionCookie(value: string | undefined): AdminSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<AdminSession>;
    if (
      parsed?.userId &&
      parsed?.email &&
      parsed?.name &&
      parsed?.role &&
      ['owner', 'manager', 'staff'].includes(parsed.role)
    ) {
      return {
        userId: parsed.userId,
        email: parsed.email,
        name: parsed.name,
        role: parsed.role as AdminRole,
      };
    }
  } catch {
    /* invalid session */
  }
  return null;
}

export function isAdminSessionCookie(value: string | undefined): boolean {
  return parseAdminSessionCookie(value) !== null;
}
