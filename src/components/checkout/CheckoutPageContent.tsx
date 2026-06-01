'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { CheckoutForm, type CheckoutFormData } from '@/components/checkout/CheckoutForm';
import { OrderSummary, useOrderTotals } from '@/components/checkout/OrderSummary';
import { useCart } from '@/context/CartContext';
import { fetchLiveCartPrices } from '@/lib/cart-live-prices';
import { BREADCRUMB, CART, CHECKOUT } from '@/lib/content';
import { getDeliveryCharge } from '@/lib/delivery';
import { createPlacedOrder, saveLastOrder } from '@/lib/orders';
import { shouldUseApi } from '@/lib/data-source';
import { createOrderApi } from '@/lib/admin-api';
import { useStoreSettings } from '@/context/StoreSettingsContext';

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
  } = useCart();
  const [cityValue, setCityValue] = useState('dhaka');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceWarning, setPriceWarning] = useState<string | null>(null);

  const { total } = useOrderTotals(subtotal, cityValue);

  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace('/cart');
    }
  }, [hydrated, items.length, router]);

  function getCityLabel(value: string): string {
    return CHECKOUT.cities.find((c) => c.value === value)?.label ?? value;
  }

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

    const livePrices = await fetchLiveCartPrices(items.map((i) => i.productId));
    await refreshLivePrices();

    const unavailable = items.filter((i) => livePrices[i.productId] && !livePrices[i.productId].isAvailable);
    if (unavailable.length > 0) {
      setPriceWarning('কিছু পণ্য স্টকে নেই। কার্ট থেকে সরিয়ে আবার চেষ্টা করুন।');
      setIsSubmitting(false);
      return;
    }

    const pricedItems = items.map((item) => {
      const unit =
        livePrices[item.productId]?.price ?? getLineUnitPrice(item);
      return { ...item, unitPriceBdt: unit };
    });

    const liveSubtotal = pricedItems.reduce(
      (sum, i) => sum + i.unitPriceBdt * i.quantity,
      0
    );

    const deliveryCharge = getDeliveryCharge(data.city, settings);
    const total = liveSubtotal + deliveryCharge;
    const paymentMethod = getPaymentLabel(data.paymentMethod);
    const customerName = data.name.trim();
    const customerPhone = data.phone.trim();
    const customerEmail = data.email.trim() || undefined;
    const cityLabel = getCityLabel(data.city);

    let orderNumber: string | undefined;

    if (shouldUseApi()) {
      try {
        const created = await createOrderApi({
          customerName,
          customerPhone,
          customerEmail,
          shippingAddress: `${cityLabel}, Bangladesh`,
          shippingCity: cityLabel,
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
          totalBdt: total,
        });
        orderNumber = created.orderNumber;
      } catch {
        /* fall back to local order record */
      }
    }

    const order = createPlacedOrder({
      items: pricedItems.map((item) => ({
        ...item,
        priceSnapshot: item.unitPriceBdt,
      })),
      subtotal: liveSubtotal,
      deliveryCharge,
      total,
      paymentMethod,
      customerName,
      customerPhone,
      cityLabel,
    });

    if (orderNumber) {
      order.orderNumber = orderNumber;
      order.orderNumberDisplay = orderNumber;
    }

    saveLastOrder(order);
    clearCart();

    await new Promise((r) => setTimeout(r, 600));
    router.push('/checkout/confirmation');
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="h-8 w-56 animate-pulse rounded bg-secondary" />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <Breadcrumb
        items={[
          { label: BREADCRUMB.home, href: '/' },
          { label: CART.breadcrumbCart, href: '/cart' },
          { label: CHECKOUT.breadcrumbCheckout },
        ]}
        className="mb-4"
      />

      <h1 className="font-bn-heading text-2xl sm:text-3xl font-bold text-primary mb-8">
        {CHECKOUT.title}
      </h1>

      {priceWarning && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 font-bn-body text-sm text-amber-900">
          {priceWarning}
        </p>
      )}
      {hasUnavailableItems && !priceWarning && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-bn-body text-sm text-red-800">
          কার্টে স্টকে নেই এমন পণ্য আছে — চেকআউটের আগে সরিয়ে ফেলুন।
        </p>
      )}

      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10 lg:items-start">
        <div className="order-2 lg:order-1">
          <CheckoutForm
            cityValue={cityValue}
            onCityChange={setCityValue}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        <div className="order-1 lg:order-2 mb-8 lg:mb-0 lg:sticky lg:top-24">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            cityValue={cityValue}
          />
          <p className="sr-only" aria-live="polite">
            মোট {total}
          </p>
        </div>
      </div>

      <p className="lg:hidden mt-6 text-center">
        <Link href="/cart" className="font-bn-body text-sm text-accent underline">
          ← {CART.breadcrumbCart}
        </Link>
      </p>
    </div>
  );
}
