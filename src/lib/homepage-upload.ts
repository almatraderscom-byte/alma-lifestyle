import { uploadImageApi } from '@/lib/admin-api';
import { prepareImageForUpload } from '@/lib/prepare-image-upload';

const LOG = '[HomepageUpload]';

/**
 * Upload a homepage section image to Supabase (homepage-images bucket).
 * Always uses POST /api/v1/upload — never base64.
 */
export async function uploadHomepageImage(
  file: File,
  folder: string
): Promise<string> {
  const prepared = await prepareImageForUpload(file);
  console.log(LOG, 'Uploading', {
    name: file.name,
    originalSize: file.size,
    uploadSize: prepared.size,
    folder,
  });

  const url = await uploadImageApi(prepared, folder, 'homepage-images');

  if (!url || typeof url !== 'string') {
    console.error(LOG, 'Invalid response URL', url);
    throw new Error('Upload succeeded but no image URL was returned');
  }

  if (url.startsWith('data:')) {
    console.error(LOG, 'Got base64 instead of storage URL — check /api/v1/upload');
    throw new Error('Image must be uploaded to storage, not base64');
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error(LOG, 'Unexpected URL format', url);
    throw new Error('Invalid image URL from server');
  }

  console.log(LOG, 'Success', url);
  return url;
}
