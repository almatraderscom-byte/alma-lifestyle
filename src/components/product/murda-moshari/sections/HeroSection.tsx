'use client';

import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { HeroProductImage } from '@/components/product/murda-moshari/HeroProductImage';
import { MURDA_MOSHARI_PAGE } from '@/lib/content';
import { murdaWhatsAppHref } from '@/components/product/murda-moshari/murda-whatsapp';
import {
  calmEase,
  fadeUp,
  murdaViewport,
  patternDiamondStyle,
  staggerContainer,
  useMurdaMotionTiming,
} from '@/components/product/murda-moshari/animation-config';
import { cn } from '@/lib/utils';

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
      className="shrink-0 text-emerald"
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
  const sectionRef = useRef<HTMLElement>(null);
  const [spot, setSpot] = useState({ x: 0, y: 0, visible: false });

  const MotionTag = reduced ? 'section' : motion.section;
  const MotionP = reduced ? 'p' : motion.p;
  const MotionH1 = reduced ? 'h1' : motion.h1;
  const MotionButton = reduced ? 'button' : motion.button;
  const MotionA = reduced ? 'a' : motion.a;

  const waHref = murdaWhatsAppHref(hero.whatsappNumber, hero.whatsappPrefill);

  return (
    <MotionTag
      ref={sectionRef}
      className="relative overflow-visible bg-cream py-16 md:py-24"
      onMouseMove={
        reduced
          ? undefined
          : (e) => {
              const rect = sectionRef.current?.getBoundingClientRect();
              if (!rect) return;
              setSpot({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                visible: true,
              });
            }
      }
      onMouseLeave={reduced ? undefined : () => setSpot((s) => ({ ...s, visible: false }))}
    >
      {!reduced && spot.visible && (
        <motion.div
          className="pointer-events-none absolute z-0 hidden h-[300px] w-[300px] rounded-full bg-mustard/10 blur-3xl lg:block"
          style={{ left: spot.x - 150, top: spot.y - 150 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden
        />
      )}

      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {!reduced && (
          <motion.div
            className="absolute -inset-[50%] opacity-[0.04]"
            style={patternDiamondStyle}
            animate={{ rotate: 360 }}
            transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:gap-12">
        <div className="order-2 md:order-1">
          <MotionP
            className="font-bn-body text-xs uppercase tracking-wider text-mustard"
            {...(!reduced && {
              initial: { opacity: 0, x: -20 },
              animate: { opacity: 1, x: 0 },
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
              animate: 'visible',
            })}
          >
            {words.map((word, i) =>
              reduced ? (
                <span key={`${word}-${i}`} className="mr-[0.25em] inline-block">
                  {word}
                </span>
              ) : (
                <motion.span
                  key={`${word}-${i}`}
                  variants={fadeUp}
                  className="mr-[0.25em] inline-block"
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
              animate: { opacity: 1, y: 0 },
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
                animate: { opacity: 1, scale: 1 },
                transition: transition({ duration: duration(0.5), delay: duration(0.75) }),
                whileHover: { y: -2, boxShadow: '0 8px 24px rgba(42, 38, 34, 0.12)' },
              })}
            >
              {hero.primaryCta}
            </MotionButton>
            <MotionA
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl',
                'border border-[#25D366]/50 bg-transparent px-6 font-bn-body text-base font-semibold text-[#25D366]',
                'transition-colors hover:border-[#25D366] hover:bg-[#25D366] hover:text-cream'
              )}
              {...(!reduced && {
                initial: { opacity: 0, scale: 0.95 },
                animate: { opacity: 1, scale: 1 },
                transition: transition({ duration: duration(0.5), delay: duration(0.85) }),
                whileHover: { y: -2, boxShadow: '0 8px 24px rgba(37, 211, 102, 0.2)' },
              })}
            >
              <WhatsAppIcon className="h-5 w-5 shrink-0" />
              {hero.whatsappCta}
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
