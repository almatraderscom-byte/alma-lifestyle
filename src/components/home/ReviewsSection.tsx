'use client';

import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn';
import type { ReviewsSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';

interface ReviewsSectionProps {
  data?: ReviewsSectionData;
}

export function ReviewsSection({ data: dataProp }: ReviewsSectionProps) {
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'reviews')!.data;
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <ScrollFadeIn>
          <h2 className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-charcoal mb-10 md:mb-12">
            {data.title}
          </h2>
        </ScrollFadeIn>

        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0">
          {data.items.map((review, i) => (
            <ScrollFadeIn
              key={review.id}
              delay={i * 0.05}
              className="snap-center shrink-0 w-[85vw] sm:w-[70vw] md:w-auto"
            >
              <article className="h-full bg-cream rounded p-6 md:p-8 flex flex-col">
                <p className="text-mustard text-lg tracking-wide" aria-label="rating">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </p>
                <p className="font-bn-body text-base text-charcoal mt-4 leading-relaxed flex-1">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-6 pt-4 border-t border-border-subtle">
                  <p className="font-bn-heading text-base font-semibold text-charcoal">
                    {review.name} · {review.city}
                  </p>
                  <span className="inline-block mt-2 font-bn-body text-xs text-emerald font-medium">
                    ✓ {data.verifiedLabel}
                  </span>
                </div>
              </article>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
