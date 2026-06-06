'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { useMurdaPage } from '@/components/product/murda-moshari/MurdaPageContext';
import { murdaWhatsAppHref } from '@/components/product/murda-moshari/murda-whatsapp';
import { formatBdtPrice } from '@/lib/format-bn';
import { cn } from '@/lib/utils';

interface MurdaStickyOrderBarProps {
  onCheckout: () => void;
  pageRevealed: boolean;
}

export function MurdaStickyOrderBar({ onCheckout, pageRevealed }: MurdaStickyOrderBarProps) {
  const reduced = useReducedMotion();
  const { hero, pricing } = useMurdaPage();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pageRevealed) {
      setShow(false);
      return;
    }
    const delay = reduced ? 0 : 350;
    const t = window.setTimeout(() => setShow(true), delay);
    return () => window.clearTimeout(t);
  }, [pageRevealed, reduced]);

  const handleCheckout = useCallback(() => {
    if (busy) return;
    setBusy(true);
    onCheckout();
  }, [busy, onCheckout]);

  if (!show) return null;

  const orderLabel = `${hero.primaryCta} — ${formatBdtPrice(pricing.offerPrice)}`;
  const waHref = murdaWhatsAppHref(hero.whatsappNumber, hero.whatsappPrefill);

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-50 md:inset-x-auto md:bottom-8 md:left-8"
      initial={reduced ? false : { y: 72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      role="region"
      aria-label="দ্রুত অর্ডার"
    >
      {/* Mobile: full-width bar with order + WhatsApp */}
      <div
        className={cn(
          'flex items-stretch gap-2 border-t border-emerald/15 bg-cream/95 px-4 py-3 shadow-[0_-10px_40px_rgba(42,38,34,0.14)] backdrop-blur-md md:hidden',
          'pb-[max(0.75rem,env(safe-area-inset-bottom))]'
        )}
      >
        <button
          type="button"
          onClick={handleCheckout}
          disabled={busy}
          className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-emerald px-4 font-bn-body text-base font-semibold text-cream shadow-lg transition-transform active:scale-[0.98] disabled:opacity-75"
        >
          <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden />
          <span className="truncate">{busy ? 'অর্ডার হচ্ছে…' : orderLabel}</span>
        </button>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={hero.whatsappCta}
          className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#25D366] text-cream shadow-lg transition-transform active:scale-[0.98]"
        >
          <WhatsAppIcon className="h-6 w-6" />
        </a>
      </div>

      {/* Desktop: floating order pill (WhatsApp stays global, bottom-right) */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={busy}
        className="hidden min-h-[56px] items-center justify-center gap-2 rounded-full bg-emerald px-7 py-4 font-bn-body text-base font-semibold text-cream shadow-[0_10px_36px_rgba(45,95,79,0.38)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_44px_rgba(45,95,79,0.45)] active:scale-[0.98] disabled:opacity-75 md:inline-flex"
      >
        <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden />
        {busy ? 'অর্ডার হচ্ছে…' : orderLabel}
      </button>
    </motion.div>
  );
}
