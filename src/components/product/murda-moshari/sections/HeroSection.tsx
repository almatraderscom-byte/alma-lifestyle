'use client';

import Image from 'next/image';
import { Phone } from 'lucide-react';
import {
  motion,
  useReducedMotion,
} from 'framer-motion';
import { MURDA_MOSHARI_PAGE } from '@/lib/content';
import {
  calmEase,
  fadeUp,
  murdaViewport,
  patternDiamondStyle,
  staggerContainer,
  useMurdaMotionTiming,
} from '@/components/product/murda-moshari/animation-config';
const PHONE_TEL = 'tel:+8801307777733';

function CheckMarkDraw({ delay }: { delay: number }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <span className="text-emerald" aria-hidden>
        ✓
      </span>
    );
  }
  return (
    <motion.svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      className="text-emerald shrink-0"
      aria-hidden
    >
      <motion.path
        d="M2 7 L5.5 10.5 L12 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={murdaViewport}
        transition={{ duration: 0.4, delay, ease: calmEase }}
      />
    </motion.svg>
  );
}

function FrameDraw() {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          border: '1px solid color-mix(in srgb, var(--color-mustard) 55%, transparent)',
        }}
        aria-hidden
      />
    );
  }

  const w = 100;
  const h = 100;
  const path = `M 2 2 L ${w - 2} 2 L ${w - 2} ${h - 2} L 2 ${h - 2} Z`;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full rounded-2xl"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        d={path}
        fill="none"
        stroke="var(--color-mustard)"
        strokeWidth="0.6"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={murdaViewport}
        transition={{ duration: 1.6, ease: calmEase }}
      />
    </svg>
  );
}

interface HeroSectionProps {
  onOrderClick: () => void;
}

export function HeroSection({ onOrderClick }: HeroSectionProps) {
  const { hero } = MURDA_MOSHARI_PAGE;
  const reduced = useReducedMotion();
  const { duration, stagger, transition } = useMurdaMotionTiming();
  const words = hero.heading.split(' ');

  const MotionTag = reduced ? 'section' : motion.section;
  const MotionDiv = reduced ? 'div' : motion.div;
  const MotionP = reduced ? 'p' : motion.p;
  const MotionH1 = reduced ? 'h1' : motion.h1;
  const MotionButton = reduced ? 'button' : motion.button;
  const MotionA = reduced ? 'a' : motion.a;

  return (
    <MotionTag className="relative overflow-visible bg-cream py-16 md:py-24">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {!reduced && (
          <MotionDiv
            className="absolute -inset-[50%] opacity-[0.04]"
            style={patternDiamondStyle}
            animate={{ rotate: 360 }}
            transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {reduced && (
          <div className="absolute inset-0 opacity-[0.04]" style={patternDiamondStyle} />
        )}
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:gap-12">
        <div className="order-2 md:order-1">
          <MotionP
            className="font-bn-body text-xs uppercase tracking-wider text-mustard"
            {...(!reduced && {
              initial: { opacity: 0, x: -20 },
              whileInView: { opacity: 1, x: 0 },
              viewport: murdaViewport,
              transition: transition({ duration: duration(0.4) }),
            })}
          >
            {hero.eyebrow}
          </MotionP>

          <MotionH1
            className="font-bn-heading mt-3 text-3xl leading-tight text-charcoal md:text-5xl"
            {...(!reduced && {
              variants: staggerContainer(stagger(0.06)),
              initial: 'hidden',
              whileInView: 'visible',
              viewport: murdaViewport,
            })}
          >
            {words.map((word, i) =>
              reduced ? (
                <span key={`${word}-${i}`} className="inline-block mr-[0.25em]">
                  {word}
                </span>
              ) : (
                <motion.span
                  key={`${word}-${i}`}
                  variants={fadeUp}
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              )
            )}
          </MotionH1>

          <MotionP
            className="font-bn-body mt-5 text-lg leading-relaxed text-charcoal/80"
            {...(!reduced && {
              initial: { opacity: 0, y: 24 },
              whileInView: { opacity: 1, y: 0 },
              viewport: murdaViewport,
              transition: transition({ duration: duration(0.7), delay: duration(0.6) }),
            })}
          >
            {hero.subheading}
          </MotionP>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <MotionButton
              type="button"
              onClick={onOrderClick}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-emerald px-6 font-bn-body text-base font-semibold text-cream"
              {...(!reduced && {
                initial: { opacity: 0, scale: 0.95 },
                whileInView: { opacity: 1, scale: 1 },
                viewport: murdaViewport,
                transition: transition({ duration: duration(0.5), delay: duration(0.75) }),
                whileHover: { y: -2, boxShadow: '0 8px 24px rgba(42, 38, 34, 0.12)' },
              })}
            >
              {hero.primaryCta}
            </MotionButton>
            <MotionA
              href={PHONE_TEL}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-emerald/40 bg-transparent px-6 font-bn-body text-base font-semibold text-emerald"
              {...(!reduced && {
                initial: { opacity: 0, scale: 0.95 },
                whileInView: { opacity: 1, scale: 1 },
                viewport: murdaViewport,
                transition: transition({ duration: duration(0.5), delay: duration(0.85) }),
                whileHover: { y: -2, boxShadow: '0 8px 24px rgba(42, 38, 34, 0.12)' },
              })}
            >
              <Phone className="h-5 w-5 shrink-0" aria-hidden />
              {hero.secondaryCta}
            </MotionA>
          </div>

          <ul className="font-bn-body mt-6 flex flex-col gap-2 text-sm text-charcoal/70 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {hero.trustItems.map((item, i) => (
              <li key={item} className="flex items-center gap-2">
                <CheckMarkDraw delay={duration(0.9 + i * 0.12)} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 md:order-2">
          <div className="relative overflow-visible">
            <div
              className="relative rounded-2xl bg-cream p-3 md:p-4"
              style={{ boxShadow: '0 0 40px rgba(200, 155, 60, 0.08)' }}
            >
              <FrameDraw />
              <HeroProductImage />
            </div>
          </div>
        </div>
      </div>
    </MotionTag>
  );
}
