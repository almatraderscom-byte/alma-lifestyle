'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMurdaPage } from '@/components/product/murda-moshari/MurdaPageContext';
import {
  calmEase,
  fadeUp,
  murdaViewport,
  starPatternSvg,
  useMurdaMotionTiming,
} from '@/components/product/murda-moshari/animation-config';

interface DonationSectionProps {
  onOrderClick: () => void;
}

export function DonationSection({ onOrderClick }: DonationSectionProps) {
  const { donation } = useMurdaPage();
  const reduced = useReducedMotion();
  const { duration, stagger, transition } = useMurdaMotionTiming();
  const Wrapper = reduced ? 'section' : motion.section;
  // NOTE: Splitting Bangla by character breaks conjuncts (যুক্তাক্ষর) and
  // dependent vowels (কার). Always split by space to preserve grapheme clusters.
  const eyebrowWords = donation.eyebrow.split(' ');

  return (
    <Wrapper className="relative overflow-visible bg-emerald py-14 md:py-20">
      {!reduced && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: starPatternSvg,
            backgroundSize: '60px 60px',
          }}
          animate={{ opacity: [0.06, 0.1, 0.06] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      )}
      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <p
          data-cms-field="donation.eyebrow"
          data-cms-label="Donation eyebrow"
          className="font-bn-body text-xs uppercase tracking-wider text-mustard"
        >
          {reduced
            ? donation.eyebrow
            : eyebrowWords.map((word, i) => (
                <motion.span
                  key={`${word}-${i}`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={murdaViewport}
                  transition={transition({ duration: duration(0.5), delay: i * stagger(0.25) })}
                  className="mr-[0.35em] inline-block last:mr-0"
                >
                  {word}
                </motion.span>
              ))}
        </p>
        {reduced ? (
          <h2
            data-cms-field="donation.heading"
            data-cms-label="Donation heading"
            className="font-bn-heading mt-4 text-2xl text-cream md:text-4xl"
          >
            {donation.heading}
          </h2>
        ) : (
          <motion.h2
            data-cms-field="donation.heading"
            data-cms-label="Donation heading"
            className="font-bn-heading relative mt-4 text-2xl text-cream md:text-4xl"
            initial={{ opacity: 0.85 }}
            whileInView={{ opacity: 1 }}
            viewport={murdaViewport}
            transition={{ duration: duration(1.2), ease: calmEase }}
          >
            <motion.span
              className="pointer-events-none absolute inset-0 bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, transparent 0%, var(--color-mustard) 45%, transparent 90%)',
                backgroundSize: '200% 100%',
              }}
              initial={{ backgroundPosition: '200% 50%' }}
              whileInView={{ backgroundPosition: '-100% 50%' }}
              viewport={murdaViewport}
              transition={{ duration: duration(1.2), ease: calmEase }}
              aria-hidden
            >
              {donation.heading}
            </motion.span>
            <span className="relative">{donation.heading}</span>
          </motion.h2>
        )}
        <motion.p
          data-cms-field="donation.body"
          data-cms-label="Donation body"
          className="font-bn-body mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cream/90 md:text-lg"
          {...(!reduced && {
            variants: fadeUp,
            initial: 'hidden',
            whileInView: 'visible',
            viewport: murdaViewport,
            transition: transition({ delay: duration(0.4) }),
          })}
        >
          {donation.body}
        </motion.p>
        <div className="mt-8">
          {reduced ? (
            <button
              type="button"
              onClick={onOrderClick}
              data-cms-field="donation.cta"
              data-cms-label="Donation button"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-mustard px-6 font-bn-body text-base font-semibold text-emerald"
            >
              {donation.cta}
            </button>
          ) : (
            <motion.button
              type="button"
              onClick={onOrderClick}
              data-cms-field="donation.cta"
              data-cms-label="Donation button"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-mustard px-6 font-bn-body text-base font-semibold text-emerald"
              whileInView={{
                boxShadow: [
                  '0 0 0 0 rgba(200, 155, 60, 0)',
                  '0 0 24px 4px rgba(200, 155, 60, 0.3)',
                  '0 0 0 0 rgba(200, 155, 60, 0)',
                ],
              }}
              viewport={murdaViewport}
              transition={{ duration: 2, repeat: 2, ease: calmEase }}
              whileHover={{ y: -2 }}
            >
              {donation.cta}
            </motion.button>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
