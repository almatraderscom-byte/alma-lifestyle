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

let supabaseClient: SupabaseClient<Database> | null = null;
let supabaseAdminClient: SupabaseClient<Database> | null = null;

/** Browser-safe client (anon key). Lazily created so storefront dev works without Supabase. */
export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseClient) {
    const { url, anonKey } = getPublicEnv();
    supabaseClient = createClient<Database>(url, anonKey);
  }
  return supabaseClient;
}

/** @deprecated Prefer getSupabase() — kept for existing query imports */
export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    const client = getSupabase();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

/** Server-only client (service role). Lazily created. */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!supabaseAdminClient) {
    const { url, anonKey } = getPublicEnv();
    supabaseAdminClient = createClient<Database>(url, getServiceRoleKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseAdminClient;
}

/** @deprecated Prefer getSupabaseAdmin() */
export const supabaseAdmin: SupabaseClient<Database> = new Proxy(
  {} as SupabaseClient<Database>,
  {
    get(_target, prop, receiver) {
      const client = getSupabaseAdmin();
      const value = Reflect.get(client, prop, receiver);
      return typeof value === 'function' ? value.bind(client) : value;
    },
  }
);
