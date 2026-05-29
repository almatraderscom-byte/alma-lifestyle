'use client';

import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { isUsableImageUrl } from '@/lib/homepage-image';
import type { BrandStorySectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';
import { EASE_PREMIUM, scrollViewport } from '@/lib/animation-variants';

interface BrandStoryProps {
  data?: BrandStorySectionData;
}

export function BrandStory({ data: dataProp }: BrandStoryProps) {
  const reduceMotion = useReducedMotion();
  const { ref: sectionRef } = useScrollAnimation();
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const [parallaxEnabled, setParallaxEnabled] = useState(false);

  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'brandStory')!.data;

  const { scrollYProgress } = useScroll({
    target: imageWrapRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setParallaxEnabled(mq.matches && !motionMq.matches);
    update();
    mq.addEventListener('change', update);
    motionMq.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      motionMq.removeEventListener('change', update);
    };
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-warm-white">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <motion.div
          ref={imageWrapRef}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          viewport={scrollViewport}
          transition={{ duration: 0.7, ease: EASE_PREMIUM }}
        >
          <motion.div
            style={parallaxEnabled && !reduceMotion ? { y: imageY } : undefined}
            className="will-change-transform"
          >
            {isUsableImageUrl(data.imageUrl) ? (
              <div className="relative w-full aspect-[4/5] rounded overflow-hidden">
                <HomepageSectionImage
                  src={data.imageUrl}
                  alt={data.title}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : (
              <PlaceholderImage
                hint={data.imageHint}
                bgClass="bg-mustard w-full aspect-[4/5] rounded"
              />
            )}
          </motion.div>
          <p className="font-bn-body text-sm text-text-light mt-3">{data.imageCaption}</p>
        </motion.div>

        <motion.div
          className="md:py-8"
          initial={reduceMotion ? false : { opacity: 0, x: 40 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={scrollViewport}
          transition={{ duration: 0.7, delay: 0.12, ease: EASE_PREMIUM }}
        >
          <p className="editorial-label text-terracotta mb-4">{data.label}</p>
          <h2 className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-charcoal leading-[1.35]">
            {data.title}
          </h2>
          <p className="font-bn-body text-base md:text-lg text-text-light mt-6 leading-relaxed">
            {data.body}
          </p>
          <Link
            href={data.ctaHref}
            className="link-underline inline-block mt-8 font-bn-body text-base font-semibold text-charcoal"
          >
            {data.cta}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
