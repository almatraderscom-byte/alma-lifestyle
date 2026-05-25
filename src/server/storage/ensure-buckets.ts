import { getSupabaseAdmin } from '@/server/db/client';
import { MAX_UPLOAD_BYTES } from '@/lib/upload-limits';

const REQUIRED_BUCKETS = ['product-images', 'homepage-images'] as const;

export type StorageBucketName = (typeof REQUIRED_BUCKETS)[number];

/**
 * Create missing public storage buckets (service role).
 * Fixes "Bucket not found" when migration 003 was never applied.
 */
export async function ensureStorageBuckets(): Promise<void> {
  const client = getSupabaseAdmin();
  const { data: buckets, error: listError } = await client.storage.listBuckets();

  if (listError) {
    console.error('[Storage] listBuckets failed:', listError.message);
    throw new Error(`Storage unavailable: ${listError.message}`);
  }

  const existing = new Set((buckets ?? []).map((b) => b.name));

  for (const name of REQUIRED_BUCKETS) {
    if (existing.has(name)) {
      continue;
    }

    console.log('[Storage] Creating missing bucket:', name);
    const { error: createError } = await client.storage.createBucket(name, {
      public: true,
      fileSizeLimit: MAX_UPLOAD_BYTES,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });

    if (createError) {
      const msg = createError.message ?? '';
      if (msg.toLowerCase().includes('already exists')) {
        continue;
      }
      console.error('[Storage] createBucket failed:', name, msg);
      throw new Error(
        `Could not create storage bucket "${name}". Create it in Supabase Dashboard → Storage, or run: npm run bootstrap:supabase. (${msg})`
      );
    }

    console.log('[Storage] Created bucket:', name);
    existing.add(name);
  }
}

export async function listStorageBucketNames(): Promise<string[]> {
  const { data, error } = await getSupabaseAdmin().storage.listBuckets();
  if (error) return [];
  return (data ?? []).map((b) => b.name);
}
