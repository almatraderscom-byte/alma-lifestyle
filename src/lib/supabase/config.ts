/** True when public Supabase env vars are set (browser or server). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** True when server can use the service role (API / admin writes). */
export function isSupabaseAdminConfigured(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getBrandSlug(): string {
  return process.env.NEXT_PUBLIC_BRAND_SLUG ?? 'alma-lifestyle';
}

/** Validates ADMIN_SESSION_SECRET (production: required, min 32 chars). */
export function assertAdminSessionSecretConfigured(): void {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const isProduction = process.env.VERCEL_ENV === 'production';

  if (isProduction && (!secret || secret.length < 32)) {
    throw new Error(
      'ADMIN_SESSION_SECRET must be set with at least 32 characters in production'
    );
  }

  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET is missing or too short (minimum 32 characters)'
    );
  }
}
