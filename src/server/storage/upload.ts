import { getSupabaseAdmin } from '@/server/db/client';
import { MAX_UPLOAD_BYTES } from '@/lib/upload-limits';
import { ensureStorageBuckets } from '@/server/storage/ensure-buckets';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = MAX_UPLOAD_BYTES;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4']);


export function validateVideoFile(file: File): string | null {
  if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
    return 'Only MP4 video files are allowed';
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return 'Video must be smaller than 20MB';
  }
  return null;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Only JPEG, PNG, and WebP images are allowed';
  }
  if (file.size > MAX_BYTES) {
    return 'Image must be smaller than 4MB';
  }
  return null;
}

function extensionFromMime(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

export async function uploadImage(
  file: File | Blob,
  folder: string,
  bucket: 'product-images' | 'homepage-images' = 'product-images',
  mimeType?: string
): Promise<string> {
  const type =
    mimeType ?? (file instanceof File ? file.type : 'image/jpeg');
  const validation =
    file instanceof File ? validateImageFile(file) : null;
  if (validation) throw new Error(validation);

  const ext = extensionFromMime(type);
  const name = `${folder.replace(/\/$/, '')}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  async function doUpload() {
    return getSupabaseAdmin().storage.from(bucket).upload(name, buffer, {
      contentType: type,
      upsert: false,
    });
  }

  let { error } = await doUpload();

  if (error?.message?.toLowerCase().includes('bucket not found')) {
    console.warn('[Storage] Bucket missing, creating buckets and retrying:', bucket);
    await ensureStorageBuckets();
    ({ error } = await doUpload());
  }

  if (error) {
    const msg = error.message ?? 'Upload failed';
    if (msg.toLowerCase().includes('bucket not found')) {
      throw new Error(
        `Storage bucket "${bucket}" not found. Open Supabase Dashboard → Storage → New bucket → name it "${bucket}" (public), or run migration 003_storage_buckets.sql.`
      );
    }
    throw new Error(msg);
  }

  const { data } = getSupabaseAdmin().storage.from(bucket).getPublicUrl(name);
  return data.publicUrl;
}

export async function deleteImage(
  url: string,
  bucket: 'product-images' | 'homepage-images' = 'product-images'
): Promise<void> {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx < 0) return;
    const path = url.slice(idx + marker.length);
    await getSupabaseAdmin().storage.from(bucket).remove([path]);
  } catch {
    /* best effort */
  }
}

export async function uploadVideo(
  file: File | Blob,
  folder: string,
  bucket: 'product-images' | 'homepage-images' = 'homepage-images',
  mimeType?: string
): Promise<string> {
  const type = mimeType ?? (file instanceof File ? file.type : 'video/mp4');
  const validation = file instanceof File ? validateVideoFile(file) : null;
  if (validation) throw new Error(validation);

  const name = `${folder.replace(/\/$/, '')}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.mp4`;
  const buffer = Buffer.from(await file.arrayBuffer());

  async function doUpload() {
    return getSupabaseAdmin().storage.from(bucket).upload(name, buffer, {
      contentType: type,
      upsert: false,
    });
  }

  let { error } = await doUpload();
  if (error?.message?.toLowerCase().includes('bucket not found')) {
    console.warn('[Storage] Bucket missing, creating buckets and retrying:', bucket);
    await ensureStorageBuckets();
    ({ error } = await doUpload());
  }

  if (error) {
    const msg = error.message ?? 'Upload failed';
    if (msg.toLowerCase().includes('bucket not found')) {
      throw new Error(
        `Storage bucket "${bucket}" not found. Open Supabase Dashboard → Storage → New bucket → name it "${bucket}" (public), or run migration 003_storage_buckets.sql.`
      );
    }
    throw new Error(msg);
  }

  const { data } = getSupabaseAdmin().storage.from(bucket).getPublicUrl(name);
  return data.publicUrl;
}

