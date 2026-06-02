import { isSupabaseAdminConfigured } from '@/lib/supabase/config';

/** Demo catalog in `products-data.ts` — local dev only, never on production Supabase. */
export function shouldUseStaticDemoCatalog(): boolean {
  return !isSupabaseAdminConfigured();
}
