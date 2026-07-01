'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CONFIRMATION } from '@/lib/content';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { formatBdtPrice } from '@/lib/format-bn';
import { loadLastOrder, type PlacedOrder } from '@/lib/orders';
import { trackLead, trackPurchaseOnce } from '@/lib/pixel';
import { cn } from '@/lib/utils';
import { ObsidianShell } from '@/components/obsidian/ObsidianShell';

function lineUnitPrice(item: PlacedOrder['items'][number]): number {
  return item.priceSnapshot ?? item.price ?? 0;
}

export function ConfirmationPageContent() {
  const router = useRouter();
  const settings = useStoreSettings();
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadLastOrder();
    setOrder(loaded);
    setReady(true);
    if (!loaded) {
      router.replace('/cart');
      return;
    }

    trackPurchaseOnce({
      orderNumber: loaded.orderNumber,
      value: loaded.total,
      currency: 'BDT',
      content_type: 'product',
      num_items: loaded.items.reduce((n, i) => n + i.quantity, 0),
      contents: loaded.items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        item_price: lineUnitPrice(item),
      })),
    });
  }, [router]);

  if (!ready || !order) {
    return (
      <ObsidianShell className="ob-doc ob-confirm" marquee={{}}>
        <section className="doc-body">
          <div className="container text-center">
            <div className="h-8 w-48 mx-auto animate-pulse rounded bg-white/10" />
          </div>
        </section>
      </ObsidianShell>
    );
  }

  const whatsappMessage = `আসসালামু আলাইকুম, আমার অর্ডার নম্বর: ${order.orderNumber}। অর্ডার ট্র্যাক করতে চাই।`;
  const whatsappHref = buildWhatsAppHref(settings, whatsappMessage);

  return (
    <ObsidianShell className="ob-doc ob-confirm" marquee={{}}>
      <section className="doc-body">
      <div className="ob-confirm-card mx-auto max-w-lg px-5 py-10 md:py-16 text-center">
      <div className="ob-cc-success mx-auto">
        <CheckIcon className="h-10 w-10" />
      </div>

      <h1 className="font-bn-heading text-2xl sm:text-[1.75rem] font-bold text-white mt-6 leading-relaxed">
        {CONFIRMATION.title}
      </h1>

      <p className="font-bn-body text-base text-white/50 mt-3">
        {CONFIRMATION.orderNumberPrefix}{' '}
        <span className="ob-cc-accent font-semibold">{order.orderNumberDisplay}</span>
      </p>

      <div className="mt-8 text-left rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-3">
        <h2 className="font-bn-heading text-lg font-bold text-white">
          {CONFIRMATION.summaryTitle}
        </h2>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li
              key={item.variantId}
              className="flex justify-between gap-2 font-bn-body text-sm text-white/80"
            >
              <span className="line-clamp-1">
                {item.title} ×{item.quantity}
              </span>
              <span className="shrink-0 font-medium">
                {formatBdtPrice(lineUnitPrice(item) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="pt-3 border-t border-white/10 space-y-1.5 font-bn-body text-sm text-white/80">
          <div className="flex justify-between">
            <span className="text-white/50">{CONFIRMATION.subtotal}</span>
            <span>{formatBdtPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">{CONFIRMATION.delivery}</span>
            <span>
              {order.deliveryCharge === 0
                ? formatBdtPrice(0)
                : formatBdtPrice(order.deliveryCharge)}
            </span>
          </div>
          <div className="ob-cc-total-rule flex justify-between font-bn-heading text-lg font-bold pt-2 mt-1">
            <span className="text-white">{CONFIRMATION.total}</span>
            <span className="ob-cc-total-figure">{formatBdtPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <p className="font-bn-body text-base text-white/50 mt-6">{CONFIRMATION.contactSoon}</p>

      <div className="mt-8 space-y-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackLead()}
          className="ob-cc-wa min-h-14 text-lg"
        >
          {CONFIRMATION.whatsappTrack}
        </a>
        <Link
          href="/products"
          className="flex w-full min-h-12 items-center justify-center rounded-xl border border-white/20 font-bn-body text-base font-semibold text-white hover:bg-white/[0.06] hover:border-white/30 transition-colors"
        >
          {CONFIRMATION.continueShopping}
        </Link>
        <Link
          href="/"
          className="flex w-full min-h-12 items-center justify-center font-bn-body text-base text-white/60 underline underline-offset-4 hover:text-white transition-colors"
        >
          {CONFIRMATION.goHome}
        </Link>
      </div>
      </div>
      </section>
    </ObsidianShell>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn(className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
