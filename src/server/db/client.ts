import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './schema';

function getPublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase public env: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.'
    );
  }

  return { url, anonKey };
}

function getServiceRoleKey(): string {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      'Missing Supabase server env: SUPABASE_SERVICE_ROLE_KEY is required for supabaseAdmin.'
    );
  }

  return serviceRoleKey;
}

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getPublicEnv();

/** Browser-safe client (anon key). Use in Client Components and public reads. */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

/** Server-only client (service role). Bypasses RLS — never expose to the client. */
export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  getServiceRoleKey(),
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
