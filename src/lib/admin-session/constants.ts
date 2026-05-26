export const ADMIN_SESSION_COOKIE = 'alma_admin_session';
export const ADMIN_SESSION_MAX_AGE_SEC = 8 * 60 * 60;

export type AdminSessionRole = 'admin' | 'editor';

export interface AdminSessionPayload {
  uid: string;
  email: string;
  role: AdminSessionRole;
  iat: number;
  exp: number;
}

export type VerifySessionResult =
  | { ok: true; payload: AdminSessionPayload }
  | { ok: false; reason: string };
