import type { NextRequest } from 'next/server';
import { ensureStorageBuckets } from '@/server/storage/ensure-buckets';
import { uploadImage, validateImageFile } from '@/server/storage/upload';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin } from '@/server/api/handler';
import { revalidateAfterUpload } from '@/lib/storefront/revalidate';

export async function POST(request: NextRequest) {
  console.log('[Upload API] ========== Request received ==========');
  console.log(
    '[Upload API] Cookie alma_admin_session:',
    request.cookies.get('alma_admin_session')?.value ?? '(missing)'
  );

  return withAdmin(request, async () => {
    console.log('[Upload API] withAdmin passed, processing...');
    await ensureStorageBuckets();
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = String(formData.get('folder') ?? 'uploads');
    const bucketRaw = String(formData.get('bucket') ?? 'product-images');
    const bucket =
      bucketRaw === 'homepage-images' ? 'homepage-images' : 'product-images';

    if (!(file instanceof File)) {
      console.error('[Upload API] Missing file');
      return apiError('Missing file', 400, 'VALIDATION_ERROR');
    }

    console.log('[Upload API] File received', {
      name: file.name,
      size: file.size,
      type: file.type,
      folder,
      bucket,
    });

    const validationError = validateImageFile(file);
    if (validationError) {
      console.error('[Upload API] Validation failed:', validationError);
      return apiError(validationError, 400, 'VALIDATION_ERROR');
    }

    const url = await uploadImage(file, folder, bucket);
    console.log('[Upload API] Public URL:', url);
    revalidateAfterUpload(bucket);
    return apiSuccess({ url });
  });
}
