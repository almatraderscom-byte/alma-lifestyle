import type { NextRequest } from 'next/server';
import { CategoryBodySchema } from '@/lib/api-validation';
import { mapDbCategoryToAdmin } from '@/lib/mappers/admin-product';
import {
  deleteCategory,
  getCategoryById,
  updateCategory,
} from '@/server/db/queries/categories-admin';
import { apiError, apiNotFound, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withPublicDb(async () => {
    const row = await getCategoryById(id);
    if (!row) return apiNotFound('Category');
    return apiSuccess(mapDbCategoryToAdmin(row));
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withAdmin(request, async () => {
    const body = await request.json();
    const parsed = CategoryBodySchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const updated = await updateCategory(id, parsed.data);
    if (!updated) return apiNotFound('Category');
    return apiSuccess(mapDbCategoryToAdmin(updated));
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withAdmin(request, async () => {
    await deleteCategory(id);
    return apiSuccess({ id, deleted: true });
  });
}
