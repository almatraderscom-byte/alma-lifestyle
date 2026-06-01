'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ProductCard } from '@/components/product/ProductCard';
import type { FeaturedProduct } from '@/lib/content';
import { formatBnText } from '@/lib/format-bn';
import { cn } from '@/lib/utils';
import type { FeaturedSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';
import { EASE_PREMIUM, cardRevealViewport } from '@/lib/animation-variants';

interface FeaturedProductsSectionProps {
  data?: FeaturedSectionData;
  products?: FeaturedProduct[];
}

export function FeaturedProductsSection({
  data: dataProp,
  products: productsProp,
}: FeaturedProductsSectionProps) {
  const reduceMotion = useReducedMotion();
  const { ref, isInView } = useScrollAnimation();
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'featured')!.data;
  const products = productsProp ?? [];

  return (
    <section ref={ref} className="section-padding bg-background">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: EASE_PREMIUM }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 md:mb-12">
            <div>
              <p className="editorial-label text-terracotta mb-3">
                {formatBnText(data.label)}
              </p>
              <motion.h2
                className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-charcoal"
                initial={reduceMotion ? false : { opacity: 0, y: 30 }}
                animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.6, delay: 0.15, ease: EASE_PREMIUM }}
              >
                {data.title}
              </motion.h2>
            </div>
            <Link
              href={data.viewAllHref}
              className="link-underline font-bn-body text-base font-semibold text-charcoal shrink-0"
            >
              {data.viewAllText}
            </Link>
          </div>
        </motion.div>

        <div className="flex md:grid md:grid-cols-4 md:items-end gap-4 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              className={cn(
                'snap-center shrink-0 w-[72vw] sm:w-[45vw] md:w-auto md:shrink',
                product.layout === 'tall' && 'border-t-4 border-terracotta'
              )}
              initial={reduceMotion ? false : { opacity: 0, y: 40 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={cardRevealViewport}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_PREMIUM }}
            >
              <ProductCard
                product={product}
                layout={product.layout ?? 'normal'}
                editorial
                index={i}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
