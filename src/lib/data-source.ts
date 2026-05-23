import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from '@/lib/supabase/config';

/**
 * Use remote API + Supabase when configured.
 * Set NEXT_PUBLIC_USE_API=false only for offline localStorage-only dev.
 */
export function shouldUseApi(): boolean {
  if (process.env.NEXT_PUBLIC_USE_API === 'false') {
    if (typeof window !== 'undefined' && isSupabaseConfigured()) {
      console.warn(
        '[data-source] NEXT_PUBLIC_USE_API=false — admin uses localStorage, not Supabase. Set to true or remove to load DB data.'
      );
    }
    return false;
  }
  if (typeof window !== 'undefined') {
    return isSupabaseConfigured();
  }
  return isSupabaseAdminConfigured();
}

export function isLocalStorageMode(): boolean {
  return !shouldUseApi();
}
