import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireDestructiveRole } from '@/server/api/auth';
import { insertAuditLogForAdmin } from '@/server/db/queries/audit-log';
import {
  getProductsInDesignGroup,
  unlinkDesignGroup,
} from '@/server/db/queries/design-groups-admin';
import { apiError, apiNotFound, apiSuccess } from '@/server/api/response';
import { withAdmin } from '@/server/api/handler';
import { revalidateCategoryPages } from '@/lib/storefront/revalidate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withAdmin(request, async () => {
    const admin = await requireDestructiveRole(request);
    const products = await getProductsInDesignGroup(id);

    if (products.length === 0) {
      return apiNotFound('Design group');
    }

    await insertAuditLogForAdmin(admin, {
      action: 'delete_design_group',
      entity_type: 'design_group',
      entity_id: id,
      entity_data: {
        group_id: id,
        product_count: products.length,
        products,
      },
      notes: `Unlinked ${products.length} products from design group`,
    });

    const unlinkedCount = await unlinkDesignGroup(id);

    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    revalidateCategoryPages();

    return apiSuccess({ success: true, unlinkedCount });
  });
}

export const GET = () => apiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
