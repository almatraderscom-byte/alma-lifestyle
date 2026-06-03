'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { useMurdaPage } from '@/components/product/murda-moshari/MurdaPageContext';
import { murdaWhatsAppHref } from '@/components/product/murda-moshari/murda-whatsapp';
import {
  calmEase,
  murdaViewport,
  useMurdaMotionTiming,
} from '@/components/product/murda-moshari/animation-config';

export function TrustFooterSection() {
  const page = useMurdaPage();
  const { trustFooter } = page;
  const reduced = useReducedMotion();
  const { duration, transition } = useMurdaMotionTiming();
  const waHref = murdaWhatsAppHref(trustFooter.whatsappNumber, page.hero.whatsappPrefill);
  const Wrapper = reduced ? 'section' : motion.section;

  return (
    <Wrapper className="overflow-visible border-t border-border-subtle bg-cream py-14 md:py-16">
      <div className="relative mx-auto max-w-lg px-4">
        <div className="relative overflow-hidden rounded-2xl border border-emerald/15 bg-cream p-8 text-center md:p-10">
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]"
            aria-hidden
          >
            <WhatsAppIcon className="h-32 w-32 text-[#25D366]" />
          </div>
          <p className="font-bn-body relative text-xs uppercase tracking-wider text-mustard">
            {trustFooter.whatsappEyebrow}
          </p>
          <h2 className="font-bn-heading relative mt-3 text-2xl font-semibold text-charcoal md:text-3xl">
            {trustFooter.whatsappTitle}
          </h2>
          <p className="font-bn-body relative mt-2 text-sm text-charcoal/70 md:text-base">
            {trustFooter.whatsappSubtitle}
          </p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-6 inline-flex min-h-[52px] min-w-[200px] items-center justify-center gap-2 rounded-xl bg-[#25D366] px-8 font-bn-body text-lg font-semibold text-cream transition-colors hover:bg-[#20bd5a]"
          >
            <WhatsAppIcon className="h-6 w-6" />
            {trustFooter.whatsappCta}
          </a>
        </div>

        <div className="mx-auto mt-10 flex justify-center" aria-hidden>
          <div className="h-px w-16 bg-mustard/60" />
        </div>

        {reduced ? (
          <p className="font-bn-heading mx-auto mt-8 max-w-2xl text-center text-sm italic text-charcoal/80 md:text-base">
            {trustFooter.closing}
          </p>
        ) : (
          <motion.p
            className="font-bn-heading mx-auto mt-8 max-w-2xl text-center text-sm italic text-charcoal/80 md:text-base"
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, filter: 'blur(0px)' }}
            viewport={murdaViewport}
            transition={{ duration: duration(1.2), ease: calmEase }}
          >
            {trustFooter.closing}
          </motion.p>
        )}
      </div>
    </Wrapper>
  );
}
