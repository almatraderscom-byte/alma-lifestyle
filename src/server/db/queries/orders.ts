import { getSupabaseAdmin } from '../client';
import type { Order, OrderItem } from '../schema';
import { assertNoError } from './errors';
import { getBrandId } from '../brand';

export interface GetOrdersOptions {
  page: number;
  limit: number;
  status?: string;
  customerId?: string;
  includeArchived?: boolean;
  archivedOnly?: boolean;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export async function generateOrderNumber(): Promise<string> {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const prefix = `ALM-${y}${m}${d}`;

  const { count, error } = await getSupabaseAdmin()
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .like('order_number', `${prefix}%`);

  assertNoError(error, 'generateOrderNumber');

  const seq = String((count ?? 0) + 1).padStart(4, '0');
  return `${prefix}-${seq}`;
}

export async function getOrders(
  options: GetOrdersOptions
): Promise<{ data: OrderWithItems[]; total: number; page: number; limit: number; totalPages: number }> {
  const { page, limit, status, customerId, includeArchived, archivedOnly } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const brandId = await getBrandId();

  let query = getSupabaseAdmin()
    .from('orders')
    .select('*, order_items (*)', { count: 'exact' })
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (archivedOnly) {
    query = query.not('archived_at', 'is', null);
  } else if (!includeArchived) {
    query = query.is('archived_at', null);
  }

  if (status) query = query.eq('status', status);
  if (customerId) query = query.eq('customer_id', customerId);

  const { data, error, count } = await query;
  assertNoError(error, 'getOrders');

  const total = count ?? 0;
  return {
    data: (data ?? []) as OrderWithItems[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 0,
  };
}

function normalizeBdPhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 11 && digits.startsWith('880')) {
    return digits.slice(-11);
  }
  return digits.slice(-11);
}

export async function getOrderByNumberAndPhone(
  orderNumber: string,
  phone: string
): Promise<OrderWithItems | null> {
  const normalizedPhone = normalizeBdPhoneDigits(phone);
  const brandId = await getBrandId();

  const { data, error } = await getSupabaseAdmin()
    .from('orders')
    .select('*, order_items (*)')
    .eq('brand_id', brandId)
    .eq('order_number', orderNumber.trim())
    .maybeSingle();

  assertNoError(error, 'getOrderByNumberAndPhone');

  if (!data) return null;

  const orderPhone = normalizeBdPhoneDigits((data as Order).customer_phone);
  if (orderPhone !== normalizedPhone) {
    return null;
  }

  return data as OrderWithItems;
}

export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('orders')
    .select('*, order_items (*)')
    .eq('id', id)
    .maybeSingle();

  assertNoError(error, 'getOrderById');
  return data as OrderWithItems | null;
}

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<Order | null> {
  const patch: Partial<Order> = { status };
  if (status === 'shipped') patch.shipped_at = new Date().toISOString();
  if (status === 'delivered') patch.delivered_at = new Date().toISOString();

  const { data, error } = await getSupabaseAdmin()
    .from('orders')
    .update(patch as never)
    .eq('id', id)
    .select()
    .maybeSingle();

  assertNoError(error, 'updateOrderStatus');
  return data;
}

export interface CreateOrderInput {
  order: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
  items: Array<Omit<OrderItem, 'id' | 'created_at' | 'order_id'>>;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
  const { data: orderRow, error: orderError } = await getSupabaseAdmin()
    .from('orders')
    .insert(input.order as never)
    .select()
    .single();

  assertNoError(orderError, 'createOrder.insert');
  const order = orderRow as unknown as Order;

  const items = input.items.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { data: itemRows, error: itemsError } = await getSupabaseAdmin()
    .from('order_items')
    .insert(items as never)
    .select();

  assertNoError(itemsError, 'createOrder.items');

  return {
    ...order,
    order_items: (itemRows ?? []) as OrderItem[],
  };
}

const DELETABLE_ORDER_STATUSES = new Set(['cancelled', 'refunded']);

export function canPermanentlyDeleteOrder(order: Order): boolean {
  if (order.archived_at) return true;
  return DELETABLE_ORDER_STATUSES.has(order.status);
}

export async function archiveOrder(
  id: string,
  archivedBy: string
): Promise<Order | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('orders')
    .update({
      archived_at: new Date().toISOString(),
      archived_by: archivedBy,
    } as never)
    .eq('id', id)
    .select()
    .maybeSingle();

  assertNoError(error, 'archiveOrder');
  return data as Order | null;
}

export async function restoreOrder(id: string): Promise<Order | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('orders')
    .update({
      archived_at: null,
      archived_by: null,
    } as never)
    .eq('id', id)
    .select()
    .maybeSingle();

  assertNoError(error, 'restoreOrder');
  return data as Order | null;
}

export async function deleteOrderPermanently(id: string): Promise<void> {
  const { error: itemsError } = await getSupabaseAdmin()
    .from('order_items')
    .delete()
    .eq('order_id', id);

  assertNoError(itemsError, 'deleteOrderPermanently.items');

  const { error } = await getSupabaseAdmin().from('orders').delete().eq('id', id);
  assertNoError(error, 'deleteOrderPermanently.order');
}

export async function deleteOrdersPermanently(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const { error: itemsError } = await getSupabaseAdmin()
    .from('order_items')
    .delete()
    .in('order_id', ids);

  assertNoError(itemsError, 'deleteOrdersPermanently.items');

  const { error } = await getSupabaseAdmin().from('orders').delete().in('id', ids);
  assertNoError(error, 'deleteOrdersPermanently.orders');
}
