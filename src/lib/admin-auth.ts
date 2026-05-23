import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const ADMIN_CREDENTIALS = {
  email: 'admin@alma.com',
  password: 'admin123',
} as const;

export const ADMIN_SESSION_COOKIE = 'alma_admin_session';
export const ADMIN_SESSION_STORAGE_KEY = 'alma_admin_session';
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const SUPABASE_AUTH_TIMEOUT_MS = 5000;

export interface AdminUser {
  email: string;
  name: string;
}

interface AdminSession {
  user: AdminUser;
  expiresAt: number;
}

function encodeSession(session: AdminSession): string {
  const json = JSON.stringify(session);
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(json, 'utf8').toString('base64url');
  }
  const binary = Array.from(new TextEncoder().encode(json), (b) =>
    String.fromCharCode(b)
  ).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeSessionPayload(value: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'base64url').toString('utf8');
  }
  const padded = value.replace(/-/g, '+').replace(/\//g, '/');
  return atob(padded);
}

export function parseSessionCookie(value: string | undefined): AdminSession | null {
  if (!value) return null;
  try {
    const json = decodeSessionPayload(value);
    const session = JSON.parse(json) as AdminSession;
    if (!session?.user?.email || !session.expiresAt) return null;
    if (Date.now() > session.expiresAt) return null;
    return session;
  } catch {
    return null;
  }
}

export function isSessionValid(session: AdminSession | null): boolean {
  return !!session && Date.now() <= session.expiresAt;
}

function createSession(user: AdminUser): AdminSession {
  return {
    user,
    expiresAt: Date.now() + SESSION_MAX_AGE_MS,
  };
}

function persistSessionClient(session: AdminSession): void {
  if (typeof window === 'undefined') return;
  const encoded = encodeSession(session);
  localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, encoded);
  const maxAge = Math.floor(SESSION_MAX_AGE_MS / 1000);
  document.cookie = `${ADMIN_SESSION_COOKIE}=${encoded}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function matchesLegacyCredentials(email: string, password: string): boolean {
  const normalized = email.trim().toLowerCase();
  return (
    normalized === ADMIN_CREDENTIALS.email &&
    password === ADMIN_CREDENTIALS.password
  );
}

async function trySupabaseAuth(email: string, password: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabaseBrowser();
  if (!supabase) return false;

  try {
    const { data, error } = await Promise.race([
      supabase.auth.signInWithPassword({
        email,
        password,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('SUPABASE_AUTH_TIMEOUT')), SUPABASE_AUTH_TIMEOUT_MS);
      }),
    ]);

    if (error || !data.user?.email) return false;

    const user: AdminUser = {
      email: data.user.email,
      name: (data.user.user_metadata?.name as string | undefined) ?? 'Admin',
    };
    persistSessionClient(createSession(user));
    return true;
  } catch {
    return false;
  }
}

/**
 * Admin login: legacy credentials first (instant), then Supabase Auth (5s max).
 */
export async function login(email: string, password: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();

  if (matchesLegacyCredentials(normalized, password)) {
    const user: AdminUser = { email: ADMIN_CREDENTIALS.email, name: 'Admin' };
    persistSessionClient(createSession(user));
    return true;
  }

  return trySupabaseAuth(normalized, password);
}

export async function logout(): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (supabase) {
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise<void>((resolve) => setTimeout(resolve, SUPABASE_AUTH_TIMEOUT_MS)),
      ]);
    } catch {
      /* ignore */
    }
  }
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  document.cookie = `${ADMIN_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  const fromStorage = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
  const fromCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.split('=')[1];
  const session = parseSessionCookie(fromStorage ?? fromCookie);
  if (!isSessionValid(session)) {
    void logout();
    return false;
  }
  return true;
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const fromStorage = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
  const fromCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.split('=')[1];
  const session = parseSessionCookie(fromStorage ?? fromCookie);
  return isSessionValid(session) ? session!.user : null;
}

export function setSessionCookieForMiddleware(session: AdminSession): string {
  return encodeSession(session);
}

export function hasSupabaseAuth(): boolean {
  return isSupabaseConfigured();
}
