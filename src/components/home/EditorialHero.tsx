'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { EDITORIAL_HERO } from '@/lib/content';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { isUsableImageUrl } from '@/lib/homepage-image';
import { formatBnText } from '@/lib/format-bn';
import { cn } from '@/lib/utils';
import type { HeroSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { EASE_PREMIUM } from '@/lib/animation-variants';

interface EditorialHeroProps {
  data?: HeroSectionData;
}

/** Stable particle layout (avoids hydration mismatch from Math.random). */
const HERO_PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  left: `${((i * 11.3 + 8) % 92) + 4}%`,
  top: `${((i * 19.7 + 12) % 88) + 6}%`,
  delay: `${((i * 0.53) % 5).toFixed(2)}s`,
  duration: `${(15 + (i % 6) * 2.5).toFixed(1)}s`,
}));

export function EditorialHero({ data: dataProp }: EditorialHeroProps) {
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'hero')!.data;

  const hasBgImage = isUsableImageUrl(data.backgroundImageUrl);

  const { scrollY } = useScroll();
  /** Image column moves at ~0.6× scroll speed (480px over 800px scroll). */
  const yImage = useTransform(scrollY, [0, 800], [0, -480]);
  const scrollOpacity = useTransform(scrollY, [0, 600], [1, 0.7]);
  const enableParallax = !reduceMotion && !isMobile;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const showFxLayers = hasBgImage && !reduceMotion;

  return (
    <section className="min-h-[100dvh] md:min-h-screen flex flex-col md:flex-row">
      <motion.div
        className="relative w-full md:w-[60%] min-h-[60vh] h-[600px] md:min-h-screen md:h-[700px] overflow-hidden"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE_PREMIUM }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            y: enableParallax ? yImage : 0,
            opacity: enableParallax ? scrollOpacity : 1,
          }}
        >
          <div className="hero-image-container">
            <div className="hero-image-kenburns">
              {hasBgImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.backgroundImageUrl}
                  alt={data.title}
                  onLoad={() =>
                    console.log('[Homepage] Hero image loaded:', data.backgroundImageUrl)
                  }
                  onError={() =>
                    console.error('[Homepage] Hero image failed:', data.backgroundImageUrl)
                  }
                />
              ) : (
                <PlaceholderImage
                  hint={data.imageHint || EDITORIAL_HERO.imageHint}
                  bgClass="bg-maroon h-full min-h-full hero-image-kenburns__placeholder"
                  className="absolute inset-0 h-full w-full"
                />
              )}
            </div>

            {showFxLayers && (
              <>
                <div className="hero-particles" aria-hidden>
                  {HERO_PARTICLES.map((p, i) => (
                    <span
                      key={i}
                      className="hero-particle"
                      style={{
                        left: p.left,
                        top: p.top,
                        ['--hero-particle-delay' as string]: p.delay,
                        ['--hero-particle-duration' as string]: p.duration,
                      }}
                    />
                  ))}
                </div>
                <div className="hero-gradient-overlay" aria-hidden />
                <div className="hero-vignette" aria-hidden />
              </>
            )}
          </div>
        </motion.div>

        {hasBgImage && (
          <div className="absolute inset-0 bg-charcoal/25 pointer-events-none z-[5]" aria-hidden />
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
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15, ease: EASE_PREMIUM }}
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
