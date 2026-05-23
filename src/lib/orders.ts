import type { CartItem } from '@/context/CartContext';
import { formatOrderNumber } from '@/lib/format-bn';

export const LAST_ORDER_STORAGE_KEY = 'alma-lifestyle-last-order';

export interface PlacedOrder {
  orderNumber: string;
  orderNumberDisplay: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
  cityLabel: string;
  placedAt: string;
}

export function generateOrderNumber(): string {
  const num = Math.floor(10000000 + Math.random() * 90000000);
  return `ALM-${num}`;
}

export function createPlacedOrder(
  data: Omit<PlacedOrder, 'orderNumber' | 'orderNumberDisplay' | 'placedAt'>
): PlacedOrder {
  const orderNumber = generateOrderNumber();
  return {
    ...data,
    orderNumber,
    orderNumberDisplay: formatOrderNumber(orderNumber),
    placedAt: new Date().toISOString(),
  };
}

export function saveLastOrder(order: PlacedOrder): void {
  try {
    sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {
    /* ignore */
  }
}

export function loadLastOrder(): PlacedOrder | null {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlacedOrder;
  } catch {
    return null;
  }
}
