'use client';

import { useEffect, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { useMurdaPage } from '@/components/product/murda-moshari/MurdaPageContext';
import { murdaWhatsAppHref } from '@/components/product/murda-moshari/murda-whatsapp';

interface MobileStickyWhatsAppProps {
  pricingInView: boolean;
  pageRevealed: boolean;
}

export function MobileStickyWhatsApp({
  pricingInView,
  pageRevealed,
}: MobileStickyWhatsAppProps) {
  const reduced = useReducedMotion();
  const { hero } = useMurdaPage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!pageRevealed || reduced) {
      setShow(false);
      return;
    }
    const t = window.setTimeout(() => setShow(true), 300);
    return () => window.clearTimeout(t);
  }, [pageRevealed, reduced]);

  if (reduced || pricingInView || !show) return null;

  return (
    <motion.a
      href={murdaWhatsAppHref()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 py-4 text-cream shadow-2xl md:hidden"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="font-bn-body text-lg font-semibold">{hero.whatsappCta}</span>
    </motion.a>
  );
}

export function usePricingInView() {
  const ref = useState<HTMLElement | null>(null);
  const inView = useInView({ current: null }, { amount: 0.35, once: false });
  return { ref: ref[0], setRef: ref[1], pricingInView: inView };
}
