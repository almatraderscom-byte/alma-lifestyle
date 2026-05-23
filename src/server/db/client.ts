import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from '@/lib/supabase/config';
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

/** Browser-safe client (anon key). */
export function getSupabase(): SupabaseClient<Database> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  if (!supabaseClient) {
    const { url, anonKey } = getPublicEnv();
    supabaseClient = createClient<Database>(url, anonKey);
  }
  return supabaseClient;
}

export function tryGetSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  return getSupabase();
}

/** @deprecated Prefer getSupabase() — kept for existing query imports */
export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    const client = getSupabase();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

let adminClientLogged = false;

/** Server-only client (service role). */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!isSupabaseAdminConfigured()) {
    throw new Error('Supabase service role is not configured');
  }
  if (!supabaseAdminClient) {
    const { url } = getPublicEnv();
    if (!adminClientLogged) {
      console.log(
        '[supabaseAdmin] Initializing service-role client for',
        url.replace(/^(https:\/\/)[^.]+/, '$1***')
      );
      adminClientLogged = true;
    }
    supabaseAdminClient = createClient<Database>(url, getServiceRoleKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseAdminClient;
}

export function tryGetSupabaseAdmin(): SupabaseClient<Database> | null {
  if (!isSupabaseAdminConfigured()) return null;
  return getSupabaseAdmin();
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
