import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { mapAdminOrderStatusToDb } from '@/lib/mappers/admin-product';
import { insertAuditLogForAdmin } from '@/server/db/queries/audit-log';
import {
  archiveOrder,
  canPermanentlyDeleteOrder,
  deleteOrdersPermanently,
  getOrderById,
  updateOrderStatus,
} from '@/server/db/queries/orders';
import { apiError, apiSuccess } from '@/server/api/response';
import { requireAdmin, requireDestructiveRole } from '@/server/api/auth';
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
      await requireDestructiveRole(request);
      for (const id of orderIds) {
        await archiveOrder(id, admin.email);
        await insertAuditLogForAdmin(admin, {
          action: 'archive_order',
          entity_type: 'order',
          entity_id: id,
          notes: 'Bulk archive',
        });
      }
    } else if (action === 'cancel') {
      const dbStatus = mapAdminOrderStatusToDb('cancelled');
      for (const id of orderIds) {
        await updateOrderStatus(id, dbStatus);
        await insertAuditLogForAdmin(admin, {
          action: 'cancel_order',
          entity_type: 'order',
          entity_id: id,
          notes: 'Bulk cancel',
        });
      }
    } else {
      await requireDestructiveRole(request);
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
        await insertAuditLogForAdmin(admin, {
          action: 'delete_order',
          entity_type: 'order',
          entity_id: entry.id,
          entity_data: entry as unknown as Record<string, unknown>,
          notes: 'Bulk permanent deletion',
        });
      }

      await deleteOrdersPermanently(orderIds);
    }

    revalidatePath('/admin/orders');

    return apiSuccess({ success: true, count: orderIds.length });
  });
}
