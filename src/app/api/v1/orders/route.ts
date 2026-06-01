/**
 * GET  /api/v1/orders — List orders (admin).
 * POST /api/v1/orders — Create order from checkout (public).
 *   Body: checkout payload; assigns order number ALM-YYYYMMDD-####
 */
import type { NextRequest } from 'next/server';
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
import { getProductBySlug, getProductById } from '@/server/db/queries/products';
import { getProductsLivePrices } from '@/server/db/queries/product-prices';
import { getBrandId } from '@/server/db/brand';
import { apiError, apiSuccess, apiUnauthorized } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import { tryRequireAdmin } from '@/server/api/auth';

const OrdersListQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
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
    });

    const data = result.data.map((row) =>
      mapDbOrderToAdmin(row, row.order_items?.length ?? 0)
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
    const body = await request.json();
    const parsed = CreateOrderBodySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const brandId = await getBrandId();
    const orderNumber = await generateOrderNumber();

    const resolvedItems = await Promise.all(
      parsed.data.items.map(async (item) => {
        let productId = item.productId;
        if (!productId && item.productSlug) {
          const p = await getProductBySlug(item.productSlug);
          productId = p?.id;
        }
        if (!productId) {
          throw new Error(`Product not found: ${item.productTitle}`);
        }
        const product = await getProductById(productId);
        if (!product) throw new Error(`Product not found: ${productId}`);

        const variant = item.variantId
          ? product.product_variants?.find((v) => v.id === item.variantId)
          : product.product_variants?.[0];

        return {
          productId,
          variantId: variant?.id ?? null,
          quantity: item.quantity,
          unitPriceBdt: item.unitPriceBdt,
          productTitle: item.productTitle || product.title,
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
    const serverTotal =
      serverSubtotal + parsed.data.shippingCostBdt;

    const { order, items } = mapCreateOrderToDb(brandId, orderNumber, {
      ...parsed.data,
      subtotalBdt: serverSubtotal,
      totalBdt: serverTotal,
      items: pricedItems,
    });

    const created = await createOrder({ order, items });

    return apiSuccess(
      {
        id: created.id,
        orderNumber: created.order_number,
        status: created.status,
        totalBdt: parsed.data.totalBdt,
      },
      { status: 201 }
    );
  });
}
