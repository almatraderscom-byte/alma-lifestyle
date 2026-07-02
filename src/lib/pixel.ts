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

type FbqFn = ((command: string, event?: string, params?: object) => void) & {
  loaded?: boolean;
  queue?: unknown[];
  callMethod?: (...args: unknown[]) => void;
};

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: FbqFn;
    gtag?: GtagFn;
  }
}

const DEFAULT_CURRENCY: PixelCurrency = 'BDT';
const PURCHASE_DEDUPE_PREFIX = 'alma-pixel-purchase-';

/**
 * GA4 mirror — every funnel event this module sends to the Meta Pixel is also
 * sent to Google Analytics 4 (the gtag.js already loaded by GoogleAnalytics.tsx),
 * mapped to GA4's standard e-commerce names. Before this, GA4 only received
 * pageviews, so the site showed traffic but 0 conversions — 'purchase' is a GA4
 * default key event, so revenue/conversion reporting lights up from this alone.
 */
const GA4_EVENT_NAME: Record<string, string> = {
  Purchase: 'purchase',
  AddToCart: 'add_to_cart',
  InitiateCheckout: 'begin_checkout',
  ViewContent: 'view_item',
  Search: 'search',
  Lead: 'generate_lead',
};

function ga4Mirror(event: string, params?: object): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  const name = GA4_EVENT_NAME[event];
  if (!name) return;

  const p = (params ?? {}) as {
    value?: number;
    currency?: string;
    contents?: PixelContentItem[];
    content_ids?: string[];
    content_name?: string;
    order_id?: string;
    search_string?: string;
  };

  if (name === 'search') {
    if (p.search_string) window.gtag('event', 'search', { search_term: p.search_string });
    return;
  }
  if (name === 'generate_lead') {
    window.gtag('event', 'generate_lead', {});
    return;
  }

  const out: Record<string, unknown> = {
    currency: p.currency ?? DEFAULT_CURRENCY,
    value: p.value ?? 0,
  };
  if (p.contents?.length) {
    out.items = p.contents.map((c) => ({ item_id: c.id, quantity: c.quantity, price: c.item_price }));
  } else if (name === 'view_item' && p.content_ids?.length) {
    out.items = [{ item_id: p.content_ids[0], item_name: p.content_name, price: p.value ?? 0 }];
  }
  if (name === 'purchase' && p.order_id) out.transaction_id = p.order_id;

  window.gtag('event', name, out);
}

function pixelTrack(event: string, params?: object): void {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    void import('@/lib/pixel-dev').then(({ recordPixelEvent }) => {
      recordPixelEvent(event, params as Record<string, unknown> | undefined, 'pixel.ts');
    });
  }

  // GA4 first — gtag loads independently of the Meta Pixel, so analytics keeps
  // working even when fbq is blocked (ad blockers commonly kill fbq only).
  try {
    ga4Mirror(event, params);
  } catch {
    /* analytics must never break the shop */
  }

  if (typeof window === 'undefined' || !window.fbq) {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.warn('[Meta Pixel] fbq not loaded — event not sent:', event, params);
    }
    return;
  }

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
