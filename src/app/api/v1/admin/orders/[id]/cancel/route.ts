import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { mapAdminOrderStatusToDb, mapDbOrderToAdmin } from '@/lib/mappers/admin-product';
import { insertAuditLogForAdmin } from '@/server/db/queries/audit-log';
import { getOrderById, updateOrderStatus } from '@/server/db/queries/orders';
import { apiError, apiNotFound, apiSuccess } from '@/server/api/response';
import { requireAdmin } from '@/server/api/auth';
import { withAdmin } from '@/server/api/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withAdmin(request, async () => {
    const admin = await requireAdmin(request);
    const existing = await getOrderById(id);
    if (!existing) return apiNotFound('Order');

    const dbStatus = mapAdminOrderStatusToDb('cancelled');
    const updated = await updateOrderStatus(id, dbStatus);
    if (!updated) return apiNotFound('Order');

    await insertAuditLogForAdmin(admin, {
      action: 'cancel_order',
      entity_type: 'order',
      entity_id: id,
    });

    revalidatePath('/admin/orders');

    const full = await getOrderById(id);
    return apiSuccess(
      mapDbOrderToAdmin(full ?? updated, full?.order_items?.length ?? 0)
    );
  });
}

export const GET = () => apiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
