import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from '@/lib/supabase/config';

/**
 * Use the static demo catalog from `products-data.ts` when Supabase is not wired up.
 * Uses public env only so server and client agree (service role is server-only).
 */
export function shouldUseStaticDemoCatalog(): boolean {
  return !isSupabaseConfigured();
}

/** Server may read/write products when the service role is available. */
export function shouldLoadCatalogFromDatabase(): boolean {
  return isSupabaseAdminConfigured();
}
