'use client';

import { TRACK } from '@/lib/content';
import { formatBdtPrice } from '@/lib/format-bn';
import { ORDER_STATUS_LABELS } from '@/lib/order-status-labels';

export interface TrackedOrder {
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  subtotalBdt: number;
  totalBdt: number;
  items: Array<{ title: string; quantity: number; priceBdt: number }>;
}

export function OrderTrackingDisplay({ order }: { order: TrackedOrder }) {
  const statusLabel = ORDER_STATUS_LABELS[order.status] ?? order.status;

  return (
    <div className="rounded-xl border border-border-subtle bg-background p-6 space-y-4">
      <div>
        <p className="font-bn-body text-sm text-text-light">{TRACK.orderNumber}</p>
        <p className="font-bn-heading text-xl font-bold text-primary">{order.orderNumber}</p>
      </div>
      <div>
        <p className="font-bn-body text-sm text-text-light">{TRACK.status}</p>
        <p className="font-bn-heading text-lg font-semibold text-accent">{statusLabel}</p>
      </div>
      {order.trackingNumber && (
        <p className="font-bn-body text-sm">
          {TRACK.tracking}: <span className="font-medium">{order.trackingNumber}</span>
        </p>
      )}
      <ul className="space-y-2 border-t border-border-subtle pt-4">
        {order.items.map((item, i) => (
          <li key={i} className="flex justify-between font-bn-body text-sm">
            <span>
              {item.title} ×{item.quantity}
            </span>
            <span>{formatBdtPrice(item.priceBdt * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="font-bn-heading text-lg font-bold text-primary text-right">
        {TRACK.total}: {formatBdtPrice(order.totalBdt)}
      </p>
    </div>
  );
}
