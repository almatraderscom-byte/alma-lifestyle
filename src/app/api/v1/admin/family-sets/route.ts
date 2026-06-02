import type { NextRequest } from 'next/server';
import { AdminProductBodySchema } from '@/lib/api-validation';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin } from '@/server/api/handler';
import { createAdminProduct } from '@/server/db/queries/products-mutations';
import { revalidateProductPages } from '@/lib/storefront/revalidate';
import type { AdminProduct } from '@/lib/admin-store';
import { FAMILY_MEMBER_LABELS, type FamilyMemberType } from '@/lib/family-set-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    let body: { products?: unknown[] };
    try {
      body = await request.json();
    } catch {
      return apiError('Invalid JSON', 400);
    }

    const rawProducts = body.products;
    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      return apiError('products array is required', 400);
    }

    const createdProducts: AdminProduct[] = [];
    const errors: { member: string; error: string }[] = [];
    let rootId: string | undefined;

    for (const raw of rawProducts) {
      const parsed = AdminProductBodySchema.safeParse(raw);
      if (!parsed.success) {
        errors.push({
          member: 'unknown',
          error: parsed.error.message,
        });
        continue;
      }

      const memberType = (parsed.data.productType ?? 'simple') as FamilyMemberType | 'simple';
      const memberLabel =
        memberType !== 'simple'
          ? FAMILY_MEMBER_LABELS[memberType]
          : parsed.data.title;

      try {
        const product: AdminProduct = {
          ...parsed.data,
          productType: parsed.data.productType ?? 'simple',
          designGroupId: rootId ?? parsed.data.designGroupId ?? undefined,
          designGroupName: parsed.data.designGroupName ?? undefined,
          ageGroup: parsed.data.ageGroup ?? undefined,
          id: parsed.data.id ?? crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const saved = await createAdminProduct(product);
        if (!rootId) {
          rootId = saved.designGroupId ?? saved.id;
        }
        createdProducts.push(saved);
        revalidateProductPages(saved.slug);
      } catch (error: unknown) {
        errors.push({
          member: memberLabel,
          error: error instanceof Error ? error.message : 'Create failed',
        });
      }
    }

    if (errors.length > 0) {
      return apiSuccess(
        {
          success: false,
          created: createdProducts,
          errors,
          message: `${createdProducts.length}/${rawProducts.length} members created. Some failed.`,
        },
        { status: 207 }
      );
    }

    return apiSuccess(
      {
        success: true,
        products: createdProducts,
      },
      { status: 201 }
    );
  });
}
