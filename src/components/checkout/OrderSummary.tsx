'use client';

import { CHECKOUT } from '@/lib/content';
import { formatBdtPrice } from '@/lib/format-bn';
import { getDeliveryCharge } from '@/lib/delivery';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import type { CartItem } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  cityValue: string;
  className?: string;
}

export function OrderSummary({ items, subtotal, cityValue, className }: OrderSummaryProps) {
  const settings = useStoreSettings();
  const deliveryCharge = getDeliveryCharge(cityValue, settings);
  const total = subtotal + deliveryCharge;

  return (
    <div
      className={cn(
        'rounded-xl border border-border-subtle bg-warm-white p-5 space-y-4',
        className
      )}
    >
      <h2 className="font-bn-heading text-xl font-bold text-primary">
        {CHECKOUT.orderSummaryTitle}
      </h2>

      <ul className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-3">
            <div className={cn('h-14 w-11 shrink-0 rounded', item.image)} aria-hidden />
            <div className="flex-1 min-w-0">
              <p className="font-bn-body text-sm font-medium text-primary line-clamp-2">
                {item.title}
              </p>
              <p className="font-bn-body text-xs text-text-light mt-0.5">
                ×{item.quantity} — {formatBdtPrice(item.price * item.quantity)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-2 pt-2 border-t border-border-subtle">
        <div className="flex justify-between font-bn-body text-base">
          <span className="text-text-light">{CHECKOUT.subtotal}</span>
          <span className="font-semibold">{formatBdtPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between font-bn-body text-base">
          <span className="text-text-light">{CHECKOUT.delivery}</span>
          <span className="font-semibold">
            {deliveryCharge === 0
              ? CHECKOUT.deliveryFree
              : formatBdtPrice(deliveryCharge)}
          </span>
        </div>
        <div className="flex justify-between pt-2">
          <span className="font-bn-heading text-lg font-bold text-primary">
            {CHECKOUT.total}
          </span>
          <span className="font-bn-heading text-2xl font-bold text-accent">
            {formatBdtPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function useOrderTotals(subtotal: number, cityValue: string) {
  const settings = useStoreSettings();
  const deliveryCharge = getDeliveryCharge(cityValue, settings);
  return { deliveryCharge, total: subtotal + deliveryCharge };
}
