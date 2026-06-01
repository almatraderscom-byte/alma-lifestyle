import type { NextRequest } from 'next/server';
import { CategoryBodySchema } from '@/lib/api-validation';
import { mapDbCategoryToAdmin } from '@/lib/mappers/admin-product';
import {
  deleteCategory,
  getCategoryById,
  updateCategory,
} from '@/server/db/queries/categories-admin';
import { insertAuditLog } from '@/server/db/queries/audit-log';
import { requireAdmin } from '@/server/api/auth';
import { apiError, apiNotFound, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import { revalidateCategoryPages } from '@/lib/storefront/revalidate';

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
    revalidateCategoryPages();
    return apiSuccess(mapDbCategoryToAdmin(updated));
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withAdmin(request, async () => {
    const admin = await requireAdmin(request);
    const category = await getCategoryById(id);
    if (!category) return apiNotFound('Category');

    try {
      await deleteCategory(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      return apiError(message, 400, 'DELETE_NOT_ALLOWED');
    }

    await insertAuditLog({
      action: 'delete_category',
      entity_type: 'category',
      entity_id: id,
      entity_data: category as unknown as Record<string, unknown>,
      performed_by: admin.email,
    });

    revalidateCategoryPages();
    return apiSuccess({ id, deleted: true });
  });
}
