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

function ShieldIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 60 60" className="mx-auto h-[60px] w-[60px]" aria-hidden>
      <path
        d="M30 6 L50 14 V28 C50 40 42 50 30 54 C18 50 10 40 10 28 V14 Z"
        fill="none"
        stroke="var(--color-mustard)"
        strokeWidth="1.5"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={draw ? 0 : 1}
        style={{ transition: draw ? 'stroke-dashoffset 1.2s ease-out' : undefined }}
      />
    </svg>
  );
}

function TruckIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 60 60" className="mx-auto h-[60px] w-[60px]" aria-hidden>
      <path
        d="M8 38 H38 V18 H8 Z M38 28 H48 L54 34 V38 H38 M14 42 A4 4 0 1 0 14 42 M46 42 A4 4 0 1 0 46 42"
        fill="none"
        stroke="var(--color-mustard)"
        strokeWidth="1.5"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={draw ? 0 : 1}
        style={{ transition: draw ? 'stroke-dashoffset 1.2s ease-out 0.2s' : undefined }}
      />
    </svg>
  );
}

function HeartIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 60 60" className="mx-auto h-[60px] w-[60px]" aria-hidden>
      <path
        d="M30 48 C18 38 8 30 8 20 C8 14 12 10 18 10 C22 10 26 12 30 16 C34 12 38 10 42 10 C48 10 52 14 52 20 C52 30 42 38 30 48 Z"
        fill="none"
        stroke="var(--color-mustard)"
        strokeWidth="1.5"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={draw ? 0 : 1}
        style={{ transition: draw ? 'stroke-dashoffset 1.2s ease-out 0.4s' : undefined }}
      />
    </svg>
  );
}

const ICONS = [ShieldIcon, TruckIcon, HeartIcon] as const;

export function CinematicTrustPillars({ data: dataProp }: CinematicTrustPillarsProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'trust')!.data;

  const items = data.items.slice(0, 3);
  const instant = !!reduced;
  const draw = instant || inView;

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
              transition={{ delay: instant ? 0 : i * 0.2, duration: 0.6 }}
            >
              {i > 0 && (
                <span
                  className="absolute -left-4 top-1/2 hidden h-32 w-px -translate-y-1/2 bg-mustard/50 md:block"
                  aria-hidden
                />
              )}
              <div className="transition-transform duration-300 md:group-hover:-translate-y-1">
                <Icon draw={draw} />
                <h3 className="mt-6 font-bn-heading text-2xl font-semibold text-charcoal">
                  {formatBnText(item.title)}
                </h3>
                <motion.span
                  className="mx-auto mt-3 block h-0.5 w-6 bg-mustard"
                  initial={instant ? { scaleX: 1 } : { scaleX: 0 }}
                  animate={draw ? { scaleX: 1 } : undefined}
                  transition={{ delay: instant ? 0 : 1 + i * 0.15, duration: 0.5 }}
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
