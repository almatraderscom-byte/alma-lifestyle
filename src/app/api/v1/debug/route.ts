// TODO: consider deleting — superseded by /api/v1/upload-health

import type { NextRequest } from 'next/server';
import { isSupabaseConfigured, isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { ensureStorageBuckets, listStorageBucketNames } from '@/server/storage/ensure-buckets';
import { withAdmin } from '@/server/api/handler';
import { apiError, apiSuccess } from '@/server/api/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_USE_API',
] as const;

const TABLE_NAMES = ['brands', 'products', 'categories'] as const;

type TableName = (typeof TABLE_NAMES)[number];

function methodNotAllowed() {
  return apiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
}

export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    const env: Record<string, boolean> = {};
    for (const key of ENV_KEYS) {
      const value = process.env[key];
      env[key] = Boolean(value && String(value).trim().length > 0);
    }

    const payload: Record<string, unknown> = {
      supabaseConfigured: isSupabaseConfigured(),
      supabaseAdminConfigured: isSupabaseAdminConfigured(),
      env,
      tables: [...TABLE_NAMES],
    };

    try {
      const { getSupabaseAdmin } = await import('@/server/db/client');
      const client = getSupabaseAdmin();

      const tableCounts: Record<
        TableName,
        { count: number | null; error?: string }
      > = {
        brands: { count: null },
        products: { count: null },
        categories: { count: null },
      };

      for (const table of TABLE_NAMES) {
        const { count, error } = await client
          .from(table)
          .select('*', { count: 'exact', head: true });
        if (error) {
          tableCounts[table] = { count: null, error: error.message };
        } else {
          tableCounts[table] = { count: count ?? 0 };
        }
      }

      let storageError: string | undefined;
      let buckets: Array<{ name: string; public: boolean | null }> = [];

      try {
        await ensureStorageBuckets();
        const names = await listStorageBucketNames();
        const { data: bucketRows, error: listError } =
          await client.storage.listBuckets();

        if (listError) {
          storageError = listError.message;
          buckets = names.map((name) => ({ name, public: null }));
        } else {
          const flags = new Map(
            (bucketRows ?? []).map((b) => [b.name, b.public ?? null])
          );
          buckets = names.map((name) => ({
            name,
            public: flags.get(name) ?? null,
          }));
        }
      } catch (err) {
        storageError = err instanceof Error ? err.message : String(err);
      }

      payload.db = { tableCounts };
      payload.storage = {
        buckets,
        required: ['product-images', 'homepage-images'],
        error: storageError,
      };
    } catch (err) {
      payload.db = {
        connectionError: err instanceof Error ? err.message : String(err),
      };
    }

    return apiSuccess(payload);
  });
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
