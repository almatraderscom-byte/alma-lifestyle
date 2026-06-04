'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { STORY_MARQUEE } from '@/lib/content';
import type { MarqueeSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { cn } from '@/lib/utils';

interface CinematicStoryStripProps {
  data?: MarqueeSectionData;
}

const DEFAULT_TOP = ['ঐতিহ্য', 'পরিবার', 'সম্মান', 'ভালোবাসা', 'মুহূর্ত', 'গল্প'];
const DEFAULT_BOTTOM = ['EST · 1971', 'FAMILY MATCHING', 'PREMIUM CRAFT', 'DHAKA'];

function splitPhrases(text: string): string[] {
  return text
    .split(/[·•|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function MarqueeRow({
  items,
  direction,
  duration,
  className,
  paused,
}: {
  items: string[];
  direction: 'forward' | 'reverse';
  duration: number;
  className?: string;
  paused: boolean;
}) {
  const content = items.join(' ◇ ');
  const repeated = `${content} ◇ ${content} ◇ ${content} ◇ `;

  return (
    <div className={cn('relative overflow-hidden py-4', className)}>
      <div
        className={cn(
          'flex w-max whitespace-nowrap',
          !paused && (direction === 'forward' ? 'animate-cinematic-marquee-forward' : 'animate-cinematic-marquee-reverse')
        )}
        style={{ animationDuration: `${duration}s` }}
      >
        <span className="px-8">{repeated}</span>
        <span className="px-8" aria-hidden>
          {repeated}
        </span>
      </div>
    </div>
  );
}

export function CinematicStoryStrip({ data: dataProp }: CinematicStoryStripProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5% 0px' });
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'marquee')!.data;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const topItems = useMemo(() => {
    const fromRow = splitPhrases(STORY_MARQUEE.rowOne);
    return fromRow.length >= 4 ? fromRow : DEFAULT_TOP;
  }, [data.text]);

  const bottomItems = useMemo(() => {
    const fromRow = splitPhrases(STORY_MARQUEE.rowTwo);
    return fromRow.length >= 3 ? fromRow.map((s) => s.toUpperCase()) : DEFAULT_BOTTOM;
  }, [data.text]);

  const instant = !!reduced;

  if (instant) {
    return (
      <section ref={ref} className="cinematic-story-strip bg-cream px-6 py-10" aria-label="ব্র্যান্ড বার্তা">
        <div className="mx-auto grid max-w-4xl gap-4 text-center">
          <p className="font-bn-heading text-2xl text-charcoal/70">{topItems.join(' · ')}</p>
          <p className="font-bn-body text-sm uppercase tracking-[0.35em] text-mustard/60">
            {bottomItems.join(' · ')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="cinematic-story-strip relative overflow-hidden bg-cream"
      aria-label="ব্র্যান্ড বার্তা"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-cream to-transparent md:w-24"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-cream to-transparent md:w-24"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : undefined}
        transition={{ duration: 0.8 }}
      >
        <MarqueeRow
          items={topItems}
          direction="forward"
          duration={isMobile ? 45 : 80}
          paused={paused}
          className="border-b border-charcoal/10 font-bn-heading text-3xl text-charcoal/60 md:text-4xl"
        />
        {!isMobile && (
          <MarqueeRow
            items={bottomItems}
            direction="reverse"
            duration={50}
            paused={paused}
            className="font-bn-body text-base uppercase tracking-[0.4em] text-mustard/40"
          />
        )}
      </motion.div>
    </section>
  );
}
