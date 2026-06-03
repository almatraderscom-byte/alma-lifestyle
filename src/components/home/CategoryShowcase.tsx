'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { CATEGORY_SHOWCASE } from '@/lib/content';
import { formatBnText } from '@/lib/format-bn';
import { cn } from '@/lib/utils';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { getDefaultImageForHint } from '@/lib/default-images';
import type { CategoriesSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';
import {
  EASE_PREMIUM,
  scrollViewport,
  staggerContainerVariants,
  staggerItemVariants,
} from '@/lib/animation-variants';

interface CategoryShowcaseProps {
  data?: CategoriesSectionData;
}

export function CategoryShowcase({ data: dataProp }: CategoryShowcaseProps) {
  const reduceMotion = useReducedMotion();
  const { ref, isInView } = useScrollAnimation();
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'categories')!.data;
  const { featured, stacked } = data;

  return (
    <section ref={ref} className="section-padding">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: EASE_PREMIUM }}
        >
          <p className="editorial-label text-terracotta mb-4">{data.label}</p>
        </motion.div>
        <motion.h2
          className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-charcoal mb-10 md:mb-14"
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE_PREMIUM }}
        >
          {data.title}
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 md:min-h-[520px]"
          variants={reduceMotion ? undefined : staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
        >
          <motion.div variants={reduceMotion ? undefined : staggerItemVariants} className="md:col-span-7">
            <CategoryCard
              href={featured.href}
              name={featured.displayName}
              subtitle={featured.subtitle}
              bg={featured.bgClass}
              hint={featured.imageHint}
              imageUrl={featured.imageUrl}
              large
            />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-2 md:col-span-5 gap-3 md:gap-4">
            {stacked.map((cat) => (
              <motion.div
                key={cat.categorySlug}
                variants={reduceMotion ? undefined : staggerItemVariants}
                className={cn(
                  'md:flex-1',
                  cat.categorySlug === 'islamic' && 'col-span-2 md:col-span-2'
                )}
              >
                {cat.categorySlug === 'islamic' ? (
                  <IslamicCategoryCard
                    href={cat.href}
                    name={cat.displayName}
                  />
                ) : (
                  <CategoryCard
                    href={cat.href}
                    name={cat.displayName}
                    bg={cat.bgClass}
                    hint={cat.imageHint}
                    imageUrl={cat.imageUrl}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function IslamicCategoryCard({ href, name }: { href: string; name: string }) {
  const reduceMotion = useReducedMotion();
  const { eyebrow, viewLabel } = CATEGORY_SHOWCASE.islamicCard;

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex min-h-[120px] flex-col justify-between overflow-hidden rounded bg-emerald p-5 md:min-h-[140px] md:p-6',
        'aspect-[2/1] md:aspect-auto md:h-full'
      )}
    >
      {!reduceMotion && (
        <motion.span
          className="pointer-events-none absolute inset-0 bg-cream"
          initial={{ x: '-100%' }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.45, ease: EASE_PREMIUM }}
          aria-hidden
        />
      )}
      <div className="relative z-10">
        <p className="font-bn-body text-xs uppercase tracking-wider text-mustard transition-colors duration-300 group-hover:text-mustard">
          {eyebrow}
        </p>
        <h3 className="font-bn-heading mt-2 text-2xl font-bold text-cream transition-colors duration-300 group-hover:text-emerald md:text-3xl">
          {name}
        </h3>
      </div>
      <span className="relative z-10 flex justify-end">
        <span className="inline-flex items-center gap-1 font-bn-body text-sm text-cream transition-colors duration-300 group-hover:text-emerald">
          {viewLabel}
          <ArrowUpRight
            className="h-4 w-4 text-mustard transition-colors duration-300 group-hover:text-emerald"
            aria-hidden
          />
        </span>
      </span>
    </Link>
  );
}

function CategoryCard({
  href,
  name,
  subtitle,
  hint,
  imageUrl,
  large = false,
}: {
  href: string;
  name: string;
  subtitle?: string;
  bg: string;
  hint: string;
  imageUrl?: string;
  large?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col justify-end overflow-hidden rounded text-white',
        'transition-transform duration-500 ease-out md:hover:scale-[1.02]',
        large ? 'min-h-[280px] md:min-h-full md:h-full aspect-[4/5] md:aspect-auto' : 'min-h-[100px] md:min-h-0 md:h-full aspect-square md:aspect-auto'
      )}
    >
      <span className="sr-only">{hint}</span>
      <HomepageSectionImage
        src={imageUrl}
        fallbackSrc={getDefaultImageForHint(hint)}
        alt={name}
        sizes="(max-width: 768px) 50vw, 33vw"
      />
      <div
        className="absolute inset-0 bg-charcoal/35 transition-transform duration-500 ease-out md:group-hover:scale-110"
        aria-hidden
      />
      <div className="relative z-10 p-4 md:p-6">
        <h3
          className={cn(
            'font-bn-heading font-bold transition-all duration-500 ease-out md:group-hover:tracking-wide md:group-hover:font-extrabold',
            large ? 'text-2xl md:text-4xl' : 'text-sm md:text-2xl'
          )}
        >
          {name}
        </h3>
        {subtitle && (
          <p className="font-bn-body text-sm md:text-base mt-1 opacity-90">
            {formatBnText(subtitle)}
          </p>
        )}
        <span className="inline-block mt-2 font-bn-body text-sm transition-transform duration-500 ease-out md:group-hover:translate-x-2">
          দেখুন →
        </span>
      </div>
    </Link>
  );
}
