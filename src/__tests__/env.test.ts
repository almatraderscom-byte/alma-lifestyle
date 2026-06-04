import { afterEach, describe, expect, it, vi } from 'vitest';
import { validateEnvOrThrow } from '@/lib/env';

const PROD_ENV = {
  VERCEL_ENV: 'production',
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'x'.repeat(20),
  SUPABASE_SERVICE_ROLE_KEY: 'y'.repeat(20),
  NEXT_PUBLIC_APP_URL: 'https://almatraders.com',
  ADMIN_SESSION_SECRET: 'a'.repeat(32),
} as const;

const SPEC_KEYS = [
  'VERCEL_ENV',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'ADMIN_SESSION_SECRET',
] as const;

describe('validateEnvOrThrow', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws when production and a required var is missing', () => {
    for (const key of SPEC_KEYS) {
      vi.stubEnv(key, '');
    }
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', PROD_ENV.NEXT_PUBLIC_SUPABASE_URL);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', PROD_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', PROD_ENV.SUPABASE_SERVICE_ROLE_KEY);
    vi.stubEnv('NEXT_PUBLIC_APP_URL', PROD_ENV.NEXT_PUBLIC_APP_URL);

    expect(() => validateEnvOrThrow()).toThrow(/ADMIN_SESSION_SECRET/);
  });

  it('throws when production and ADMIN_SESSION_SECRET is too short', () => {
    for (const [key, value] of Object.entries(PROD_ENV)) {
      vi.stubEnv(key, value);
    }
    vi.stubEnv('ADMIN_SESSION_SECRET', 'short');

    expect(() => validateEnvOrThrow()).toThrow(/ADMIN_SESSION_SECRET must be at least 32/);
  });

  it('passes when production and all vars are valid', () => {
    for (const [key, value] of Object.entries(PROD_ENV)) {
      vi.stubEnv(key, value);
    }

    expect(() => validateEnvOrThrow()).not.toThrow();
  });

  it('passes when not production and vars are unset', () => {
    for (const key of SPEC_KEYS) {
      vi.stubEnv(key, '');
    }
    vi.stubEnv('VERCEL_ENV', 'development');

    expect(() => validateEnvOrThrow()).not.toThrow();
  });
});
