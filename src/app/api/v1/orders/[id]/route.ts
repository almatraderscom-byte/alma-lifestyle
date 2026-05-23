import type { NextRequest } from 'next/server';
import { OrderStatusPatchSchema } from '@/lib/api-validation';
import type { OrderStatus } from '@/lib/admin-store';
import { mapAdminOrderStatusToDb, mapDbOrderToAdmin } from '@/lib/mappers/admin-product';
import { getOrderById, updateOrderStatus } from '@/server/db/queries/orders';
import { apiError, apiNotFound, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withPublicDb(async () => {
    const order = await getOrderById(id);
    if (!order) return apiNotFound('Order');
    return apiSuccess({
      ...mapDbOrderToAdmin(order, order.order_items?.length ?? 0),
      items: order.order_items,
    });
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withAdmin(request, async () => {
    const body = await request.json();
    const parsed = OrderStatusPatchSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const dbStatus = mapAdminOrderStatusToDb(parsed.data.status as OrderStatus);
    const updated = await updateOrderStatus(id, dbStatus);
    if (!updated) return apiNotFound('Order');

    const full = await getOrderById(id);
    return apiSuccess(
      mapDbOrderToAdmin(full ?? updated, full?.order_items?.length ?? 0)
    );
  });
}
