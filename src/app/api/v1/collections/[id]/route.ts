import type { NextRequest } from 'next/server';
import { CollectionBodySchema } from '@/lib/api-validation';
import { mapDbCollectionToAdmin } from '@/lib/mappers/admin-product';
import {
  deleteCollection,
  getCollectionById,
  getCollectionProductIds,
  syncCollectionProducts,
  updateCollection,
} from '@/server/db/queries/collections-admin';
import { apiError, apiNotFound, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withPublicDb(async () => {
    const row = await getCollectionById(id);
    if (!row) return apiNotFound('Collection');
    const productIds = await getCollectionProductIds(id);
    return apiSuccess(mapDbCollectionToAdmin(row, productIds));
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withAdmin(request, async () => {
    const body = await request.json();
    const parsed = CollectionBodySchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const { productIds, ...rest } = parsed.data;
    const updated = await updateCollection(id, rest);
    if (!updated) return apiNotFound('Collection');

    if (productIds) {
      await syncCollectionProducts(id, productIds);
    }

    const ids = await getCollectionProductIds(id);
    return apiSuccess(mapDbCollectionToAdmin(updated, ids));
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withAdmin(request, async () => {
    await deleteCollection(id);
    return apiSuccess({ id, deleted: true });
  });
}
