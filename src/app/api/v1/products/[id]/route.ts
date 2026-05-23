import type { NextRequest } from 'next/server';
import { AdminProductBodySchema } from '@/lib/api-validation';
import {
  getAdminProductById,
  softDeleteProduct,
  updateAdminProduct,
} from '@/server/db/queries/products-mutations';
import { apiError, apiNotFound, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import type { AdminProduct } from '@/lib/admin-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withPublicDb(async () => {
    const product = await getAdminProductById(id);
    if (!product) return apiNotFound('Product');
    return apiSuccess(product);
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withAdmin(request, async () => {
    const body = await request.json();
    const parsed = AdminProductBodySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const product: AdminProduct = {
      ...parsed.data,
      id,
      createdAt: parsed.data.id ? new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = await updateAdminProduct(id, product);
    if (!updated) return apiNotFound('Product');
    return apiSuccess(updated);
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withAdmin(request, async () => {
    await softDeleteProduct(id);
    return apiSuccess({ id, deleted: true });
  });
}
