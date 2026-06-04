'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { BrandStorySectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { migrateBrandStorySection } from '@/lib/homepage-migrations';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { isUsableImageUrl } from '@/lib/homepage-image';
import { cn } from '@/lib/utils';

interface CinematicBrandNarrativeProps {
  data?: BrandStorySectionData;
}

function buildPhases(data: BrandStorySectionData) {
  const images = data.images ?? [];
  return [
    {
      eyebrow: data.label || 'EST · 1971',
      heading: data.title,
      body: data.body,
      image: images[0],
    },
    {
      eyebrow: 'JOURNEY · BANGLADESH',
      heading: 'প্রতিটি পরিবারে',
      body: data.body,
      image: images[1] ?? images[0],
    },
    {
      eyebrow: 'TODAY · 2026',
      heading: 'ভবিষ্যতের ঐতিহ্য',
      body: data.cta ? `${data.body}` : data.body,
      image: images[2] ?? images[0],
    },
  ];
}

export function CinematicBrandNarrative({ data: dataProp }: CinematicBrandNarrativeProps) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  const raw =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'brandStory')!.data;
  const data = migrateBrandStorySection(raw);
  const phases = buildPhases(data);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 2.99]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (isMobile || reduced) return;
    const unsub = progress.on('change', (v) => {
      setActiveStage(Math.min(2, Math.max(0, Math.floor(v))));
    });
    return () => unsub();
  }, [progress, isMobile, reduced]);

  const instant = !!reduced;

  if (!instant && isMobile) {
    return (
      <section className="bg-[#f0ebe3] px-6 py-16 md:hidden">
        <div className="space-y-12">
          {phases.map((phase, i) => (
            <article key={i} className="space-y-4">
              {phase.image && isUsableImageUrl(phase.image.url) && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                  <HomepageSectionImage src={phase.image.url} alt={phase.image.alt || phase.heading} sizes="100vw" />
                </div>
              )}
              <p className="font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">{phase.eyebrow}</p>
              <h2 className="font-bn-heading text-xl font-semibold text-charcoal">{phase.heading}</h2>
              <p className="font-bn-body text-sm leading-relaxed text-charcoal/80">{phase.body}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (instant) {
    return (
      <section className="bg-[#f0ebe3] px-6 py-16 md:px-12">
        <div className="mx-auto max-w-4xl space-y-16">
          {phases.map((phase, i) => (
            <article key={i} className="space-y-6">
              {phase.image && isUsableImageUrl(phase.image.url) && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                  <HomepageSectionImage src={phase.image.url} alt={phase.image.alt || phase.heading} sizes="100vw" />
                </div>
              )}
              <p className="font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">{phase.eyebrow}</p>
              <h2 className="font-bn-heading text-2xl font-semibold text-charcoal">{phase.heading}</h2>
              <p className="font-bn-body text-base leading-relaxed text-charcoal/80">{phase.body}</p>
            </article>
          ))}
          {data.cta && (
            <Link href={data.ctaHref} className="inline-flex font-bn-body text-sm text-mustard underline">
              {data.cta} →
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative hidden h-[1800px] bg-[#f0ebe3] md:block">
      <div className="sticky top-0 flex h-screen overflow-hidden">
        <div className="relative w-[60%] overflow-hidden">
          {phases.map((phase, i) => (
            <div
              key={i}
              className={cn(
                'absolute inset-0 transition-opacity duration-[800ms]',
                activeStage === i ? 'opacity-100' : 'opacity-0'
              )}
            >
              {phase.image && isUsableImageUrl(phase.image.url) ? (
                <motion.div
                  className="h-full w-full"
                  animate={{ scale: [1, 1.08] }}
                  transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                >
                  <HomepageSectionImage src={phase.image.url} alt={phase.image.alt || phase.heading} sizes="60vw" />
                </motion.div>
              ) : (
                <div className="h-full w-full bg-maroon/20" />
              )}
            </div>
          ))}
        </div>

        <div
          className="relative flex w-[40%] flex-col justify-center px-12 lg:px-16"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(44,44,44,0.04) 20px, rgba(44,44,44,0.04) 21px)',
          }}
        >
          <p className="absolute top-10 right-12 font-bn-body text-[10px] uppercase tracking-[0.35em] text-text-light">
            PHASE 0{activeStage + 1} / 03
          </p>

          {phases.map((phase, i) => (
            <div
              key={i}
              className={cn(
                'absolute inset-x-12 lg:inset-x-16 transition-all duration-700',
                activeStage === i ? 'translate-y-0 opacity-100 blur-0' : 'pointer-events-none translate-y-8 opacity-0 blur-sm'
              )}
            >
              <p className="font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">{phase.eyebrow}</p>
              <h2 className="mt-4 font-bn-heading text-[26px] font-semibold leading-snug text-charcoal">{phase.heading}</h2>
              <p className="mt-4 max-w-md font-bn-body text-sm leading-relaxed text-charcoal/75">{phase.body}</p>
              {i === 2 && data.cta && (
                <Link
                  href={data.ctaHref}
                  data-cursor="ring"
                  className="mt-8 inline-flex min-h-11 items-center font-bn-body text-sm text-mustard underline decoration-2 underline-offset-4"
                >
                  {data.cta} →
                </Link>
              )}
            </div>
          ))}

          <div className="absolute bottom-12 left-12 flex gap-2 lg:left-16">
            {phases.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-0.5 rounded-full bg-charcoal/20 transition-all duration-500',
                  activeStage === i ? 'w-8 bg-mustard' : 'w-5'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
