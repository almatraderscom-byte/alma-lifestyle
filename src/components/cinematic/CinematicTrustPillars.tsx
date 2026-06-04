'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { TrustSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { formatBnText } from '@/lib/format-bn';
import { cn } from '@/lib/utils';

interface CinematicTrustPillarsProps {
  data?: TrustSectionData;
}

const DRAW_TRANSITION = { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const };

function TruckIcon() {
  return (
    <svg viewBox="0 0 80 80" className="mx-auto h-20 w-20 text-mustard" aria-hidden>
      <motion.path
        d="M12 52 H48 V28 H12 Z M48 38 H62 L72 48 V52 H48 M18 56 A5 5 0 1 0 18 56 M58 56 A5 5 0 1 0 58 56"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={DRAW_TRANSITION}
      />
      <motion.path
        d="M8 52 H12 M72 52 H76"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ ...DRAW_TRANSITION, delay: 0.3 }}
      />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg viewBox="0 0 80 80" className="mx-auto h-20 w-20 text-mustard" aria-hidden>
      <motion.rect
        x="14"
        y="24"
        width="52"
        height="32"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={DRAW_TRANSITION}
      />
      <motion.circle
        cx="40"
        cy="40"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ ...DRAW_TRANSITION, delay: 0.25 }}
      />
      <motion.path
        d="M22 32 H30 M50 48 H58"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ ...DRAW_TRANSITION, delay: 0.4 }}
      />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg viewBox="0 0 80 80" className="mx-auto h-20 w-20 text-mustard" aria-hidden>
      <motion.path
        d="M52 24 H28 C20 24 14 30 14 38 V44 M14 44 L8 38 M14 44 L20 38"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={DRAW_TRANSITION}
      />
      <motion.path
        d="M28 56 H52 C60 56 66 50 66 42 V36 M66 36 L72 42 M66 36 L60 42"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ ...DRAW_TRANSITION, delay: 0.35 }}
      />
    </svg>
  );
}

const ICONS = [TruckIcon, CashIcon, ReturnIcon] as const;

export function CinematicTrustPillars({ data: dataProp }: CinematicTrustPillarsProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'trust')!.data;

  const items = data.items.slice(0, 3);
  const instant = !!reduced;

  return (
    <section
      ref={ref}
      className="relative bg-cream px-6 py-24 lg:px-16"
      style={{
        backgroundImage:
          'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(44,44,44,0.03) 40px, rgba(44,44,44,0.03) 41px)',
      }}
      aria-label="Trust pillars"
    >
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3 md:gap-8">
        {items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.article
              key={item.id}
              className="group relative text-center"
              initial={instant ? false : { opacity: 0, y: 24 }}
              animate={instant || inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: instant ? 0 : i * 0.12, duration: 0.6 }}
            >
              {i > 0 && (
                <span
                  className="absolute -left-4 top-1/2 hidden h-32 w-px -translate-y-1/2 bg-mustard/50 md:block"
                  aria-hidden
                />
              )}
              <div
                className={cn(
                  'relative transition-transform duration-300 md:group-hover:-translate-y-1',
                  'md:group-hover:drop-shadow-[0_12px_24px_rgba(200,155,60,0.25)]'
                )}
              >
                <Icon />
                <h3 className="mt-6 font-bn-heading text-2xl font-semibold text-charcoal">
                  {formatBnText(item.title)}
                </h3>
                <motion.span
                  className="mx-auto mt-3 block h-0.5 w-6 bg-mustard"
                  initial={instant ? { scaleX: 1 } : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: instant ? 0 : 1.2 + i * 0.1, duration: 0.5 }}
                />
                <p className="mx-auto mt-4 max-w-xs font-bn-body text-base leading-relaxed text-charcoal/70">
                  {formatBnText(item.text)}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
