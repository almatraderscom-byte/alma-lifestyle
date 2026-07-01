'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CartItemThumbnail } from '@/components/cart/CartItemThumbnail';
import { ProductCard } from '@/components/product/ProductCard';
import { ObsidianShell } from '@/components/obsidian/ObsidianShell';
import { SplitBadge } from '@/components/obsidian/SplitBadge';
import { FloatingWord } from '@/components/obsidian/FloatingWord';
import { useCart } from '@/context/CartContext';
import { CART, SITE } from '@/lib/content';
import { getZoneCharges, getFreeDeliveryThreshold } from '@/lib/delivery-settings';
import { trackLead } from '@/lib/pixel';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import {
  formatBdtPrice,
  formatItemCount,
  formatVariantLabel,
  toBanglaNumber,
} from '@/lib/format-bn';
import { isFreeDelivery } from '@/lib/delivery';
import type { FeaturedProduct } from '@/lib/content';
import { CATALOG_PRODUCTS, toCardProduct } from '@/lib/products-data';
import { shouldUseStaticDemoCatalog } from '@/lib/storefront/catalog-source';

interface CartPageContentProps {
  recommendations?: FeaturedProduct[];
}

export function CartPageContent({ recommendations = [] }: CartPageContentProps) {
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

  const suggested = useMemo(() => {
    const inCart = new Set(items.map((i) => i.productId));
    const source = shouldUseStaticDemoCatalog()
      ? CATALOG_PRODUCTS.map(toCardProduct)
      : recommendations;
    return source.filter((p) => !inCart.has(p.id)).slice(0, 4);
  }, [items, recommendations]);

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

  const cartHero = (
    <section className="doc-hero">
      <div className="container">
        <SplitBadge dark="ALMA" light="ব্যাগ" />
        <FloatingWord text="YOUR BAG" tone="light" className="doc-hero-word" />
        <h1 className="doc-hero-title bn-serif">{CART.title}</h1>
        {hydrated && items.length > 0 && (
          <p className="doc-hero-sub bn">{formatItemCount(itemCount)}</p>
        )}
      </div>
    </section>
  );

  if (!hydrated) {
    return (
      <ObsidianShell className="ob-doc ob-cart" marquee={{}}>
        {cartHero}
        <section className="doc-body">
          <div className="container">
            <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
          </div>
        </section>
      </ObsidianShell>
    );
  }

  if (items.length === 0) {
    return (
      <ObsidianShell className="ob-doc ob-cart" marquee={{}}>
        {cartHero}
        <section className="doc-body">
          <div className="container">
            <div className="ob-cart-empty px-6 py-20 text-center">
              <EmptyBagIcon className="ob-cart-empty-icon mx-auto h-20 w-20" />
              <h2 className="font-bn-heading text-2xl font-bold text-white mt-6">
                {CART.emptyTitle}
              </h2>
              <Link href={CART.emptyHref} className="ob-btn solid mt-8">
                {CART.emptyCta}
              </Link>
            </div>
          </div>
        </section>
      </ObsidianShell>
    );
  }

  return (
    <ObsidianShell className="ob-doc ob-cart" marquee={{}}>
      {cartHero}
      <div className="doc-body">
        <div className="container ob-cart-wrap">
          <div className="grid gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="ob-cc-card">
              <div className="ob-cc-head">
                <h2 className="ob-cc-head-title">আপনার পণ্য</h2>
              </div>
              <ul className="ob-cc-divide">
                {items.map((item) => {
                  const unitPrice = getLineUnitPrice(item);
                  const lineTotal = unitPrice * item.quantity;
                  const unavailable = isLineUnavailable(item);
                  const priceChanged = isLinePriceChanged(item);
                  const displayTitle = livePrices[item.productId]?.title ?? item.title;
                  return (
                    <li
                      key={item.variantId}
                      className="ob-cc-row flex gap-4 p-4 md:p-5"
                    >
                      <CartItemThumbnail
                        image={item.image}
                        slug={item.slug}
                        title={displayTitle}
                        className="h-20 w-16 md:h-24 md:w-20"
                      />
                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <div className="flex justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/products/${item.slug}`}
                              className="font-bn-body text-base font-medium text-white line-clamp-2 transition-colors hover:text-[var(--ob-violet,#7c5cff)]"
                            >
                              {displayTitle}
                            </Link>
                            <p className="font-bn-body text-sm text-white/50 mt-0.5">
                              {formatVariantLabel(item.color, item.size)}
                            </p>
                            {priceChanged && (
                              <p className="font-bn-body text-xs text-amber-300 mt-1">
                                দাম পরিবর্তিত হয়েছে (পূর্বে {formatBdtPrice(item.priceSnapshot)})
                              </p>
                            )}
                            {unavailable && (
                              <p className="ob-cc-error font-bn-body text-xs mt-1 px-2 py-1 inline-block">
                                {CART.stockOutLine}
                              </p>
                            )}
                          </div>
                          <p className="ob-cc-accent font-bn-heading text-lg font-bold shrink-0">
                            {formatBdtPrice(lineTotal)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="ob-cc-stepper">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.variantId, Math.max(1, item.quantity - 1))
                              }
                              aria-label={CART.decreaseQty}
                              disabled={item.quantity <= 1}
                            >
                              −
                            </button>
                            <span className="ob-cc-qty font-bn-heading">
                              {toBanglaNumber(item.quantity)}
                            </span>
                            <button
                              type="button"
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
                            className="font-bn-body text-sm text-white/50 hover:text-red-400 hover:underline transition-colors min-h-10 px-2"
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
            <div className="ob-cc-card p-6 lg:sticky lg:top-24 space-y-4">
              <h2 className="font-bn-heading text-xl font-bold text-white border-b border-white/10 pb-3">
                সারাংশ
              </h2>

              <div className="space-y-2 font-bn-body text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">{CART.subtotal}</span>
                  <span className="font-semibold text-white">{formatBdtPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-white/50">{CART.delivery}</span>
                  <span className="font-semibold text-white text-right text-sm">
                    {freeDelivery ? (
                      <span className="text-emerald-400">{CART.deliveryFreeDhaka}</span>
                    ) : (
                      CART.deliveryAtCheckout
                    )}
                  </span>
                </div>
                {!freeDelivery && (
                  <p className="text-xs text-white/40 leading-relaxed">
                    {CART.deliveryFrom} ৳{charges.dhaka_city} (ঢাকা সিটি) • ঢাকার বাইরে ৳
                    {charges.outside_dhaka} • ৳{freeThreshold.toLocaleString('en-US')}+ ফ্রি
                  </p>
                )}
              </div>

              <div className="ob-cc-total-rule flex justify-between pt-4">
                <span className="font-bn-heading text-lg font-bold text-white">
                  {CART.subtotal}
                </span>
                <span className="ob-cc-total-figure font-bn-heading text-2xl">
                  {formatBdtPrice(subtotal)}
                </span>
              </div>

              {hasUnavailableItems && (
                <p className="font-bn-body text-sm text-red-400 text-center">
                  {CART.stockOutCheckout}
                </p>
              )}

              <Link
                href={hasUnavailableItems ? '#' : '/checkout'}
                aria-disabled={hasUnavailableItems}
                className="ob-cc-cta"
              >
                {CART.checkout} →
              </Link>

              <p className="text-center font-bn-body text-sm text-white/40">{CART.whatsappOr}</p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLead()}
                className="ob-cc-wa"
              >
                {CART.whatsappOrder}
              </a>

              <ul className="flex flex-wrap justify-center gap-2 pt-2">
                {CART.trustBadges.map((badge) => (
                  <li key={badge} className="ob-cc-chip font-bn-body">
                    {badge}
                  </li>
                ))}
              </ul>
            </div>
          </motion.aside>
        </div>

        {suggested.length > 0 && (
          <section className="mt-12 md:mt-16 border-t border-white/10 pt-10">
            <h2 className="font-bn-heading text-xl font-bold text-white mb-6">
              {CART.recommendationsTitle}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {suggested.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          </section>
        )}
        </div>
      </div>
    </ObsidianShell>
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
