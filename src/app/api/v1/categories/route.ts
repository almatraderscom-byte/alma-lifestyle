import type { NextRequest } from 'next/server';
import { CategoryBodySchema } from '@/lib/api-validation';
import { mapDbCategoryToAdmin } from '@/lib/mappers/admin-product';
import { getAllCategoriesAdmin, createCategory } from '@/server/db/queries/categories-admin';
import { getCategories } from '@/server/db/queries/categories';
import { getBrandId } from '@/server/db/brand';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';

export async function GET(request: NextRequest) {
  const admin = request.nextUrl.searchParams.get('admin') === 'true';

  if (admin) {
    return withAdmin(request, async () => {
      const rows = await getAllCategoriesAdmin();
      return apiSuccess(rows.map(mapDbCategoryToAdmin));
    });
  }

  return withPublicDb(request, async () => {
    const brandId = await getBrandId();
    const rows = await getCategories(brandId);
    return apiSuccess(rows.map(mapDbCategoryToAdmin));
  });
}

export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    const body = await request.json();
    const parsed = CategoryBodySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const created = await createCategory({
      slug: parsed.data.slug,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      image_url: parsed.data.image_url ?? null,
      display_order: parsed.data.display_order ?? 0,
      active: parsed.data.active ?? true,
    });

    return apiSuccess(mapDbCategoryToAdmin(created), { status: 201 });
  });
}
