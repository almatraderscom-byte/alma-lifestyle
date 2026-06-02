'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { formatBnText } from '@/lib/format-bn';
import { getTextFontClass, splitTextForAnimation } from '@/lib/text-utils';
import { cn } from '@/lib/utils';
import type { CollectionBannerSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { getDefaultImageForHint } from '@/lib/default-images';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';
import { EASE_PREMIUM } from '@/lib/animation-variants';

interface CollectionBannerEditorialProps {
  data?: CollectionBannerSectionData;
}

function CharacterTitle({ text, active }: { text: string; active: boolean }) {
  const reduceMotion = useReducedMotion();
  const fontClass = getTextFontClass(text, 'display');
  const units = splitTextForAnimation(text);
  const headingClass = cn(
    fontClass,
    'text-[2rem] sm:text-5xl md:text-6xl font-bold text-cream leading-[1.3]'
  );

  if (reduceMotion || units.length <= 1) {
    return <h2 className={headingClass}>{text}</h2>;
  }

  return (
    <h2 className={headingClass}>
      {units.map((unit, i) => (
        <motion.span
          key={`${i}-${unit}`}
          className="inline-block"
          style={unit === ' ' ? { width: '0.35em' } : undefined}
          initial={{ opacity: 0, y: 20 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: i * 0.03, ease: EASE_PREMIUM }}
        >
          {unit === ' ' ? '\u00A0' : unit}
        </motion.span>
      ))}
    </h2>
  );
}

export function CollectionBannerEditorial({ data: dataProp }: CollectionBannerEditorialProps) {
  const reduceMotion = useReducedMotion();
  const { ref, isInView } = useScrollAnimation();
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'collectionBanner')!.data;

  const bannerFallback = getDefaultImageForHint(
    data.imageHint || 'Eid collection banner'
  );
  const charCount = splitTextForAnimation(data.title).length;
  const subtitleDelay = charCount * 0.03 + 0.2;
  const ctaDelay = subtitleDelay + 0.25;

  return (
    <section
      ref={ref}
      className="relative min-h-[70vh] flex items-center justify-center pattern-overlay"
    >
      <HomepageSectionImage
        src={data.backgroundImageUrl}
        fallbackSrc={bannerFallback}
        alt={data.title}
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-charcoal/50" aria-hidden />
      <div className="relative z-10 text-center px-6 md:px-12 max-w-3xl">
        <motion.p
          className="editorial-label text-mustard mb-6 mx-auto w-fit"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, ease: EASE_PREMIUM }}
        >
          {data.label}
        </motion.p>

        <CharacterTitle text={data.title} active={isInView || Boolean(reduceMotion)} />

        <motion.p
          className="font-bn-body text-lg md:text-xl text-cream/85 mt-5"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={isInView || reduceMotion ? { opacity: 1 } : undefined}
          transition={{ duration: 0.6, delay: subtitleDelay, ease: EASE_PREMIUM }}
        >
          {data.subtitle}
        </motion.p>

        <motion.div
          className="mt-10"
          initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={isInView || reduceMotion ? { scale: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.5, delay: ctaDelay, ease: EASE_PREMIUM }}
        >
          <Link
            href={data.href}
            className="inline-flex items-center justify-center min-h-14 px-10 bg-cream text-charcoal font-bn-body text-lg font-semibold rounded hover:bg-white transition-colors duration-300"
          >
            {data.cta}
          </Link>
        </motion.div>
        <p className="font-bn-body text-sm text-mustard mt-6">{formatBnText(data.promo)}</p>
        <p className="sr-only">{data.imageHint}</p>
      </div>
    </section>
  );
}
