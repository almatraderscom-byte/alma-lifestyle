'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { CollectionBannerSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { getDefaultImageForHint } from '@/lib/default-images';
import { getTextFontClass, splitTextForAnimation } from '@/lib/text-utils';
import { cn } from '@/lib/utils';

interface CinematicCollectionDividerProps {
  data?: CollectionBannerSectionData;
}

export function CinematicCollectionDivider({ data: dataProp }: CinematicCollectionDividerProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'collectionBanner')!.data;

  const imageUrl = data.backgroundImageUrl || getDefaultImageForHint(data.imageHint);
  const fontClass = getTextFontClass(data.title, 'display');
  const units = splitTextForAnimation(data.title);
  const instant = !!reduced;

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reduced || isMobile) return;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 32;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 32;
      setParallax({ x, y });
    },
    [reduced, isMobile]
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <section
      ref={ref}
      className="relative h-[480px] w-full overflow-hidden"
      onMouseMove={onMouseMove}
      aria-label={data.title}
    >
      <div
        className="absolute inset-0 scale-110"
        style={{
          transform: instant || isMobile ? undefined : `translate(${parallax.x}px, ${parallax.y}px) scale(1.1)`,
        }}
      >
        <HomepageSectionImage src={imageUrl} alt={data.title} sizes="100vw" priority />
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="font-bn-body text-[10px] uppercase tracking-[0.45em] text-mustard">{data.label || 'COLLECTION'}</p>
        <h2 className={cn(fontClass, 'mt-4 max-w-5xl text-4xl font-medium text-cream md:text-7xl lg:text-8xl')}>
          {instant || units.length <= 1
            ? data.title
            : units.map((unit, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : undefined}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                >
                  {unit}
                  {i < units.length - 1 ? '\u00A0' : ''}
                </motion.span>
              ))}
        </h2>
        {data.subtitle && (
          <p className="mt-4 max-w-xl font-bn-body text-base text-cream/85 md:text-lg">{data.subtitle}</p>
        )}
        <Link
          href={data.href}
          data-cursor="ring"
          className="mt-8 inline-flex min-h-12 items-center rounded-sm border border-mustard px-8 font-bn-body text-sm text-cream transition-colors hover:bg-mustard hover:text-charcoal focus-visible:outline-2 focus-visible:outline-mustard"
        >
          {data.cta}
        </Link>
      </div>
    </section>
  );
}
