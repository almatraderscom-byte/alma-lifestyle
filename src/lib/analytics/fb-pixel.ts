/** @deprecated Prefer `@/lib/pixel` — kept for legacy imports. */
export {
  trackAddToCart,
  trackAddToCartLine,
  trackInitiateCheckout,
  trackLead,
  trackPurchase,
  trackPurchaseOnce,
  trackSearch,
  trackViewContent,
} from '@/lib/pixel';

import { trackLead as pixelTrackLead } from '@/lib/pixel';

/** @deprecated Use named helpers from `@/lib/pixel` instead. */
export const fbPixel = {
  track(event: string, params?: object) {
    if (typeof window === 'undefined' || !window.fbq) return;
    window.fbq('track', event, params);
  },
  trackLead: pixelTrackLead,
};
