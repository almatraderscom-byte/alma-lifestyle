import type { CartItem } from '@/context/CartContext';
import { getStorefrontPreviewOrigin } from '@/lib/storefront-preview-url';

export interface LivePriceEntry {
  price: number;
  originalPrice: number;
  salePrice: number | null;
  isAvailable: boolean;
  title: string;
}

export type LivePriceMap = Record<string, LivePriceEntry>;

export async function fetchLiveCartPrices(
  productIds: string[]
): Promise<LivePriceMap> {
  if (!productIds.length) return {};

  const unique = [...new Set(productIds)];
  try {
    const res = await fetch(`${getStorefrontPreviewOrigin()}/api/v1/products/prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: unique }),
      cache: 'no-store',
    });
    if (!res.ok) return {};
    const json = (await res.json()) as { data?: { prices?: LivePriceMap }; prices?: LivePriceMap };
    return json.data?.prices ?? json.prices ?? {};
  } catch {
    return {};
  }
}

export function getCartLineUnitPrice(
  item: CartItem,
  livePrices: LivePriceMap
): number {
  return livePrices[item.productId]?.price ?? item.priceSnapshot;
}

export function cartLinePriceChanged(item: CartItem, livePrices: LivePriceMap): boolean {
  const live = livePrices[item.productId];
  if (!live) return false;
  return Math.round(live.price) !== Math.round(item.priceSnapshot);
}

export function isCartLineUnavailable(item: CartItem, livePrices: LivePriceMap): boolean {
  const live = livePrices[item.productId];
  if (!live) return false;
  return !live.isAvailable;
}
