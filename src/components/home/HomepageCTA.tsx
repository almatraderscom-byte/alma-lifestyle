'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { SITE } from '@/lib/content';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { scrollViewport } from '@/lib/animation-variants';

export function HomepageCTA() {
  const reduceMotion = useReducedMotion();
  const settings = useStoreSettings();
  const whatsappHref = buildWhatsAppHref(settings, SITE.whatsappPrefill);

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div
        className="absolute inset-0 bg-gradient-to-br from-maroon via-[#5c1a28] to-charcoal"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, #C97D5D 1px, transparent 1px), radial-gradient(circle at 80% 50%, #C97D5D 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        viewport={scrollViewport}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <h2 className="font-bn-heading text-3xl font-bold text-cream md:text-5xl leading-[1.35]">
          এবার আপনার পরিবারের পালা
        </h2>
        <p className="font-bn-body mt-5 text-base text-cream/85 md:text-lg">
          আজই অর্ডার করুন এবং ALMA পরিবারের অংশ হয়ে যান
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center rounded bg-terracotta px-8 font-bn-body text-base font-semibold text-white transition-colors hover:bg-[#b06d4f]"
          >
            কালেকশন দেখুন →
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center rounded border-2 border-cream/60 px-8 font-bn-body text-base font-semibold text-cream transition-colors hover:bg-cream/10"
          >
            WhatsApp এ মেসেজ করুন
          </a>
        </div>
      </motion.div>
    </section>
  );
}
