import type { NextRequest } from 'next/server';
import { CollectionBodySchema } from '@/lib/api-validation';
import { mapDbCollectionToAdmin } from '@/lib/mappers/admin-product';
import {
  deleteCollection,
  getCollectionById as getCollectionByIdAdmin,
  getCollectionProductIds,
  syncCollectionProducts,
  updateCollection,
} from '@/server/db/queries/collections-admin';
import {
  revalidateStorefront,
  STOREFRONT_PATHS,
} from '@/server/cache/revalidate';
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
    const row = await getCollectionByIdAdmin(id);
    if (!row) return apiNotFound('Collection');
    const productIds = await getCollectionProductIds(id);
    return apiSuccess(mapDbCollectionToAdmin(row, productIds));
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withAdmin(request, async () => {
    const existing = await getCollectionByIdAdmin(id);
    if (!existing) return apiNotFound('Collection');

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

    const paths: string[] = [
      ...STOREFRONT_PATHS.collection(updated.slug),
      ...STOREFRONT_PATHS.collectionsIndex,
      ...STOREFRONT_PATHS.home,
    ];
    if (existing.slug !== updated.slug) {
      paths.push(...STOREFRONT_PATHS.collection(existing.slug));
    }
    revalidateStorefront(paths);

    const ids = await getCollectionProductIds(id);
    return apiSuccess(mapDbCollectionToAdmin(updated, ids));
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withAdmin(request, async () => {
    const existing = await getCollectionByIdAdmin(id);
    if (!existing) return apiNotFound('Collection');

    await deleteCollection(id);

    revalidateStorefront([
      ...STOREFRONT_PATHS.collection(existing.slug),
      ...STOREFRONT_PATHS.collectionsIndex,
      ...STOREFRONT_PATHS.home,
    ]);

    return apiSuccess({ id, deleted: true });
  });
}
