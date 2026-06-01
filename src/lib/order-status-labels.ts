import { UI } from '@/lib/ui-terms';

/** Customer-facing order status labels (English ecommerce standard). */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: UI.pending,
  pending: UI.pending,
  confirmed: UI.confirmed,
  processing: UI.processing,
  shipped: UI.shipped,
  delivered: UI.delivered,
  cancelled: UI.cancelled,
};
