/**
 * GET  /api/v1/orders — List orders (admin).
 * POST /api/v1/orders — Create order from checkout (public).
 *   Body: checkout payload; assigns order number ALM-YYYYMMDD-####
 */
import type { NextRequest } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { z } from 'zod';
import { PaginationQuerySchema, CreateOrderBodySchema } from '@/lib/api-validation';
import type { OrderStatus } from '@/lib/admin-store';
import {
  mapAdminOrderStatusToDb,
  mapCreateOrderToDb,
  mapDbOrderToAdmin,
} from '@/lib/mappers/admin-product';
import {
  createOrder,
  generateOrderNumber,
  getOrders,
} from '@/server/db/queries/orders';
import { getProductById } from '@/server/db/queries/products';
import { isDatabaseUuid } from '@/lib/admin-ids';
import { ensureCatalogProductForOrder } from '@/server/db/queries/catalog-order-products';
import { getProductsLivePrices } from '@/server/db/queries/product-prices';
import { getBrandId } from '@/server/db/brand';
import { apiError, apiSuccess, apiUnauthorized } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import { tryRequireAdmin } from '@/server/api/auth';
import {
  buildOrderNotificationData,
  sendOrderCreationNotifications,
} from '@/server/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const OrdersListQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  includeArchived: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  archivedOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

export async function GET(request: NextRequest) {
  const admin = await tryRequireAdmin(request);
  if (!admin) return apiUnauthorized();

  return withPublicDb(async () => {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = OrdersListQuerySchema.safeParse(params);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const dbStatus = parsed.data.status
      ? mapAdminOrderStatusToDb(parsed.data.status as OrderStatus)
      : undefined;

    const result = await getOrders({
      page: parsed.data.page,
      limit: parsed.data.limit,
      status: dbStatus,
      includeArchived: parsed.data.includeArchived,
      archivedOnly: parsed.data.archivedOnly,
    });

    const data = result.data.map((row) =>
      mapDbOrderToAdmin(row, row.order_items?.length ?? 0, row.order_items)
    );

    return apiSuccess({
      data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  });
}

export async function POST(request: NextRequest) {
  return withPublicDb(async () => {
    console.log('[Order API] ========== New order received ==========');

    const body = await request.json();
    const parsed = CreateOrderBodySchema.safeParse(body);
    if (!parsed.success) {
      console.error('[Order API] Validation failed:', parsed.error.message);
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    console.log('[Order API] Order data:', {
      customer_name: parsed.data.customerName,
      customer_email: parsed.data.customerEmail ?? '(none)',
      customer_phone: parsed.data.customerPhone,
      items_count: parsed.data.items.length,
      totalBdt: parsed.data.totalBdt,
      paymentMethod: parsed.data.paymentMethod,
    });

    const brandId = await getBrandId();
    const orderNumber = await generateOrderNumber();

    const cartKeys = parsed.data.items.map((item) => {
      if (item.productId && !isDatabaseUuid(item.productId)) {
        return item.productId;
      }
      return item.productSlug ?? item.productId ?? '';
    });

    const livePricesByCartKey = await getProductsLivePrices(cartKeys.filter(Boolean));

    const resolvedItems = await Promise.all(
      parsed.data.items.map(async (item, index) => {
        const cartKey = cartKeys[index];
        const slug =
          item.productSlug ??
          (item.productId && !isDatabaseUuid(item.productId) ? item.productId : undefined);

        let productId =
          item.productId && isDatabaseUuid(item.productId) ? item.productId : undefined;

        if (!productId && slug) {
          productId = await ensureCatalogProductForOrder(slug);
        }

        if (!productId) {
          throw new Error(`Product not found: ${item.productTitle}`);
        }

        const product = await getProductById(productId);
        if (!product) throw new Error(`Product not found: ${productId}`);

        const variant = item.variantId
          ? product.product_variants?.find((v) => v.id === item.variantId)
          : product.product_variants?.[0];

        const live = livePricesByCartKey[cartKey];

        return {
          productId,
          variantId: variant?.id ?? null,
          quantity: item.quantity,
          unitPriceBdt: live?.price ?? item.unitPriceBdt,
          productTitle: live?.title ?? (item.productTitle || product.title),
          productSku: item.productSku || product.sku,
          variantSize: variant?.size ?? null,
          variantColor: variant?.color ?? null,
        };
      })
    );

    const livePrices = await getProductsLivePrices(
      resolvedItems.map((i) => i.productId)
    );

    const pricedItems = resolvedItems.map((item) => {
      const live = livePrices[item.productId];
      if (!live) {
        throw new Error(`Product pricing unavailable: ${item.productId}`);
      }
      if (!live.isAvailable) {
        throw new Error(`Product out of stock: ${live.title}`);
      }
      return {
        ...item,
        unitPriceBdt: live.price,
        productTitle: live.title || item.productTitle,
      };
    });

    const serverSubtotal = pricedItems.reduce(
      (sum, i) => sum + i.unitPriceBdt * i.quantity,
      0
    );
    const serverTotal = serverSubtotal + parsed.data.shippingCostBdt;

    const { order, items } = mapCreateOrderToDb(brandId, orderNumber, {
      ...parsed.data,
      subtotalBdt: serverSubtotal,
      totalBdt: serverTotal,
      items: pricedItems,
    });

    const created = await createOrder({ order, items });
    console.log('[Order API] Order saved to DB:', created.id, created.order_number);
    console.log('[Order API] customer_email in DB:', created.customer_email ?? '(null)');

    const notificationPayload = buildOrderNotificationData(
      {
        id: created.id,
        order_number: created.order_number,
        customer_name: created.customer_name,
        customer_phone: created.customer_phone,
        customer_email: created.customer_email,
        shipping_address: created.shipping_address,
        payment_method: created.payment_method,
        created_at: created.created_at,
      },
      pricedItems.map((i) => ({
        product_title: i.productTitle,
        quantity: i.quantity,
        unit_price_bdt: i.unitPriceBdt,
      })),
      {
        subtotal: serverSubtotal,
        delivery_cost: parsed.data.shippingCostBdt,
        total: serverTotal,
      }
    );

    // Serverless: must await emails before response; waitUntil extends lifetime on Vercel
    console.log('[Order API] Sending notifications (await before response)...');

    const notificationsPromise = sendOrderCreationNotifications(notificationPayload);
    waitUntil(notificationsPromise);
    const notifications = await notificationsPromise;

    console.log('[Order API] Notification results:', {
      adminSuccess: notifications.admin.success,
      adminError: notifications.admin.error,
      customerSuccess:
        'skipped' in notifications.customer ? false : notifications.customer.success,
      customerError:
        'skipped' in notifications.customer
          ? notifications.customer.error
          : notifications.customer.error,
    });

    console.log('[Order API] ========== Order processing complete ==========');

    return apiSuccess(
      {
        id: created.id,
        orderNumber: created.order_number,
        status: created.status,
        totalBdt: serverTotal,
        notifications: {
          admin: {
            success: notifications.admin.success,
            error: notifications.admin.error,
          },
          customer:
            'skipped' in notifications.customer
              ? { skipped: true, reason: notifications.customer.error }
              : {
                  success: notifications.customer.success,
                  error: notifications.customer.error,
                },
        },
      },
      { status: 201 }
    );
  });
}
