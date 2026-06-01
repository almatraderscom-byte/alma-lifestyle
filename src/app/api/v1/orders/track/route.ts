import type { NextRequest } from 'next/server';
import { getOrderByNumberAndPhone } from '@/server/db/queries/orders';
import { apiSuccess } from '@/server/api/response';
import { withPublicDb } from '@/server/api/handler';

const DEFAULT_RATE = 110;

export async function GET(request: NextRequest) {
  return withPublicDb(async () => {
    const orderNumber = request.nextUrl.searchParams.get('order_number')?.trim();
    const phone = request.nextUrl.searchParams.get('phone')?.trim();

    if (!orderNumber || !phone) {
      return apiSuccess({ order: null });
    }

    const row = await getOrderByNumberAndPhone(orderNumber, phone);
    if (!row) {
      return apiSuccess({ order: null });
    }

    const items = (row.order_items ?? []).map((item) => ({
      title: item.product_title,
      quantity: item.quantity,
      priceBdt: Math.round(Number(item.unit_price_usd) * DEFAULT_RATE),
    }));

    return apiSuccess({
      order: {
        orderNumber: row.order_number,
        status: row.status,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        shippingAddress: row.shipping_address,
        paymentMethod: row.payment_method,
        trackingNumber: row.tracking_number,
        createdAt: row.created_at,
        subtotalBdt: items.reduce((s, i) => s + i.priceBdt * i.quantity, 0),
        totalBdt: Math.round(Number(row.total_usd) * DEFAULT_RATE),
        items,
      },
    });
  });
}
