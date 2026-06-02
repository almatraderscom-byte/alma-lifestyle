'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CONFIRMATION } from '@/lib/content';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { formatBdtPrice } from '@/lib/format-bn';
import { loadLastOrder, type PlacedOrder } from '@/lib/orders';
import { cn } from '@/lib/utils';

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
    }
  }, [router]);

  if (!ready || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="h-8 w-48 mx-auto animate-pulse rounded bg-secondary" />
      </div>
    );
  }

  const whatsappMessage = `আসসালামু আলাইকুম, আমার অর্ডার নম্বর: ${order.orderNumber}। অর্ডার ট্র্যাক করতে চাই।`;
  const whatsappHref = buildWhatsAppHref(settings, whatsappMessage);

  return (
    <div className="mx-auto max-w-lg px-4 py-10 md:py-16 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f5e9]">
        <CheckIcon className="h-10 w-10 text-green-600" />
      </div>

      <h1 className="font-bn-heading text-2xl sm:text-[1.75rem] font-bold text-primary mt-6 leading-relaxed">
        {CONFIRMATION.title}
      </h1>

      <p className="font-bn-body text-base text-text-light mt-3">
        {CONFIRMATION.orderNumberPrefix}{' '}
        <span className="font-semibold text-primary">{order.orderNumberDisplay}</span>
      </p>

      <div className="mt-8 text-left rounded-xl border border-border-subtle bg-warm-white p-5 space-y-3">
        <h2 className="font-bn-heading text-lg font-bold text-primary">
          {CONFIRMATION.summaryTitle}
        </h2>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li
              key={item.variantId}
              className="flex justify-between gap-2 font-bn-body text-sm text-primary"
            >
              <span className="line-clamp-1">
                {item.title} ×{item.quantity}
              </span>
              <span className="shrink-0 font-medium">
                {formatBdtPrice((item.priceSnapshot ?? item.price ?? 0) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="pt-3 border-t border-border-subtle space-y-1.5 font-bn-body text-sm">
          <div className="flex justify-between">
            <span className="text-text-light">{CONFIRMATION.subtotal}</span>
            <span>{formatBdtPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-light">{CONFIRMATION.delivery}</span>
            <span>
              {order.deliveryCharge === 0
                ? formatBdtPrice(0)
                : formatBdtPrice(order.deliveryCharge)}
            </span>
          </div>
          <div className="flex justify-between font-bn-heading text-lg font-bold pt-1">
            <span>{CONFIRMATION.total}</span>
            <span className="text-accent">{formatBdtPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <p className="font-bn-body text-base text-text-light mt-6">{CONFIRMATION.contactSoon}</p>

      <div className="mt-8 space-y-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full min-h-14 items-center justify-center rounded-lg bg-[#25D366] text-white font-bn-body text-lg font-semibold hover:bg-[#20bd5a] transition-colors"
        >
          {CONFIRMATION.whatsappTrack}
        </a>
        <Link
          href="/products"
          className="flex w-full min-h-12 items-center justify-center rounded-lg border-2 border-primary font-bn-body text-base font-semibold text-primary hover:bg-secondary transition-colors"
        >
          {CONFIRMATION.continueShopping}
        </Link>
        <Link
          href="/"
          className="flex w-full min-h-12 items-center justify-center font-bn-body text-base text-accent underline underline-offset-4"
        >
          {CONFIRMATION.goHome}
        </Link>
      </div>
    </div>
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
