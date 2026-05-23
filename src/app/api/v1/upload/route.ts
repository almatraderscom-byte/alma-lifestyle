import type { NextRequest } from 'next/server';
import { uploadImage, validateImageFile } from '@/server/storage/upload';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin } from '@/server/api/handler';

export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = String(formData.get('folder') ?? 'uploads');
    const bucketRaw = String(formData.get('bucket') ?? 'product-images');
    const bucket =
      bucketRaw === 'homepage-images' ? 'homepage-images' : 'product-images';

    if (!(file instanceof File)) {
      return apiError('Missing file', 400, 'VALIDATION_ERROR');
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      return apiError(validationError, 400, 'VALIDATION_ERROR');
    }

    const url = await uploadImage(file, folder, bucket);
    return apiSuccess({ url });
  });
}
