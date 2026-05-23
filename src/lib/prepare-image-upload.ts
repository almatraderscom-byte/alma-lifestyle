import { compressImage } from '@/lib/image-compress';
import {
  MAX_UPLOAD_BYTES,
  uploadSizeErrorMessage,
} from '@/lib/upload-limits';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validate, compress if needed, and ensure file is under upload limit before POST.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed');
  }

  let prepared = file.size > 1024 * 1024 ? await compressImage(file) : file;

  if (prepared.size > MAX_UPLOAD_BYTES) {
    prepared = await compressImage(prepared);
  }

  if (prepared.size > MAX_UPLOAD_BYTES) {
    throw new Error(uploadSizeErrorMessage(prepared.size));
  }

  return prepared;
}
