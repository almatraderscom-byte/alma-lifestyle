import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { mapAdminOrderStatusToDb } from '@/lib/mappers/admin-product';
import { insertAuditLog } from '@/server/db/queries/audit-log';
import {
  archiveOrder,
  canPermanentlyDeleteOrder,
  deleteOrdersPermanently,
  getOrderById,
  updateOrderStatus,
} from '@/server/db/queries/orders';
import { apiError, apiSuccess } from '@/server/api/response';
import { requireAdmin } from '@/server/api/auth';
import { withAdmin } from '@/server/api/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BulkActionSchema = z.object({
  orderIds: z.array(z.string().uuid()).min(1),
  action: z.enum(['archive', 'cancel', 'delete']),
});

export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    const admin = await requireAdmin(request);
    const body = await request.json();
    const parsed = BulkActionSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const { orderIds, action } = parsed.data;

    if (action === 'archive') {
      for (const id of orderIds) {
        await archiveOrder(id, admin.email);
        await insertAuditLog({
          action: 'archive_order_bulk',
          entity_type: 'order',
          entity_id: id,
          performed_by: admin.email,
        });
      }
    } else if (action === 'cancel') {
      const dbStatus = mapAdminOrderStatusToDb('cancelled');
      for (const id of orderIds) {
        await updateOrderStatus(id, dbStatus);
        await insertAuditLog({
          action: 'cancel_order_bulk',
          entity_type: 'order',
          entity_id: id,
          performed_by: admin.email,
        });
      }
    } else {
      const orders = await Promise.all(orderIds.map((id) => getOrderById(id)));
      const missing = orders.filter((o) => !o);
      if (missing.length > 0) {
        return apiError('One or more orders not found', 404, 'NOT_FOUND');
      }

      const notAllowed = orders.filter((o) => o && !canPermanentlyDeleteOrder(o));
      if (notAllowed.length > 0) {
        return apiError(
          'All selected orders must be archived or cancelled before permanent deletion',
          400,
          'DELETE_NOT_ALLOWED'
        );
      }

      for (const entry of orders.filter((o): o is NonNullable<typeof o> => Boolean(o))) {
        await insertAuditLog({
          action: 'delete_order_bulk',
          entity_type: 'order',
          entity_id: entry.id,
          entity_data: entry as unknown as Record<string, unknown>,
          performed_by: admin.email,
        });
      }

      await deleteOrdersPermanently(orderIds);
    }

    revalidatePath('/admin/orders');

    return apiSuccess({ success: true, count: orderIds.length });
  });
}
