/**
 * GET  /api/v1/products — Paginated catalog (public).
 *   Query: page, limit, category, published, search, sort, sortDir
 *   Response: { status, data: { data: AdminProduct[], pagination } }
 *
 * POST /api/v1/products — Create product (admin session required).
 *   Body: AdminProductBodySchema
 *   Response: { status, data: AdminProduct } (201)
 */
import type { NextRequest } from 'next/server';
import { ProductsListQuerySchema, AdminProductBodySchema } from '@/lib/api-validation';
import { mapDbProductToAdmin } from '@/lib/mappers/admin-product';
import { getProducts } from '@/server/db/queries/products';
import { createAdminProduct } from '@/server/db/queries/products-mutations';
import { getProductCollectionIds } from '@/server/db/queries/products-mutations';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import type { AdminProduct } from '@/lib/admin-store';

export async function GET(request: NextRequest) {
  return withPublicDb(async () => {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = ProductsListQuerySchema.safeParse(params);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const { page, limit, category, published, search, sort, sortDir } = parsed.data;

    const result = await getProducts({
      page,
      limit,
      categoryId: category,
      published,
      search,
      sort,
      sortDir,
      includeDeleted: published === undefined,
    });

    const data = await Promise.all(
      result.data.map(async (row) => {
        const collectionIds = await getProductCollectionIds(row.id);
        return mapDbProductToAdmin(row, collectionIds);
      })
    );

    return apiSuccess({
      data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  });
}

export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    const body = await request.json();
    const parsed = AdminProductBodySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const product: AdminProduct = {
      ...parsed.data,
      productType: parsed.data.productType ?? 'simple',
      designGroupId: parsed.data.designGroupId ?? undefined,
      designGroupName: parsed.data.designGroupName ?? undefined,
      ageGroup: parsed.data.ageGroup ?? undefined,
      id: parsed.data.id ?? crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await createAdminProduct(product);
    return apiSuccess(created, { status: 201 });
  });
}
