'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { EDITORIAL_HERO } from '@/lib/content';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { formatBnText } from '@/lib/format-bn';
import { cn } from '@/lib/utils';
import type { HeroSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';

interface EditorialHeroProps {
  data?: HeroSectionData;
}

export function EditorialHero({ data: dataProp }: EditorialHeroProps) {
  const reduceMotion = useReducedMotion();
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'hero')!.data;

  return (
    <section className="min-h-[100dvh] md:min-h-screen flex flex-col md:flex-row">
      <motion.div
        className="relative w-full md:w-[60%] min-h-[60vh] md:min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {data.backgroundImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.backgroundImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <PlaceholderImage
            hint={data.imageHint || EDITORIAL_HERO.imageHint}
            bgClass="bg-maroon h-full min-h-[60vh] md:min-h-full"
            className="h-full w-full"
          />
        )}

        <motion.div
          className="absolute bottom-16 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 drop-shadow-md"
          animate={
            reduceMotion ? undefined : { y: [0, 12, 0], opacity: [0.8, 1, 0.8] }
          }
          transition={
            reduceMotion
              ? undefined
              : { repeat: Infinity, duration: 2, ease: 'easeInOut' }
          }
          aria-hidden
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream/15 backdrop-blur-sm border border-cream/30">
            <ScrollArrowIcon />
          </div>
          <span className="font-bn-body text-xs tracking-wider uppercase text-cream">
            {formatBnText('নিচে দেখুন')}
          </span>
        </motion.div>
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
          {formatBnText(data.caption)}
        </p>

        <h1 className="font-bn-heading text-[2.25rem] md:text-[3.5rem] font-bold text-charcoal leading-[1.35]">
          {data.title}
        </h1>

        <p className="font-bn-body text-base md:text-lg text-text-light mt-5 max-w-md leading-relaxed">
          {data.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-8">
          <Link
            href={data.ctaPrimaryHref}
            className="inline-flex items-center justify-center min-h-14 px-8 bg-terracotta text-white font-bn-body text-base font-semibold rounded hover:bg-[#b06d4f] transition-colors duration-300"
          >
            {data.ctaPrimary}
          </Link>
          <Link
            href={data.ctaSecondaryHref}
            className="link-underline font-bn-body text-base font-medium text-charcoal min-h-14 inline-flex items-center"
          >
            {data.ctaSecondary}
          </Link>
        </div>

        <div className="mt-10 md:mt-14 pt-6 border-t border-border-subtle">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 font-bn-body text-xs sm:text-sm text-text-light">
            {data.badges.map((badge, i) => (
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
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-cream"
      aria-hidden
    >
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}
