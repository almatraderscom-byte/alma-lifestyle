'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CartItemThumbnail } from '@/components/cart/CartItemThumbnail';
import { CheckoutForm, type CheckoutFormData } from '@/components/checkout/CheckoutForm';
import { OrderSummary, useOrderTotals } from '@/components/checkout/OrderSummary';
import { OrderSubmittingAnimation } from '@/components/checkout/OrderSubmittingAnimation';
import { useCart } from '@/context/CartContext';
import { fetchLiveCartPrices } from '@/lib/cart-live-prices';
import { CART, CHECKOUT } from '@/lib/content';
import { pickUiText } from '@/lib/ui-copy';
import { getDeliveryCharge } from '@/lib/delivery';
import { formatBdtPrice, formatVariantLabel } from '@/lib/format-bn';
import { createPlacedOrder, saveLastOrder } from '@/lib/orders';
import {
  buildPixelContentsFromCartItems,
  trackInitiateCheckout,
} from '@/lib/pixel';
import { shouldUseApi } from '@/lib/data-source';
import { createOrderApi } from '@/lib/admin-api';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { ObsidianShell } from '@/components/obsidian/ObsidianShell';
import { SplitBadge } from '@/components/obsidian/SplitBadge';
import { FloatingWord } from '@/components/obsidian/FloatingWord';

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
  const checkoutTrackedRef = useRef(false);

  const { deliveryCharge, total } = useOrderTotals(subtotal, districtValue);

  useEffect(() => {
    if (!hydrated || items.length === 0 || checkoutTrackedRef.current) return;
    checkoutTrackedRef.current = true;
    trackInitiateCheckout({
      value: subtotal,
      currency: 'BDT',
      num_items: items.reduce((n, i) => n + i.quantity, 0),
      contents: buildPixelContentsFromCartItems(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceBdt: getLineUnitPrice(item),
        }))
      ),
    });
  }, [hydrated, items, subtotal, getLineUnitPrice]);

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
      <ObsidianShell className="ob-doc ob-checkout" marquee={{}}>
        <section className="doc-body">
          <div className="container">
            <div className="h-8 w-56 animate-pulse rounded bg-white/10" />
          </div>
        </section>
      </ObsidianShell>
    );
  }

  if (items.length === 0 && !isSubmitting) {
    return null;
  }

  const submitDisabled = !districtValue || hasUnavailableItems;

  return (
    <>
      {isSubmitting && <OrderSubmittingAnimation />}

      <ObsidianShell className="ob-doc ob-checkout" marquee={{}}>
        <section className="doc-hero">
          <div className="container">
            <SplitBadge dark="ALMA" light="চেকআউট" />
            <FloatingWord text="CHECKOUT" tone="light" className="doc-hero-word" />
            <h1 className="doc-hero-title bn-serif">আপনার অর্ডার সম্পূর্ণ করুন</h1>
            <p className="doc-hero-sub bn">
              {items.length} টি পণ্য
              {districtValue ? ` • মোট ${formatBdtPrice(total)}` : ''}
            </p>
            <Link href="/cart" className="doc-hero-back bn">
              ← {CART.breadcrumbCart}
            </Link>
          </div>
        </section>

        <div className="doc-body">
          <div className="container ob-checkout-wrap">
          {priceWarning && (
            <p className="ob-cc-error mb-6 px-4 py-3 font-bn-body text-sm">
              {priceWarning}
            </p>
          )}
          {hasUnavailableItems && !priceWarning && (
            <p className="ob-cc-warn mb-6 px-4 py-3 font-bn-body text-sm">
              {CHECKOUT.stockBlockCheckout}
            </p>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="ob-cc-card"
              >
                <div className="ob-cc-head">
                  <h2 className="ob-cc-head-title">আপনার পণ্য</h2>
                </div>
                <ul className="ob-cc-divide">
                  {items.map((item) => {
                    const unit = getLineUnitPrice(item);
                    const unavailable = isLineUnavailable(item);
                    const priceChanged = isLinePriceChanged(item);
                    const title = livePrices[item.productId]?.title ?? item.title;
                    return (
                      <li
                        key={item.variantId}
                        className="ob-cc-row flex gap-4 p-4 md:p-5"
                      >
                        <CartItemThumbnail
                          image={item.image}
                          slug={item.slug}
                          title={title}
                          className="h-20 w-16 md:h-24 md:w-20"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            className="font-bn-body font-medium text-white transition-colors hover:text-[var(--ob-violet,#7c5cff)] line-clamp-2"
                          >
                            {title}
                          </Link>
                          <p className="font-bn-body text-sm text-white/50 mt-1">
                            {formatVariantLabel(item.color, item.size)}
                          </p>
                          {priceChanged && (
                            <p className="font-bn-body text-xs text-amber-300 mt-1">
                              দাম আপডেট হয়েছে
                            </p>
                          )}
                          {unavailable && (
                            <p className="font-bn-body text-xs text-red-400 mt-1">{CART.stockOutLine}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="ob-cc-accent font-bn-heading text-lg font-bold">
                            {formatBdtPrice(unit * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="font-bn-body text-xs text-white/40">
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
                className="ob-cc-card p-6"
              >
                <CheckoutForm
                  districtValue={districtValue}
                  onDistrictChange={setDistrictValue}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  hideSubmitButton
                />
              </motion.section>

              <div className="lg:hidden">
                <OrderSummary
                  items={items}
                  subtotal={subtotal}
                  districtValue={districtValue}
                  compact
                />
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-1">
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

        <div
          className="ob-cc-mobilebar lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          role="region"
          aria-label="অর্ডার নিশ্চিত করুন"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="shrink-0">
              <p className="font-bn-body text-xs text-white/50">{CHECKOUT.total}</p>
              <p className="ob-cc-total-figure font-bn-heading text-xl">
                {formatBdtPrice(total)}
              </p>
              {districtValue && deliveryCharge > 0 && (
                <p className="font-bn-body text-[10px] text-white/40">
                  {CHECKOUT.delivery}: {formatBdtPrice(deliveryCharge)}
                </p>
              )}
            </div>
            <button
              type="submit"
              form="checkout-form"
              disabled={submitDisabled || isSubmitting}
              className="ob-cc-cta flex-1 px-4 text-base"
            >
              {isSubmitting
                ? CHECKOUT.submitting
                : `${pickUiText(settings, 'checkout.submit', CHECKOUT.submit)} →`}
            </button>
          </div>
        </div>
        </div>
      </ObsidianShell>
    </>
  );
}
