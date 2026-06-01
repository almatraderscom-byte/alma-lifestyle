'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ProductCard } from '@/components/product/ProductCard';
import { useCart } from '@/context/CartContext';
import { BREADCRUMB, CART, SITE } from '@/lib/content';
import {
  formatBdtPrice,
  formatItemCount,
  formatVariantLabel,
  toBanglaNumber,
} from '@/lib/format-bn';
import { getDeliveryCharge } from '@/lib/delivery';
import { CATALOG_PRODUCTS, toCardProduct } from '@/lib/products-data';
import { cn } from '@/lib/utils';

export function CartPageContent() {
  const {
    items,
    itemCount,
    subtotal,
    hydrated,
    updateQuantity,
    removeItem,
    getLineUnitPrice,
    isLineUnavailable,
    isLinePriceChanged,
    hasUnavailableItems,
    livePrices,
  } = useCart();

  const deliveryCharge = getDeliveryCharge('dhaka');
  const total = subtotal + deliveryCharge;

  const recommendations = useMemo(() => {
    const inCart = new Set(items.map((i) => i.productId));
    return CATALOG_PRODUCTS.filter((p) => !inCart.has(p.id))
      .slice(0, 4)
      .map(toCardProduct);
  }, [items]);

  const whatsappMessage = useMemo(() => {
    if (items.length === 0) return SITE.whatsappPrefill;
    const lines = items.map((i) => {
      const unit = getLineUnitPrice(i);
      return `• ${i.title} (${i.color}, ${i.size}) x${i.quantity} — ${formatBdtPrice(unit * i.quantity)}`;
    });
    return `আসসালামু আলাইকুম, আমি ALMA Lifestyle থেকে অর্ডার করতে চাই:\n\n${lines.join('\n')}\n\nমোট: ${formatBdtPrice(subtotal)}`;
  }, [items, subtotal, getLineUnitPrice]);

  const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-secondary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <Breadcrumb
          items={[
            { label: BREADCRUMB.home, href: '/' },
            { label: CART.breadcrumbCart },
          ]}
          className="mb-4"
        />
        <div className="py-16 text-center">
          <EmptyBagIcon className="mx-auto h-20 w-20 text-text-light" />
          <h1 className="font-bn-heading text-2xl font-bold text-primary mt-6">
            {CART.emptyTitle}
          </h1>
          <Link
            href={CART.emptyHref}
            className="mt-8 inline-flex min-h-14 items-center justify-center rounded-lg bg-accent px-8 font-bn-body text-lg font-semibold text-white hover:bg-[#7a6549] transition-colors"
          >
            {CART.emptyCta}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <Breadcrumb
        items={[
          { label: BREADCRUMB.home, href: '/' },
          { label: CART.breadcrumbCart },
        ]}
        className="mb-4"
      />

      <header className="mb-6 md:mb-8">
        <h1 className="font-bn-heading text-2xl sm:text-3xl font-bold text-primary">
          {CART.title}
        </h1>
        <p className="font-bn-body text-base text-text-light mt-1">{formatItemCount(itemCount)}</p>
      </header>

      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-10 lg:items-start">
        <ul className="space-y-4">
          {items.map((item) => {
            const unitPrice = getLineUnitPrice(item);
            const lineTotal = unitPrice * item.quantity;
            const unavailable = isLineUnavailable(item);
            const priceChanged = isLinePriceChanged(item);
            const displayTitle = livePrices[item.productId]?.title ?? item.title;
            return (
              <li
                key={item.variantId}
                className="flex gap-3 sm:gap-4 rounded-xl border border-border-subtle bg-background p-3 sm:p-4"
              >
                <div
                  className={cn('h-20 w-16 sm:h-24 sm:w-20 shrink-0 rounded-lg', item.image)}
                  aria-hidden
                />
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-bn-body text-base font-medium text-primary line-clamp-2 hover:text-accent"
                      >
                        {displayTitle}
                      </Link>
                      <p className="font-bn-body text-sm text-text-light mt-0.5">
                        {formatVariantLabel(item.color, item.size)}
                      </p>
                      <p className="font-bn-heading text-lg font-bold text-primary mt-1">
                        {formatBdtPrice(unitPrice)}
                      </p>
                      {priceChanged && (
                        <p className="font-bn-body text-xs text-amber-700 mt-1">
                          দাম পরিবর্তিত হয়েছে (পূর্বে {formatBdtPrice(item.priceSnapshot)})
                        </p>
                      )}
                      {unavailable && (
                        <p className="font-bn-body text-xs text-red-700 mt-1 bg-red-50 rounded px-2 py-1">
                          ⚠️ এই পণ্যটি এখন স্টকে নেই
                        </p>
                      )}
                    </div>
                    <p className="font-bn-heading text-lg font-bold text-primary shrink-0">
                      {formatBdtPrice(lineTotal)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center border border-border-subtle rounded-lg overflow-hidden">
                      <button
                        type="button"
                        className="min-h-11 min-w-11 flex items-center justify-center text-lg hover:bg-secondary"
                        onClick={() =>
                          updateQuantity(item.variantId, Math.max(1, item.quantity - 1))
                        }
                        aria-label={CART.decreaseQty}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="min-w-10 text-center font-bn-heading font-semibold">
                        {toBanglaNumber(item.quantity)}
                      </span>
                      <button
                        type="button"
                        className="min-h-11 min-w-11 flex items-center justify-center text-lg hover:bg-secondary"
                        onClick={() =>
                          updateQuantity(item.variantId, Math.min(10, item.quantity + 1))
                        }
                        aria-label={CART.increaseQty}
                        disabled={item.quantity >= 10}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="font-bn-body text-sm text-red-600 hover:text-red-700 min-h-11 px-2"
                      onClick={() => removeItem(item.variantId)}
                    >
                      {CART.remove}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="mt-8 lg:mt-0 lg:sticky lg:top-24 space-y-4">
          <div className="rounded-xl border border-border-subtle bg-warm-white p-5 space-y-3">
            <div className="flex justify-between font-bn-body text-base">
              <span className="text-text-light">{CART.subtotal}</span>
              <span className="font-semibold text-primary">{formatBdtPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between font-bn-body text-base gap-4">
              <span className="text-text-light">{CART.delivery}</span>
              <span className="font-semibold text-primary text-right text-sm sm:text-base">
                {deliveryCharge === 0
                  ? CART.deliveryFreeDhaka
                  : `${CART.deliveryOutside} ${formatBdtPrice(deliveryCharge)}`}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-border-subtle">
              <span className="font-bn-heading text-lg font-bold text-primary">{CART.total}</span>
              <span className="font-bn-heading text-2xl font-bold text-primary">
                {formatBdtPrice(total)}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder={CART.couponPlaceholder}
                aria-label={CART.couponLabel}
                className="flex-1 min-h-12 rounded-lg border border-border-subtle px-3 font-bn-body text-base bg-background"
              />
              <button
                type="button"
                className="min-h-12 px-4 rounded-lg border border-primary font-bn-body text-sm font-semibold text-primary hover:bg-secondary transition-colors"
              >
                {CART.couponApply}
              </button>
            </div>

            {hasUnavailableItems && (
              <p className="font-bn-body text-sm text-red-700 text-center">
                স্টকে নেই এমন পণ্য সরিয়ে চেকআউট করুন
              </p>
            )}
            <Link
              href={hasUnavailableItems ? '#' : '/checkout'}
              aria-disabled={hasUnavailableItems}
              className={cn(
                'flex w-full min-h-14 items-center justify-center rounded-lg font-bn-body text-lg font-semibold transition-colors',
                hasUnavailableItems
                  ? 'pointer-events-none bg-neutral-300 text-neutral-500'
                  : 'bg-accent text-white hover:bg-[#7a6549]'
              )}
            >
              {CART.checkout}
            </Link>

            <p className="text-center font-bn-body text-sm text-text-light">{CART.whatsappOr}</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full min-h-12 items-center justify-center rounded-lg bg-[#25D366] text-white font-bn-body text-base font-semibold hover:bg-[#20bd5a] transition-colors"
            >
              {CART.whatsappOrder}
            </a>

            <ul className="flex flex-wrap justify-center gap-3 pt-2">
              {CART.trustBadges.map((badge) => (
                <li
                  key={badge}
                  className="font-bn-body text-xs text-text-light bg-background border border-border-subtle rounded-full px-3 py-1.5"
                >
                  {badge}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {recommendations.length > 0 && (
        <section className="mt-12 md:mt-16 border-t border-border-subtle pt-10">
          <h2 className="font-bn-heading text-xl font-bold text-primary mb-6">
            {CART.recommendationsTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recommendations.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyBagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6L5 3H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}
