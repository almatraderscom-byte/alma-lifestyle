'use client';

import { CART, CHECKOUT } from '@/lib/content';
import { formatBdtPrice } from '@/lib/format-bn';
import { getDeliveryCharge, isFreeDelivery } from '@/lib/delivery';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/bangladesh-districts';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import type { CartItem } from '@/context/CartContext';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  districtValue: string;
  className?: string;
  showSubmitButton?: boolean;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  districtValue,
  className,
  showSubmitButton = false,
  isSubmitting = false,
  submitDisabled = false,
}: OrderSummaryProps) {
  const { getLineUnitPrice, isLinePriceChanged, isLineUnavailable, livePrices } = useCart();
  const settings = useStoreSettings();
  const deliveryCharge = getDeliveryCharge(districtValue, settings, subtotal);
  const total = subtotal + deliveryCharge;
  const freeAtThreshold = isFreeDelivery(subtotal, settings);
  const threshold = settings.freeDeliveryThresholdBdt ?? FREE_DELIVERY_THRESHOLD;
  const amountToFree = Math.max(0, threshold - subtotal);

  return (
    <div
      className={cn(
        'rounded-lg border border-border-subtle bg-white p-6 shadow-sm space-y-4',
        className
      )}
    >
      <h2 className="font-bn-heading text-xl font-bold text-charcoal border-b border-border-subtle pb-3">
        {CHECKOUT.orderSummaryTitle}
      </h2>

      <ul className="space-y-3 max-h-56 overflow-y-auto">
        {items.map((item) => {
          const unit = getLineUnitPrice(item);
          return (
            <li key={item.variantId} className="flex gap-3">
              <div className={cn('h-14 w-11 shrink-0 rounded-lg', item.image)} aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="font-bn-body text-sm font-medium text-charcoal line-clamp-2">
                  {livePrices[item.productId]?.title ?? item.title}
                </p>
                <p className="font-bn-body text-xs text-text-light mt-0.5">
                  ×{item.quantity} — {formatBdtPrice(unit * item.quantity)}
                </p>
                {isLinePriceChanged(item) && (
                  <p className="font-bn-body text-[10px] text-amber-700 mt-0.5">দাম আপডেট হয়েছে</p>
                )}
                {isLineUnavailable(item) && (
                  <p className="font-bn-body text-[10px] text-red-700 mt-0.5">{CART.stockOut}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="space-y-2 pt-2 border-t border-border-subtle text-sm font-bn-body">
        <div className="flex justify-between">
          <span className="text-text-light">
            {CHECKOUT.subtotal} ({items.length})
          </span>
          <span className="font-semibold text-charcoal">{formatBdtPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between gap-2">
          <span className="text-text-light">{CHECKOUT.delivery}</span>
          <span
            className={cn(
              'font-semibold text-right',
              freeAtThreshold && 'text-emerald-700'
            )}
          >
            {freeAtThreshold
              ? CHECKOUT.deliveryFree
              : districtValue
                ? formatBdtPrice(deliveryCharge)
                : CHECKOUT.deliverySelectDistrict}
          </span>
        </div>

        {!freeAtThreshold && amountToFree > 0 && subtotal > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            {CHECKOUT.freeDeliveryHint}: আরও {formatBdtPrice(amountToFree)}
          </div>
        )}
      </div>

      <div className="flex justify-between items-baseline border-t-2 border-charcoal pt-4">
        <span className="font-bn-heading text-lg font-bold text-charcoal">{CHECKOUT.total}</span>
        <span className="font-bn-heading text-2xl font-bold text-terracotta">
          {formatBdtPrice(total)}
        </span>
      </div>

      {showSubmitButton && (
        <button
          type="submit"
          form="checkout-form"
          disabled={submitDisabled || isSubmitting}
          className="hidden lg:flex w-full min-h-14 items-center justify-center rounded-lg bg-terracotta font-bn-body text-lg font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? CHECKOUT.submitting : `${CHECKOUT.submit} →`}
        </button>
      )}

      <ul className="space-y-2 pt-2 border-t border-border-subtle text-xs font-bn-body text-text-light">
        <li>সুরক্ষিত চেকআউট</li>
        <li>৬৪ জেলায় ডেলিভারি</li>
        <li>১০০% অরিজিনাল পণ্য</li>
        <li>৭ দিন রিটার্ন পলিসি</li>
      </ul>
    </div>
  );
}

export function useOrderTotals(subtotal: number, districtValue: string) {
  const settings = useStoreSettings();
  const deliveryCharge = getDeliveryCharge(districtValue, settings, subtotal);
  return { deliveryCharge, total: subtotal + deliveryCharge };
}
