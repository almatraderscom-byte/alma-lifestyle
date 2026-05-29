'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { formatBnText } from '@/lib/format-bn';
import type { TrustSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';
import {
  EASE_PREMIUM,
  scrollViewport,
  staggerContainerVariants,
  staggerItemVariants,
} from '@/lib/animation-variants';

interface TrustStripProps {
  data?: TrustSectionData;
}

export function TrustStrip({ data: dataProp }: TrustStripProps) {
  const reduceMotion = useReducedMotion();
  const { ref } = useScrollAnimation();
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'trust')!.data;

  return (
    <section ref={ref} className="section-padding bg-cream border-t border-border-subtle">
      <motion.div
        className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10"
        variants={reduceMotion ? undefined : staggerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
      >
        {data.items.map((item) => (
          <motion.div
            key={item.id}
            variants={reduceMotion ? undefined : staggerItemVariants}
            className="text-center md:text-left"
          >
            <span className="text-3xl md:text-4xl" aria-hidden>
              {item.icon}
            </span>
            <h3 className="font-bn-heading text-lg md:text-xl font-bold text-charcoal mt-3">
              {item.title}
            </h3>
            <p className="font-bn-body text-sm text-text-light mt-1">{formatBnText(item.text)}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
