import type { NextRequest } from 'next/server';
import { OrderStatusPatchSchema } from '@/lib/api-validation';
import type { OrderStatus } from '@/lib/admin-store';
import { mapAdminOrderStatusToDb, mapDbOrderToAdmin } from '@/lib/mappers/admin-product';
import { getOrderById, updateOrderStatus } from '@/server/db/queries/orders';
import {
  buildOrderNotificationData,
  notifyCustomerOfStatusChange,
} from '@/server/notifications';
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

    const existing = await getOrderById(id);
    if (!existing) return apiNotFound('Order');

    const dbStatus = mapAdminOrderStatusToDb(parsed.data.status as OrderStatus);
    const updated = await updateOrderStatus(id, dbStatus);
    if (!updated) return apiNotFound('Order');

    const full = await getOrderById(id);
    const orderRow = full ?? updated;

    if (parsed.data.status && existing.status !== dbStatus) {
      const DEFAULT_RATE = 110;
      const subtotalBdt = (full?.order_items ?? []).reduce(
        (sum, item) =>
          sum + Math.round(Number(item.unit_price_usd) * DEFAULT_RATE) * item.quantity,
        0
      );
      const totalBdt = Math.round(Number(orderRow.total_usd) * DEFAULT_RATE);
      const shippingBdt = Math.round(Number(orderRow.shipping_cost_usd) * DEFAULT_RATE);

      const notification = buildOrderNotificationData(
        {
          id: orderRow.id,
          order_number: orderRow.order_number,
          customer_name: orderRow.customer_name,
          customer_phone: orderRow.customer_phone,
          customer_email: orderRow.customer_email,
          shipping_address: orderRow.shipping_address,
          payment_method: orderRow.payment_method,
          created_at: orderRow.created_at,
          tracking_number: orderRow.tracking_number,
        },
        (full?.order_items ?? []).map((item) => ({
          product_title: item.product_title,
          quantity: item.quantity,
          unit_price_bdt: Math.round(Number(item.unit_price_usd) * DEFAULT_RATE),
        })),
        {
          subtotal: subtotalBdt,
          delivery_cost: shippingBdt,
          total: totalBdt,
        }
      );

      void notifyCustomerOfStatusChange(notification, parsed.data.status).catch((err) =>
        console.error('[orders] status notification failed:', err)
      );
    }

    return apiSuccess(
      mapDbOrderToAdmin(orderRow, full?.order_items?.length ?? 0)
    );
  });
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const DELETE = methodNotAllowed;
