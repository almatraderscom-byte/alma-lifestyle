'use client';

import { CinematicLink } from '@/components/cinematic/CinematicLink';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  CINEMATIC_CHAPTERS,
  CINEMATIC_GRADIENT_CSS,
  type CinematicGradientToken,
} from '@/lib/cinematic-config';
import { resolveProductImageUrl } from '@/lib/default-images';
import { formatBdtPrice } from '@/lib/format-bn';
import { cn } from '@/lib/utils';
import type { CardProduct } from '@/lib/products-data';
import type { CinematicChapterStageContent, CinematicContent } from '@/lib/cinematic-content-types';

const GRADIENT_HEX: Record<CinematicGradientToken, string> = {
  maroon: '#6b2737',
  terracotta: '#c97d5d',
  mustard: '#c89b3c',
  emerald: '#2d6a4f',
  'emerald-deep': '#1b4332',
  charcoal: '#2c2c2c',
};

function stageGradient(from: CinematicGradientToken, to: CinematicGradientToken) {
  return `linear-gradient(135deg, ${CINEMATIC_GRADIENT_CSS[from]}, ${CINEMATIC_GRADIENT_CSS[to]})`;
}

function chapterImageUrl(product: CardProduct | null | undefined): string | undefined {
  if (!product?.slug) return undefined;
  const raw = product.galleryImages?.[0]?.url;
  const resolved = resolveProductImageUrl(raw, product.slug, product.categorySlug);
  return resolved.trim() ? resolved : undefined;
}

function stageBackground(
  stage: CinematicChapterStageContent,
  index: number,
  product: CardProduct | null | undefined
) {
  const from = stage.gradientFrom as CinematicGradientToken;
  const to = stage.gradientTo as CinematicGradientToken;
  const imageUrl = chapterImageUrl(product);
  if (index === 3 || !imageUrl) {
    return stageGradient(from, to);
  }
  return `linear-gradient(135deg, ${GRADIENT_HEX[from]}88, ${GRADIENT_HEX[to]}88), url(${imageUrl})`;
}

interface PinnedChaptersSectionProps {
  chapterProducts?: (CardProduct | null)[];
  content?: CinematicContent['chapters'];
}

export function PinnedChaptersSection({ chapterProducts = [], content }: PinnedChaptersSectionProps) {
  const chapters = content ?? CINEMATIC_CHAPTERS;
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 3.99]);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const unsub = progress.on('change', (v) => {
      setActiveStage(Math.min(3, Math.max(0, Math.floor(v))));
    });
    return () => unsub();
  }, [progress, reduced]);

  const stages = chapters.stages;
  const instant = !!reduced;

  if (instant) {
    return (
      <section className="bg-cream px-6 py-16">
        <p className="mb-10 text-center font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">
          {chapters.sectionNumber}
        </p>
        <div className="mx-auto max-w-lg space-y-12">
          {stages.map((stage, index) => (
            <article key={stage.eyebrow} className="space-y-3">
              <p className="font-bn-body text-[10px] uppercase tracking-[0.35em] text-mustard">
                {stage.eyebrow}
              </p>
              <h2 className="font-bn-heading text-3xl font-semibold text-charcoal">{stage.heading}</h2>
              <p className="font-bn-body text-base leading-relaxed text-charcoal/80">{stage.body}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-[2400px] bg-cream md:h-[2800px]"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="sticky top-4 z-30 pt-4 text-center font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard md:hidden">
        {chapters.sectionNumber} · 0{activeStage + 1}/04
      </p>

      <div className="sticky top-0 flex h-screen flex-col overflow-hidden md:flex-row">
        <div className="relative h-[50vh] w-full shrink-0 md:h-full md:w-1/2">
          {stages.map((stage, index) => (
            <div
              key={stage.eyebrow}
              className={cn(
                'cinematic-stage-shimmer absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-[800ms] ease-out',
                activeStage === index ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-[1.05]'
              )}
              style={{
                backgroundImage: stageBackground(stage, index, chapterProducts[index]),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              aria-hidden={activeStage !== index}
            >
              {chapterImageUrl(chapterProducts[index]) && index !== 3 && (
                <Image
                  src={chapterImageUrl(chapterProducts[index])!}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index < 2}
                  loading={index < 2 ? 'eager' : 'lazy'}
                  aria-hidden
                />
              )}
              <div className="relative z-[1] space-y-3 text-center text-cream">
                <p className="font-bn-heading text-base md:text-lg">{stage.imageLabel}</p>
                {chapterProducts[index] && index !== 3 && (
                  <div className="space-y-1">
                    <p className="font-bn-body text-sm opacity-85">{chapterProducts[index]!.title}</p>
                    <p className="font-bn-heading text-xl">{formatBdtPrice(chapterProducts[index]!.price)}</p>
                  </div>
                )}
              </div>
              {activeStage === index && chapterProducts[index] && index !== 3 && (
                <CinematicLink
                  href={`/products/${chapterProducts[index]!.slug}`}
                  data-cursor="ring"
                  className="absolute inset-0 z-10"
                  aria-label={`View ${chapterProducts[index]!.title}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="relative flex h-[50vh] w-full flex-col justify-center px-6 md:h-full md:w-1/2 md:px-12 lg:px-16">
          <p className="absolute top-6 right-6 hidden font-bn-body text-[10px] uppercase tracking-[0.35em] text-text-light md:block">
            {chapters.sectionNumber} · 0{activeStage + 1}/04
          </p>

          {stages.map((stage, index) => (
            <div
              key={stage.eyebrow}
              className={cn(
                'absolute inset-x-6 transition-[opacity,transform] duration-700 ease-out md:inset-x-12 lg:inset-x-16',
                activeStage === index
                  ? 'translate-y-0 opacity-100'
                  : 'pointer-events-none translate-y-10 opacity-0'
              )}
            >
              <p className="font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">
                {stage.eyebrow}
              </p>
              <h2 className="cinematic-chapter-heading mt-4 font-bn-heading text-3xl font-semibold leading-snug text-charcoal md:text-[26px]">
                {stage.heading}
              </h2>
              <p className="cinematic-chapter-body mt-4 max-w-md font-bn-body text-base leading-relaxed text-text-light md:text-sm">
                {stage.body}
              </p>
              {'cta' in stage && stage.cta && (
                <CinematicLink
                  href={stage.cta.href}
                  data-cursor="ring"
                  className="mt-8 inline-flex min-h-12 items-center rounded-sm border-2 border-mustard px-8 font-bn-body text-sm font-semibold text-charcoal transition-colors hover:bg-mustard hover:text-charcoal focus-visible:outline-2 focus-visible:outline-mustard"
                >
                  {stage.cta.label}
                </CinematicLink>
              )}
            </div>
          ))}

          <div className="absolute bottom-8 left-6 flex gap-2 md:bottom-12 md:left-12 lg:left-16">
            {stages.map((_, index) => (
              <span
                key={index}
                className={cn(
                  'h-0.5 rounded-full bg-charcoal/20 transition-all duration-500',
                  activeStage === index ? 'w-9 bg-mustard' : 'w-6'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
