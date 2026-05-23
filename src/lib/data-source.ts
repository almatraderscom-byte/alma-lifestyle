import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from '@/lib/supabase/config';

/** Use remote API + Supabase when configured (disable with NEXT_PUBLIC_USE_API=false). */
export function shouldUseApi(): boolean {
  if (process.env.NEXT_PUBLIC_USE_API === 'false') return false;
  if (typeof window !== 'undefined') {
    return isSupabaseConfigured();
  }
  return isSupabaseAdminConfigured();
}

export function isLocalStorageMode(): boolean {
  return !shouldUseApi();
}
