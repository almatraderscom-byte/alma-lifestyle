'use client';

import { CartItemThumbnail } from '@/components/cart/CartItemThumbnail';
import { CART, CHECKOUT } from '@/lib/content';
import { pickUiText } from '@/lib/ui-copy';
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
  /** Compact layout for inline mobile summary card */
  compact?: boolean;
  showSubmitButton?: boolean;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  districtValue,
  className,
  compact = false,
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
      className={cn('ob-cc-card p-6 space-y-4', className)}
    >
      <h2
        className={cn(
          'font-bn-heading font-bold text-white border-b border-white/10 pb-3',
          compact ? 'text-lg' : 'text-xl'
        )}
      >
        {pickUiText(settings, 'checkout.orderSummaryTitle', CHECKOUT.orderSummaryTitle)}
      </h2>

      <ul
        className={cn(
          'space-y-3 overflow-y-auto',
          compact ? 'max-h-40' : 'max-h-56'
        )}
      >
        {items.map((item) => {
          const unit = getLineUnitPrice(item);
          return (
            <li key={item.variantId} className="flex gap-3">
              <CartItemThumbnail
                image={item.image}
                slug={item.slug}
                title={livePrices[item.productId]?.title ?? item.title}
                className="h-14 w-11"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bn-body text-sm font-medium text-white line-clamp-2">
                  {livePrices[item.productId]?.title ?? item.title}
                </p>
                <p className="font-bn-body text-xs text-white/50 mt-0.5">
                  ×{item.quantity} — {formatBdtPrice(unit * item.quantity)}
                </p>
                {isLinePriceChanged(item) && (
                  <p className="font-bn-body text-[10px] text-amber-300 mt-0.5">দাম আপডেট হয়েছে</p>
                )}
                {isLineUnavailable(item) && (
                  <p className="font-bn-body text-[10px] text-red-400 mt-0.5">{CART.stockOut}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="space-y-2 pt-2 border-t border-white/10 text-sm font-bn-body">
        <div className="flex justify-between">
          <span className="text-white/50">
            {CHECKOUT.subtotal} ({items.length})
          </span>
          <span className="font-semibold text-white">{formatBdtPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between gap-2">
          <span className="text-white/50">{CHECKOUT.delivery}</span>
          <span
            className={cn(
              'font-semibold text-right text-white',
              freeAtThreshold && 'text-emerald-400'
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
          <div className="ob-cc-warn p-3 text-xs">
            {CHECKOUT.freeDeliveryHint}: আরও {formatBdtPrice(amountToFree)}
          </div>
        )}
      </div>

      <div className="ob-cc-total-rule flex justify-between items-baseline pt-4">
        <span className="font-bn-heading text-lg font-bold text-white">{CHECKOUT.total}</span>
        <span className="ob-cc-total-figure font-bn-heading text-2xl">
          {formatBdtPrice(total)}
        </span>
      </div>

      {showSubmitButton && (
        <button
          type="submit"
          form="checkout-form"
          disabled={submitDisabled || isSubmitting}
          className="ob-cc-cta"
        >
          {isSubmitting
            ? CHECKOUT.submitting
            : `${pickUiText(settings, 'checkout.submit', CHECKOUT.submit)} →`}
        </button>
      )}

      <ul className="space-y-2 pt-2 border-t border-white/10 text-xs font-bn-body text-white/50">
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
