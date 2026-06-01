'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReviewsSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';
import {
  EASE_PREMIUM,
  scrollViewport,
  staggerContainerVariants,
  staggerItemVariants,
} from '@/lib/animation-variants';

interface ReviewsSectionProps {
  data?: ReviewsSectionData;
}

export function ReviewsSection({ data: dataProp }: ReviewsSectionProps) {
  const reduceMotion = useReducedMotion();
  const { ref, isInView } = useScrollAnimation();
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'reviews')!.data;

  return (
    <section ref={ref} className="section-padding bg-cream/50">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-charcoal mb-10 md:mb-12"
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: EASE_PREMIUM }}
        >
          {data.title}
        </motion.h2>

        <motion.div
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0"
          variants={reduceMotion ? undefined : staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
        >
          {data.items.map((review) => (
            <motion.div
              key={review.id}
              variants={reduceMotion ? undefined : staggerItemVariants}
              className="snap-center shrink-0 w-[85vw] sm:w-[70vw] md:w-auto"
            >
              <article className="h-full bg-white rounded-lg p-6 md:p-8 flex flex-col shadow-sm border border-border-subtle/60">
                <p className="text-mustard text-lg tracking-wide" aria-label="rating">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </p>
                {review.title && (
                  <h3 className="font-bn-heading text-lg font-semibold text-charcoal mt-3">
                    {review.title}
                  </h3>
                )}
                <p className="font-bn-body text-base text-charcoal mt-3 leading-relaxed flex-1">
                  &ldquo;{review.text}&rdquo;
                </p>
                {review.productName && (
                  <p className="font-bn-body text-sm text-terracotta mt-3">{review.productName}</p>
                )}
                <div className="mt-6 pt-4 border-t border-border-subtle">
                  <p className="font-bn-heading text-base font-semibold text-charcoal">
                    {review.name} · {review.city}
                  </p>
                  {review.date && (
                    <p className="font-bn-body text-xs text-text-light mt-1">{review.date}</p>
                  )}
                  <span className="inline-block mt-2 font-bn-body text-xs text-emerald font-medium">
                    ✓ {data.verifiedLabel}
                  </span>
                </div>
              </article>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
