'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MURDA_MOSHARI_PAGE, SITE } from '@/lib/content';
import {
  calmEase,
  fadeUp,
  murdaViewport,
  staggerContainer,
  useMurdaMotionTiming,
} from '@/components/product/murda-moshari/animation-config';

const PHONE_TEL = 'tel:+8801307777733';
const WHATSAPP_URL = `https://wa.me/${SITE.whatsappNumber}`;

export function TrustFooterSection() {
  const { trustFooter, hero } = MURDA_MOSHARI_PAGE;
  const reduced = useReducedMotion();
  const { duration, stagger, transition } = useMurdaMotionTiming();
  const Wrapper = reduced ? 'section' : motion.section;

  return (
    <Wrapper className="overflow-visible border-t border-border-subtle bg-cream py-12 md:py-14">
      <motion.div
        className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3 md:gap-10"
        {...(!reduced && {
          variants: staggerContainer(stagger(0.2)),
          initial: 'hidden',
          whileInView: 'visible',
          viewport: murdaViewport,
        })}
      >
        {reduced ? (
          <>
            <TrustPhone />
            <TrustWhatsApp />
            <TrustAddress />
          </>
        ) : (
          <>
            <motion.div variants={fadeUp}>
              <TrustPhone animated />
            </motion.div>
            <motion.div variants={fadeUp}>
              <TrustWhatsApp animated />
            </motion.div>
            <motion.div variants={fadeUp}>
              <TrustAddress animated />
            </motion.div>
          </>
        )}
      </motion.div>
      {reduced ? (
        <p className="font-bn-heading mx-auto mt-10 max-w-2xl px-4 text-center text-sm italic text-charcoal/80 md:text-base">
          {trustFooter.closing}
        </p>
      ) : (
        <motion.p
          className="font-bn-heading mx-auto mt-10 max-w-2xl px-4 text-center text-sm italic text-charcoal/80 md:text-base"
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, filter: 'blur(0px)' }}
          viewport={murdaViewport}
          transition={{ duration: duration(1.2), ease: calmEase }}
        >
          {trustFooter.closing}
        </motion.p>
      )}
    </Wrapper>
  );
}

function TrustPhone({ animated }: { animated?: boolean }) {
  const { trustFooter, hero } = MURDA_MOSHARI_PAGE;
  const reduced = useReducedMotion();
  const { duration, transition } = useMurdaMotionTiming();
  const LinkTag = animated && !reduced ? motion.a : 'a';

  return (
    <LinkTag
      href={PHONE_TEL}
      className="group block rounded-xl p-2 text-center md:text-left"
      {...(animated &&
        !reduced && {
          whileInView: { rotate: [0, -8, 8, -4, 0] },
          viewport: murdaViewport,
          transition: transition({ duration: duration(0.8) }),
          whileHover: { rotate: [0, -6, 6, -3, 0], transition: { duration: 0.6 } },
        })}
    >
      <p className="font-bn-heading text-lg font-semibold text-charcoal">
        📞 {trustFooter.callTitle}
      </p>
      <p className="font-bn-body mt-2 text-base text-emerald group-hover:underline">
        {hero.phone}
      </p>
      <p className="font-bn-body mt-1 text-sm text-charcoal/70">{trustFooter.callHours}</p>
    </LinkTag>
  );
}

function TrustWhatsApp({ animated }: { animated?: boolean }) {
  const { trustFooter, hero } = MURDA_MOSHARI_PAGE;
  const reduced = useReducedMotion();

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-visible rounded-xl p-2 text-center md:text-left"
    >
      {animated && !reduced && (
        <motion.span
          className="pointer-events-none absolute left-1/2 top-6 h-12 w-12 -translate-x-1/2 rounded-full border-2 border-[#25D366]/40 md:left-8"
          initial={{ scale: 0.6, opacity: 0.6 }}
          whileInView={{ scale: 1.8, opacity: 0 }}
          viewport={murdaViewport}
          transition={{ duration: 1.2, ease: calmEase }}
          aria-hidden
        />
      )}
      <p className="font-bn-heading text-lg font-semibold text-charcoal">
        {trustFooter.whatsappTitle}
      </p>
      <p className="font-bn-body mt-2 inline-flex rounded-full border border-emerald/30 px-3 py-1 text-base text-emerald group-hover:border-[#25D366] group-hover:bg-[#25D366]/10">
        {hero.phone}
      </p>
    </a>
  );
}

function TrustAddress({ animated }: { animated?: boolean }) {
  const { trustFooter } = MURDA_MOSHARI_PAGE;
  const reduced = useReducedMotion();
  const { duration, transition } = useMurdaMotionTiming();
  const Block = animated && !reduced ? motion.div : 'div';

  return (
    <Block
      className="text-center md:text-left"
      {...(animated &&
        !reduced && {
          initial: { opacity: 0, y: -8 },
          whileInView: { opacity: 1, y: 0 },
          viewport: murdaViewport,
          transition: transition({ duration: duration(0.8), ease: calmEase }),
        })}
    >
      <p className="font-bn-heading text-lg font-semibold text-charcoal">
        📍 {trustFooter.addressTitle}
      </p>
      <p className="font-bn-body mt-2 text-sm leading-relaxed text-charcoal/70 md:text-base">
        {trustFooter.address}
      </p>
    </Block>
  );
}
