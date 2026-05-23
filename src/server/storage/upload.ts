import { getSupabaseAdmin } from '@/server/db/client';
import { MAX_UPLOAD_BYTES } from '@/lib/upload-limits';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = MAX_UPLOAD_BYTES;

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

  const { error } = await getSupabaseAdmin().storage.from(bucket).upload(name, buffer, {
    contentType: type,
    upsert: false,
  });

  if (error) throw new Error(error.message);

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
