import type { NextRequest } from 'next/server';
import { isDatabaseUuid } from '@/lib/admin-ids';
import { AdminProductBodySchema } from '@/lib/api-validation';
import {
  getAdminProductById,
  softDeleteProduct,
  updateAdminProduct,
} from '@/server/db/queries/products-mutations';
import { getProductById } from '@/server/db/queries/products';
import { getCategories } from '@/server/db/queries/categories';
import { getBrandId } from '@/server/db/brand';
import {
  isProductVisibleOnStorefront,
  mapDbProductToPublic,
} from '@/lib/mappers/public-product';
import { apiError, apiNotFound, apiSuccess } from '@/server/api/response';
import { tryRequireAdmin } from '@/server/api/auth';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import {
  revalidateStorefront,
  STOREFRONT_PATHS,
} from '@/server/cache/revalidate';
import type { AdminProduct } from '@/lib/admin-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function methodNotAllowed() {
  return apiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  if (!isDatabaseUuid(id)) {
    return apiNotFound('Product');
  }

  const admin = await tryRequireAdmin(request);
  if (admin) {
    return withPublicDb(async () => {
      const product = await getAdminProductById(id);
      if (!product) return apiNotFound('Product');
      return apiSuccess(product);
    });
  }

  return withPublicDb(async () => {
    const row = await getProductById(id);
    if (!row || !isProductVisibleOnStorefront(row)) {
      return apiNotFound('Product');
    }

    const brandId = await getBrandId();
    const categories = await getCategories(brandId);
    const category = categories.find((c) => c.id === row.category_id);

    return apiSuccess(mapDbProductToPublic(row, category ?? null));
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  if (!isDatabaseUuid(id)) {
    return apiNotFound('Product');
  }
  return withAdmin(request, async () => {
    const existing = await getAdminProductById(id);
    if (!existing) return apiNotFound('Product');

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
      id,
      createdAt: parsed.data.id ? new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = await updateAdminProduct(id, product);
    if (!updated) return apiNotFound('Product');

    const paths: string[] = [...STOREFRONT_PATHS.product(updated.slug)];
    if (existing.slug !== updated.slug) {
      paths.push(...STOREFRONT_PATHS.product(existing.slug));
    }
    revalidateStorefront(paths);

    return apiSuccess(updated);
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  if (!isDatabaseUuid(id)) {
    return apiNotFound('Product');
  }
  return withAdmin(request, async () => {
    const existing = await getAdminProductById(id);
    if (!existing) return apiNotFound('Product');

    await softDeleteProduct(id);

    revalidateStorefront([
      ...STOREFRONT_PATHS.product(existing.slug),
      ...STOREFRONT_PATHS.collectionsIndex,
      ...STOREFRONT_PATHS.home,
    ]);

    return apiSuccess({ id, deleted: true });
  });
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
