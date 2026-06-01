'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckoutForm, type CheckoutFormData } from '@/components/checkout/CheckoutForm';
import { OrderSummary, useOrderTotals } from '@/components/checkout/OrderSummary';
import { OrderSubmittingAnimation } from '@/components/checkout/OrderSubmittingAnimation';
import { useCart } from '@/context/CartContext';
import { fetchLiveCartPrices } from '@/lib/cart-live-prices';
import { CART, CHECKOUT } from '@/lib/content';
import { getDeliveryCharge } from '@/lib/delivery';
import { formatBdtPrice, formatVariantLabel } from '@/lib/format-bn';
import { createPlacedOrder, saveLastOrder } from '@/lib/orders';
import { shouldUseApi } from '@/lib/data-source';
import { createOrderApi } from '@/lib/admin-api';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { cn } from '@/lib/utils';

export function CheckoutPageContent() {
  const settings = useStoreSettings();
  const router = useRouter();
  const {
    items,
    subtotal,
    hydrated,
    clearCart,
    getLineUnitPrice,
    hasUnavailableItems,
    refreshLivePrices,
    livePrices,
    isLineUnavailable,
    isLinePriceChanged,
  } = useCart();
  const [districtValue, setDistrictValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceWarning, setPriceWarning] = useState<string | null>(null);

  const { total } = useOrderTotals(subtotal, districtValue);

  useEffect(() => {
    if (hydrated && items.length === 0 && !isSubmitting) {
      router.replace('/cart');
    }
  }, [hydrated, items.length, router, isSubmitting]);

  function getPaymentLabel(method: CheckoutFormData['paymentMethod']): string {
    switch (method) {
      case 'bkash':
        return CHECKOUT.paymentBkash;
      case 'nagad':
        return CHECKOUT.paymentNagad;
      default:
        return CHECKOUT.paymentCod;
    }
  }

  async function handleSubmit(data: CheckoutFormData) {
    setPriceWarning(null);
    setIsSubmitting(true);

    const submitStarted = Date.now();

    try {
      const livePrices = await fetchLiveCartPrices(items.map((i) => i.productId));
      await refreshLivePrices();

      const unavailable = items.filter(
        (i) => livePrices[i.productId] && !livePrices[i.productId].isAvailable
      );
      if (unavailable.length > 0) {
        setPriceWarning(CHECKOUT.priceWarning);
        setIsSubmitting(false);
        return;
      }

      const pricedItems = items.map((item) => {
        const unit = livePrices[item.productId]?.price ?? getLineUnitPrice(item);
        return { ...item, unitPriceBdt: unit };
      });

      const liveSubtotal = pricedItems.reduce(
        (sum, i) => sum + i.unitPriceBdt * i.quantity,
        0
      );

      const deliveryCharge = getDeliveryCharge(data.district, settings, liveSubtotal);
      const orderTotal = liveSubtotal + deliveryCharge;
      const paymentMethod = getPaymentLabel(data.paymentMethod);
      const customerName = data.name.trim();
      const customerPhone = data.phone.trim();
      const customerEmail = data.email.trim() || undefined;
      const districtLabel = data.district;
      const fullAddress = `${data.address.trim()}, ${data.thana.trim()}, ${districtLabel}, Bangladesh`;

      let orderNumber: string | undefined;
      let customerId: string | null = null;
      const supabase = getSupabaseBrowser();
      if (supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        customerId = session?.user?.id ?? null;
      }

      if (shouldUseApi()) {
        try {
          const created = await createOrderApi({
            customerId,
            customerName,
            customerPhone,
            customerEmail,
            shippingAddress: fullAddress,
            shippingCity: districtLabel,
            paymentMethod,
            items: pricedItems.map((item) => ({
              productId: item.productId,
              productSlug: item.slug,
              quantity: item.quantity,
              unitPriceBdt: item.unitPriceBdt,
              productTitle: livePrices[item.productId]?.title ?? item.title,
              productSku: item.slug,
            })),
            subtotalBdt: liveSubtotal,
            shippingCostBdt: deliveryCharge,
            totalBdt: orderTotal,
          });
          orderNumber = created.orderNumber;
        } catch (apiErr) {
          console.error('[Checkout] API order failed:', apiErr);
          throw apiErr;
        }
      }

      const order = createPlacedOrder({
        items: pricedItems.map((item) => ({
          ...item,
          priceSnapshot: item.unitPriceBdt,
        })),
        subtotal: liveSubtotal,
        deliveryCharge,
        total: orderTotal,
        paymentMethod,
        customerName,
        customerPhone,
        cityLabel: districtLabel,
      });

      if (orderNumber) {
        order.orderNumber = orderNumber;
        order.orderNumberDisplay = orderNumber;
      }

      saveLastOrder(order);
      clearCart();

      const elapsed = Date.now() - submitStarted;
      const minDisplay = 2200;
      if (elapsed < minDisplay) {
        await new Promise((r) => setTimeout(r, minDisplay - elapsed));
      }

      router.push('/checkout/confirmation');
    } catch {
      setIsSubmitting(false);
      setPriceWarning('অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  }

  if (!hydrated) {
    return (
      <div className="min-h-[40vh] bg-cream px-4 py-12">
        <div className="mx-auto max-w-4xl h-8 w-56 animate-pulse rounded bg-secondary" />
      </div>
    );
  }

  if (items.length === 0 && !isSubmitting) {
    return null;
  }

  const submitDisabled = !districtValue || hasUnavailableItems;

  return (
    <>
      {isSubmitting && <OrderSubmittingAnimation />}

      <div className="min-h-screen bg-cream">
        <section className="border-b border-border-subtle bg-white py-8 md:py-10">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <p className="font-bn-body text-xs font-medium tracking-widest text-terracotta mb-2">
              চেকআউট
            </p>
            <h1 className="font-bn-heading text-3xl md:text-4xl font-bold text-charcoal">
              আপনার অর্ডার সম্পূর্ণ করুন
            </h1>
            <p className="font-bn-body text-text-light mt-2 text-sm md:text-base">
              {items.length} টি পণ্য
              {districtValue ? ` • মোট ${formatBdtPrice(total)}` : ''}
            </p>
            <Link
              href="/cart"
              className="inline-block mt-3 font-bn-body text-sm text-terracotta hover:underline"
            >
              ← {CART.breadcrumbCart}
            </Link>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          {priceWarning && (
            <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-bn-body text-sm text-red-800">
              {priceWarning}
            </p>
          )}
          {hasUnavailableItems && !priceWarning && (
            <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 font-bn-body text-sm text-amber-900">
              {CHECKOUT.stockBlockCheckout}
            </p>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-lg border border-border-subtle bg-white shadow-sm"
              >
                <div className="border-b border-border-subtle px-6 py-4">
                  <h2 className="font-bn-heading text-xl font-bold text-charcoal">আপনার পণ্য</h2>
                </div>
                <ul className="divide-y divide-border-subtle">
                  {items.map((item) => {
                    const unit = getLineUnitPrice(item);
                    const unavailable = isLineUnavailable(item);
                    const priceChanged = isLinePriceChanged(item);
                    const title = livePrices[item.productId]?.title ?? item.title;
                    return (
                      <li
                        key={item.variantId}
                        className="flex gap-4 p-4 md:p-5 hover:bg-cream/40 transition"
                      >
                        <div
                          className={cn(
                            'h-20 w-16 md:h-24 md:w-20 shrink-0 rounded-lg',
                            item.image
                          )}
                          aria-hidden
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            className="font-bn-body font-medium text-charcoal hover:text-terracotta line-clamp-2"
                          >
                            {title}
                          </Link>
                          <p className="font-bn-body text-sm text-text-light mt-1">
                            {formatVariantLabel(item.color, item.size)}
                          </p>
                          {priceChanged && (
                            <p className="font-bn-body text-xs text-amber-700 mt-1">
                              দাম আপডেট হয়েছে
                            </p>
                          )}
                          {unavailable && (
                            <p className="font-bn-body text-xs text-red-700 mt-1">{CART.stockOutLine}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bn-heading text-lg font-bold text-terracotta">
                            {formatBdtPrice(unit * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="font-bn-body text-xs text-text-light">
                              {formatBdtPrice(unit)} × {item.quantity}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="rounded-lg border border-border-subtle bg-white p-6 shadow-sm"
              >
                <CheckoutForm
                  districtValue={districtValue}
                  onDistrictChange={setDistrictValue}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  hideSubmitButton
                />
              </motion.section>
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <OrderSummary
                  items={items}
                  subtotal={subtotal}
                  districtValue={districtValue}
                  showSubmitButton
                  isSubmitting={isSubmitting}
                  submitDisabled={submitDisabled}
                />
                <p className="sr-only" aria-live="polite">
                  মোট {formatBdtPrice(total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
