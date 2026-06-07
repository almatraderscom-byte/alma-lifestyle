/** Meta (Facebook) Pixel e-commerce helpers — client-side only. */

export type PixelCurrency = 'BDT';

export interface PixelContentItem {
  id: string;
  quantity: number;
  item_price: number;
}

export interface TrackAddToCartParams {
  value: number;
  currency?: PixelCurrency;
  contents: PixelContentItem[];
  content_type?: 'product';
}

export interface TrackPurchaseParams {
  value: number;
  currency?: PixelCurrency;
  contents: PixelContentItem[];
  content_type?: 'product';
  num_items: number;
  order_id?: string;
}

export interface TrackInitiateCheckoutParams {
  value: number;
  currency?: PixelCurrency;
  num_items: number;
  contents?: PixelContentItem[];
}

export interface TrackViewContentParams {
  content_id: string;
  content_name: string;
  value: number;
  currency?: PixelCurrency;
  content_type?: 'product';
}

type FbqFn = (command: string, event: string, params?: object) => void;

declare global {
  interface Window {
    fbq?: FbqFn;
  }
}

const DEFAULT_CURRENCY: PixelCurrency = 'BDT';
const PURCHASE_DEDUPE_PREFIX = 'alma-pixel-purchase-';

function pixelTrack(event: string, params?: object): void {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', event, params);
}

export function trackAddToCart(params: TrackAddToCartParams): void {
  pixelTrack('AddToCart', {
    content_type: params.content_type ?? 'product',
    currency: params.currency ?? DEFAULT_CURRENCY,
    value: params.value,
    contents: params.contents,
  });
}

export function trackPurchase(params: TrackPurchaseParams): void {
  pixelTrack('Purchase', {
    content_type: params.content_type ?? 'product',
    currency: params.currency ?? DEFAULT_CURRENCY,
    value: params.value,
    contents: params.contents,
    num_items: params.num_items,
    ...(params.order_id ? { order_id: params.order_id } : {}),
  });
}

/** Fire Purchase once per order number (survives confirmation page refresh). */
export function trackPurchaseOnce(
  params: TrackPurchaseParams & { orderNumber: string }
): void {
  const key = `${PURCHASE_DEDUPE_PREFIX}${params.orderNumber}`;
  try {
    if (sessionStorage.getItem(key)) return;
    trackPurchase({ ...params, order_id: params.order_id ?? params.orderNumber });
    sessionStorage.setItem(key, '1');
  } catch {
    trackPurchase({ ...params, order_id: params.order_id ?? params.orderNumber });
  }
}

export function trackInitiateCheckout(params: TrackInitiateCheckoutParams): void {
  pixelTrack('InitiateCheckout', {
    currency: params.currency ?? DEFAULT_CURRENCY,
    value: params.value,
    num_items: params.num_items,
    ...(params.contents?.length ? { contents: params.contents } : {}),
  });
}

export function trackViewContent(params: TrackViewContentParams): void {
  pixelTrack('ViewContent', {
    content_ids: [params.content_id],
    content_name: params.content_name,
    content_type: params.content_type ?? 'product',
    value: params.value,
    currency: params.currency ?? DEFAULT_CURRENCY,
  });
}

export function trackLead(): void {
  pixelTrack('Lead');
}

export function trackSearch(searchString: string): void {
  const query = searchString.trim();
  if (!query) return;
  pixelTrack('Search', { search_string: query });
}

export function trackAddToCartLine(input: {
  productId: string;
  quantity: number;
  unitPriceBdt: number;
}): void {
  trackAddToCart({
    value: input.unitPriceBdt * input.quantity,
    currency: 'BDT',
    contents: [
      {
        id: input.productId,
        quantity: input.quantity,
        item_price: input.unitPriceBdt,
      },
    ],
  });
}

export function buildPixelContentsFromCartItems(
  items: Array<{ productId: string; quantity: number; unitPriceBdt: number }>
): PixelContentItem[] {
  return items.map((item) => ({
    id: item.productId,
    quantity: item.quantity,
    item_price: item.unitPriceBdt,
  }));
}
