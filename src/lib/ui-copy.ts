/**
 * Admin-overridable user-facing labels for the shop, cart, and checkout pages.
 *
 * Follows the same override-with-fallback pattern as {@link ContentPageConfig}:
 * each key stores an optional string in `AppSettings.uiCopy`. When blank/unset,
 * the component's built-in copy (passed as the `fallback`) is used, so nothing
 * changes visually until the owner edits it.
 *
 * Server + client safe — no React imports.
 */
import type { AppSettings } from '@/lib/admin-settings-types';

/**
 * Resolve a UI label: the admin override (trimmed, if non-empty) or the
 * component's built-in fallback. Never returns an empty string when a fallback
 * is provided.
 */
export function pickUiText(
  settings: Pick<AppSettings, 'uiCopy'>,
  key: string,
  fallback: string
): string {
  return settings.uiCopy?.[key]?.trim() || fallback;
}

/**
 * The bounded set of overridable labels shown in the admin editor. Each
 * `fallback` MUST equal the exact string currently rendered by the wired
 * component, so an unedited store looks identical to before.
 */
export const UI_COPY_FIELDS: { key: string; label: string; fallback: string }[] = [
  // ---- Products / shop listing ----
  { key: 'products.title', label: 'Shop — page title (all products)', fallback: 'সব পণ্য' },
  {
    key: 'products.emptyTitle',
    label: 'Shop — empty results heading',
    fallback: 'কোনো পণ্য পাওয়া যায়নি',
  },
  {
    key: 'products.emptySubtitle',
    label: 'Shop — empty results subtitle',
    fallback: 'অন্য ফিল্টার চেষ্টা করুন বা সব পণ্য দেখুন',
  },
  // ---- Cart ----
  { key: 'cart.title', label: 'Cart — page title', fallback: 'Your Cart' },
  { key: 'cart.emptyTitle', label: 'Cart — empty-cart message', fallback: 'Your cart is empty' },
  {
    key: 'cart.continueShopping',
    label: 'Cart — continue-shopping button (empty cart)',
    fallback: 'Continue Shopping',
  },
  { key: 'cart.checkout', label: 'Cart — checkout button', fallback: 'Checkout' },
  // ---- Checkout ----
  { key: 'checkout.customerSection', label: 'Checkout — customer details heading', fallback: 'Your details' },
  { key: 'checkout.addressSection', label: 'Checkout — delivery details heading', fallback: 'ডেলিভারি তথ্য' },
  { key: 'checkout.paymentSection', label: 'Checkout — payment method heading', fallback: 'Payment Method' },
  { key: 'checkout.orderSummaryTitle', label: 'Checkout — order summary heading', fallback: 'Order Summary' },
  { key: 'checkout.submit', label: 'Checkout — place-order button', fallback: 'Place Order' },
];
