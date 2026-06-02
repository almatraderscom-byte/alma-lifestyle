'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { isUsableImageUrl } from '@/lib/homepage-image';
import type { OurProcessSectionData, OurProcessStepConfig } from '@/lib/homepage-config-types';
import { getDefaultHomepageExtras } from '@/lib/homepage-extras';
import { scrollViewport, EASE_PREMIUM } from '@/lib/animation-variants';
import { cn } from '@/lib/utils';

interface OurProcessProps {
  data?: OurProcessSectionData;
}

const SLIDE_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

function ProcessStepRow({
  step,
  idx,
  reduceMotion,
}: {
  step: OurProcessStepConfig;
  idx: number;
  reduceMotion: boolean | null;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px', amount: 0.3 });
  const [isMobile, setIsMobile] = useState(false);
  const isEven = idx % 2 === 0;
  const fromRight = isEven;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const slideX = isMobile ? (fromRight ? 30 : -30) : fromRight ? 100 : -100;
  const active = reduceMotion || isInView;

  return (
    <motion.li
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, x: slideX }}
      animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: slideX }}
      transition={{ duration: 0.8, ease: SLIDE_EASE }}
      className={cn(
        'relative grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-12',
        !isEven && 'md:[&>div:first-child]:order-2'
      )}
    >
      <div
        className={cn('pl-10 md:pl-0', isEven ? 'md:pr-12 md:text-right' : 'md:pl-12')}
      >
        <span className="text-3xl" aria-hidden>
          {step.icon}
        </span>
        <h3 className="font-bn-heading mt-2 text-xl font-bold text-charcoal">{step.title}</h3>
        <p className="font-bn-body mt-3 text-text-light leading-relaxed">{step.description}</p>
      </div>

      <div className={cn('pl-10 md:pl-0', !isEven && 'md:order-1')}>
        {isUsableImageUrl(step.imageUrl) ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <HomepageSectionImage
              src={step.imageUrl}
              alt={step.alt || step.title}
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        ) : (
          <PlaceholderImage
            hint={step.imageHint || `Image: ${step.title}`}
            bgClass={cn(step.bgClass, 'aspect-[4/3] w-full rounded-lg')}
          />
        )}
        {step.caption && (
          <p className="font-bn-body text-sm text-text-light mt-2">{step.caption}</p>
        )}
      </div>

      <span
        className="absolute left-4 top-2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-terracotta font-bn-body text-sm font-bold text-white md:left-1/2"
        aria-hidden
      >
        {idx + 1}
      </span>
    </motion.li>
  );
}

export function OurProcess({ data: dataProp }: OurProcessProps) {
  const reduceMotion = useReducedMotion();
  const data = dataProp ?? getDefaultHomepageExtras().ourProcess;
  const steps = data.steps;

  return (
    <section className="section-padding bg-warm-white">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_PREMIUM }}
          viewport={scrollViewport}
          className="mb-12 text-center md:mb-16"
        >
          <p className="editorial-label mb-3 text-terracotta">{data.label}</p>
          <h2 className="font-bn-heading text-3xl font-bold text-charcoal md:text-4xl">
            {data.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-bn-body text-text-light">{data.subtitle}</p>
        </motion.div>

        <div className="relative md:px-4">
          <div
            className="absolute left-4 top-0 bottom-0 w-px bg-border-subtle md:left-1/2 md:-translate-x-px"
            aria-hidden
          />

          <ol className="space-y-10 md:space-y-14">
            {steps.map((step, idx) => (
              <ProcessStepRow
                key={`${step.title}-${idx}`}
                step={step}
                idx={idx}
                reduceMotion={reduceMotion}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
