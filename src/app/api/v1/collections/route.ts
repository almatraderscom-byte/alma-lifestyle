import type { NextRequest } from 'next/server';
import { CollectionBodySchema } from '@/lib/api-validation';
import { mapDbCollectionToAdmin } from '@/lib/mappers/admin-product';
import {
  createCollection,
  getAllCollectionsAdmin,
  getCollectionProductIds,
  syncCollectionProducts,
} from '@/server/db/queries/collections-admin';
import { getPublishedCollections } from '@/server/db/queries/collections';
import { getBrandId } from '@/server/db/brand';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';

export async function GET(request: NextRequest) {
  const admin = request.nextUrl.searchParams.get('admin') === 'true';

  if (admin) {
    return withAdmin(request, async () => {
      const rows = await getAllCollectionsAdmin();
      const data = await Promise.all(
        rows.map(async (row) => {
          const productIds = await getCollectionProductIds(row.id);
          return mapDbCollectionToAdmin(row, productIds);
        })
      );
      return apiSuccess(data);
    });
  }

  return withPublicDb(async () => {
    const brandId = await getBrandId();
    const rows = await getPublishedCollections(brandId);
    return apiSuccess(rows);
  });
}

export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    const body = await request.json();
    const parsed = CollectionBodySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const created = await createCollection({
      slug: parsed.data.slug,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      hero_image_url: parsed.data.hero_image_url ?? null,
      sort_order: parsed.data.sort_order ?? 0,
      published: parsed.data.published ?? false,
    });

    if (parsed.data.productIds) {
      await syncCollectionProducts(created.id, parsed.data.productIds);
    }

    const productIds = await getCollectionProductIds(created.id);
    return apiSuccess(mapDbCollectionToAdmin(created, productIds), { status: 201 });
  });
}
