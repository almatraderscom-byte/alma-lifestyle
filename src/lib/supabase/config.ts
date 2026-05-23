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
