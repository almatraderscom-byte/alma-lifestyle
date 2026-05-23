'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { EDITORIAL_HERO } from '@/lib/content';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { formatBnText } from '@/lib/format-bn';
import { cn } from '@/lib/utils';

export function EditorialHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="min-h-[100dvh] md:min-h-screen flex flex-col md:flex-row">
      <motion.div
        className="relative w-full md:w-[60%] min-h-[60vh] md:min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <PlaceholderImage
          hint={EDITORIAL_HERO.imageHint}
          bgClass="bg-maroon h-full min-h-[60vh] md:min-h-full"
          className="h-full w-full"
        />

        <div
          className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-cream/70 z-10"
          aria-hidden
        >
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
            transition={
              reduceMotion
                ? undefined
                : { repeat: Infinity, duration: 2, ease: 'easeInOut' }
            }
          >
            <ScrollArrowIcon />
          </motion.div>
          <span className="font-bn-body text-xs text-mustard/90">
            {formatBnText('নিচে দেখুন')}
          </span>
        </div>
      </motion.div>

      <motion.div
        className={cn(
          'relative z-10 w-full md:w-[40%]',
          'bg-cream px-6 py-10 md:px-12 md:py-16 lg:px-14',
          'flex flex-col justify-center',
          'rounded-t-2xl md:rounded-none',
          '-mt-8 md:mt-0 shadow-[0_-12px_40px_rgba(42,38,34,0.12)] md:shadow-none'
        )}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="editorial-label text-terracotta mb-6">
          {formatBnText(EDITORIAL_HERO.caption)}
        </p>

        <h1 className="font-bn-heading text-[2.25rem] md:text-[3.5rem] font-bold text-charcoal leading-[1.35]">
          {EDITORIAL_HERO.title}
        </h1>

        <p className="font-bn-body text-base md:text-lg text-text-light mt-5 max-w-md leading-relaxed">
          {EDITORIAL_HERO.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-8">
          <Link
            href={EDITORIAL_HERO.ctaPrimaryHref}
            className="inline-flex items-center justify-center min-h-14 px-8 bg-terracotta text-white font-bn-body text-base font-semibold rounded hover:bg-[#b06d4f] transition-colors duration-300"
          >
            {EDITORIAL_HERO.ctaPrimary}
          </Link>
          <Link
            href={EDITORIAL_HERO.ctaSecondaryHref}
            className="link-underline font-bn-body text-base font-medium text-charcoal min-h-14 inline-flex items-center"
          >
            {EDITORIAL_HERO.ctaSecondary}
          </Link>
        </div>

        <div className="mt-10 md:mt-14 pt-6 border-t border-border-subtle">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 font-bn-body text-xs sm:text-sm text-text-light">
            {EDITORIAL_HERO.badges.map((badge, i) => (
              <li key={badge} className="flex items-center gap-4">
                {i > 0 && <span className="text-border-subtle hidden sm:inline" aria-hidden>|</span>}
                <span>{formatBnText(badge)}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}

function ScrollArrowIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}
