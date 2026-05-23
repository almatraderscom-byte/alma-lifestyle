'use client';

import Link from 'next/link';
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { BRAND_STORY } from '@/lib/content';

export function BrandStory() {
  return (
    <section className="py-16 md:py-28 px-6 md:px-12 bg-warm-white">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <ScrollFadeIn>
          <div>
            <PlaceholderImage
              hint={BRAND_STORY.imageHint}
              bgClass="bg-mustard w-full aspect-[4/5] rounded"
            />
            <p className="font-bn-body text-sm text-text-light mt-3">{BRAND_STORY.imageCaption}</p>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.1}>
          <div className="md:py-8">
            <p className="editorial-label text-terracotta mb-4">{BRAND_STORY.label}</p>
            <h2 className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-charcoal leading-[1.35]">
              {BRAND_STORY.title}
            </h2>
            <p className="font-bn-body text-base md:text-lg text-text-light mt-6 leading-relaxed">
              {BRAND_STORY.body}
            </p>
            <Link
              href={BRAND_STORY.ctaHref}
              className="link-underline inline-block mt-8 font-bn-body text-base font-semibold text-charcoal"
            >
              {BRAND_STORY.cta}
            </Link>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
