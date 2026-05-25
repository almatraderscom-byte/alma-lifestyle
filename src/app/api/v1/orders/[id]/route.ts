import type { NextRequest } from 'next/server';
import { OrderStatusPatchSchema } from '@/lib/api-validation';
import type { OrderStatus } from '@/lib/admin-store';
import { mapAdminOrderStatusToDb, mapDbOrderToAdmin } from '@/lib/mappers/admin-product';
import { getOrderById, updateOrderStatus } from '@/server/db/queries/orders';
import { apiError, apiNotFound, apiSuccess, apiUnauthorized } from '@/server/api/response';
import { tryRequireAdmin } from '@/server/api/auth';
import { withAdmin, withPublicDb } from '@/server/api/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function methodNotAllowed() {
  return apiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const admin = await tryRequireAdmin(request);
  if (!admin) return apiUnauthorized();

  const { id } = await params;
  return withPublicDb(request, async () => {
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

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const DELETE = methodNotAllowed;
