'use client';

import Link from 'next/link';
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn';
import { ProductCard } from '@/components/product/ProductCard';
import { FEATURED_SECTION, HOME_FEATURED_PRODUCTS } from '@/lib/content';
import { formatBnText } from '@/lib/format-bn';
import { cn } from '@/lib/utils';

export function FeaturedProductsSection() {
  return (
    <section className="section-padding bg-background">
      <div className="mx-auto max-w-7xl">
        <ScrollFadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 md:mb-12">
            <div>
              <p className="editorial-label text-terracotta mb-3">
                {formatBnText(FEATURED_SECTION.label)}
              </p>
              <h2 className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-charcoal">
                {FEATURED_SECTION.title}
              </h2>
            </div>
            <Link
              href={FEATURED_SECTION.viewAllHref}
              className="link-underline font-bn-body text-base font-semibold text-charcoal shrink-0"
            >
              {FEATURED_SECTION.viewAll}
            </Link>
          </div>
        </ScrollFadeIn>

        <div className="flex md:grid md:grid-cols-4 md:items-end gap-4 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {HOME_FEATURED_PRODUCTS.map((product, i) => (
            <ScrollFadeIn
              key={product.id}
              delay={i * 0.05}
              className={cn(
                'snap-center shrink-0 w-[72vw] sm:w-[45vw] md:w-auto md:shrink',
                product.layout === 'tall' && 'border-t-4 border-terracotta'
              )}
            >
              <ProductCard product={product} layout={product.layout ?? 'normal'} editorial />
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
