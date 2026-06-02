'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ProductCard } from '@/components/product/ProductCard';
import { useCart } from '@/context/CartContext';
import { BREADCRUMB, CART, SITE } from '@/lib/content';
import { getZoneCharges, getFreeDeliveryThreshold } from '@/lib/delivery-settings';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import {
  formatBdtPrice,
  formatItemCount,
  formatVariantLabel,
  toBanglaNumber,
} from '@/lib/format-bn';
import { isFreeDelivery } from '@/lib/delivery';
import { CATALOG_PRODUCTS, toCardProduct } from '@/lib/products-data';
import { cn } from '@/lib/utils';

export function CartPageContent() {
  const settings = useStoreSettings();
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

  const freeDelivery = isFreeDelivery(subtotal, settings);

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

  const charges = getZoneCharges(settings);
  const freeThreshold = getFreeDeliveryThreshold(settings);
  const whatsappHref = buildWhatsAppHref(settings, whatsappMessage);

  if (!hydrated) {
    return (
      <div className="min-h-[40vh] bg-cream px-4 py-12">
        <div className="mx-auto max-w-4xl h-8 w-48 animate-pulse rounded bg-secondary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
          <Breadcrumb
            items={[
              { label: BREADCRUMB.home, href: '/' },
              { label: CART.breadcrumbCart },
            ]}
            className="mb-4"
          />
          <div className="rounded-lg border border-dashed border-border-subtle bg-white py-20 text-center">
            <EmptyBagIcon className="mx-auto h-20 w-20 text-text-light" />
            <h1 className="font-bn-heading text-2xl font-bold text-charcoal mt-6">
              {CART.emptyTitle}
            </h1>
            <Link
              href={CART.emptyHref}
              className="mt-8 inline-flex min-h-14 items-center justify-center rounded-lg bg-terracotta px-8 font-bn-body text-lg font-semibold text-white hover:opacity-90 transition"
            >
              {CART.emptyCta}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <section className="border-b border-border-subtle bg-white py-8 md:py-10">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Breadcrumb
            items={[
              { label: BREADCRUMB.home, href: '/' },
              { label: CART.breadcrumbCart },
            ]}
            className="mb-4"
          />
          <p className="font-bn-body text-xs font-medium tracking-widest text-terracotta mb-2">
            {CART.breadcrumbCart}
          </p>
          <h1 className="font-bn-heading text-3xl md:text-4xl font-bold text-charcoal">
            {CART.title}
          </h1>
          <p className="font-bn-body text-text-light mt-2">{formatItemCount(itemCount)}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="overflow-hidden rounded-lg border border-border-subtle bg-white shadow-sm">
              <div className="border-b border-border-subtle px-6 py-4">
                <h2 className="font-bn-heading text-xl font-bold text-charcoal">আপনার পণ্য</h2>
              </div>
              <ul className="divide-y divide-border-subtle">
                {items.map((item) => {
                  const unitPrice = getLineUnitPrice(item);
                  const lineTotal = unitPrice * item.quantity;
                  const unavailable = isLineUnavailable(item);
                  const priceChanged = isLinePriceChanged(item);
                  const displayTitle = livePrices[item.productId]?.title ?? item.title;
                  return (
                    <li
                      key={item.variantId}
                      className="flex gap-4 p-4 md:p-5 hover:bg-cream/50 transition"
                    >
                      <div
                        className={cn(
                          'h-20 w-16 md:h-24 md:w-20 shrink-0 rounded-lg',
                          item.image
                        )}
                        aria-hidden
                      />
                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <div className="flex justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/products/${item.slug}`}
                              className="font-bn-body text-base font-medium text-charcoal line-clamp-2 hover:text-terracotta"
                            >
                              {displayTitle}
                            </Link>
                            <p className="font-bn-body text-sm text-text-light mt-0.5">
                              {formatVariantLabel(item.color, item.size)}
                            </p>
                            {priceChanged && (
                              <p className="font-bn-body text-xs text-amber-700 mt-1">
                                দাম পরিবর্তিত হয়েছে (পূর্বে {formatBdtPrice(item.priceSnapshot)})
                              </p>
                            )}
                            {unavailable && (
                              <p className="font-bn-body text-xs text-red-700 mt-1 bg-red-50 rounded px-2 py-1 inline-block">
                                {CART.stockOutLine}
                              </p>
                            )}
                          </div>
                          <p className="font-bn-heading text-lg font-bold text-terracotta shrink-0">
                            {formatBdtPrice(lineTotal)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="inline-flex items-center overflow-hidden rounded-lg border border-border-subtle">
                            <button
                              type="button"
                              className="min-h-10 min-w-10 flex items-center justify-center hover:bg-cream"
                              onClick={() =>
                                updateQuantity(item.variantId, Math.max(1, item.quantity - 1))
                              }
                              aria-label={CART.decreaseQty}
                              disabled={item.quantity <= 1}
                            >
                              −
                            </button>
                            <span className="min-w-10 text-center font-bn-heading font-semibold border-x border-border-subtle px-2">
                              {toBanglaNumber(item.quantity)}
                            </span>
                            <button
                              type="button"
                              className="min-h-10 min-w-10 flex items-center justify-center hover:bg-cream"
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
                            className="font-bn-body text-sm text-red-600 hover:underline min-h-10 px-2"
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
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-1"
          >
            <div className="rounded-lg border border-border-subtle bg-white p-6 shadow-sm lg:sticky lg:top-24 space-y-4">
              <h2 className="font-bn-heading text-xl font-bold text-charcoal border-b border-border-subtle pb-3">
                সারাংশ
              </h2>

              <div className="space-y-2 font-bn-body text-sm">
                <div className="flex justify-between">
                  <span className="text-text-light">{CART.subtotal}</span>
                  <span className="font-semibold text-charcoal">{formatBdtPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-text-light">{CART.delivery}</span>
                  <span className="font-semibold text-charcoal text-right text-sm">
                    {freeDelivery ? (
                      <span className="text-emerald-700">{CART.deliveryFreeDhaka}</span>
                    ) : (
                      CART.deliveryAtCheckout
                    )}
                  </span>
                </div>
                {!freeDelivery && (
                  <p className="text-xs text-text-light leading-relaxed">
                    {CART.deliveryFrom} ৳{charges.dhaka_city} (ঢাকা সিটি) • ঢাকার বাইরে ৳
                    {charges.outside_dhaka} • ৳{freeThreshold.toLocaleString('en-US')}+ ফ্রি
                  </p>
                )}
              </div>

              <div className="flex justify-between border-t-2 border-charcoal pt-4">
                <span className="font-bn-heading text-lg font-bold text-charcoal">
                  {CART.subtotal}
                </span>
                <span className="font-bn-heading text-2xl font-bold text-terracotta">
                  {formatBdtPrice(subtotal)}
                </span>
              </div>

              {hasUnavailableItems && (
                <p className="font-bn-body text-sm text-red-700 text-center">
                  {CART.stockOutCheckout}
                </p>
              )}

              <Link
                href={hasUnavailableItems ? '#' : '/checkout'}
                aria-disabled={hasUnavailableItems}
                className={cn(
                  'flex w-full min-h-14 items-center justify-center rounded-lg font-bn-body text-lg font-semibold transition',
                  hasUnavailableItems
                    ? 'pointer-events-none bg-neutral-300 text-neutral-500'
                    : 'bg-terracotta text-white hover:opacity-90'
                )}
              >
                {CART.checkout} →
              </Link>

              <p className="text-center font-bn-body text-sm text-text-light">{CART.whatsappOr}</p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full min-h-12 items-center justify-center rounded-lg bg-[#25D366] font-bn-body font-semibold text-white hover:bg-[#20bd5a] transition"
              >
                {CART.whatsappOrder}
              </a>

              <ul className="flex flex-wrap justify-center gap-2 pt-2">
                {CART.trustBadges.map((badge) => (
                  <li
                    key={badge}
                    className="font-bn-body text-xs text-text-light rounded-full border border-border-subtle bg-cream px-3 py-1"
                  >
                    {badge}
                  </li>
                ))}
              </ul>
            </div>
          </motion.aside>
        </div>

        {recommendations.length > 0 && (
          <section className="mt-12 md:mt-16 border-t border-border-subtle pt-10">
            <h2 className="font-bn-heading text-xl font-bold text-charcoal mb-6">
              {CART.recommendationsTitle}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recommendations.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          </section>
        )}
      </div>
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
