'use client';

import Link from 'next/link';
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn';
import { COLLECTION_BANNER } from '@/lib/content';

export function CollectionBannerEditorial() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center pattern-overlay bg-maroon">
      <div className="absolute inset-0 bg-maroon/95" aria-hidden />
      <ScrollFadeIn className="relative z-10 text-center px-6 md:px-12 max-w-3xl">
        <p className="editorial-label text-mustard mb-6 mx-auto w-fit">{COLLECTION_BANNER.label}</p>
        <h2 className="font-bn-heading text-[2rem] sm:text-5xl md:text-6xl font-bold text-cream leading-[1.3]">
          {COLLECTION_BANNER.title}
        </h2>
        <p className="font-bn-body text-lg md:text-xl text-cream/85 mt-5">{COLLECTION_BANNER.subtitle}</p>
        <Link
          href={COLLECTION_BANNER.href}
          className="inline-flex items-center justify-center mt-10 min-h-14 px-10 bg-cream text-charcoal font-bn-body text-lg font-semibold rounded hover:bg-white transition-colors duration-300"
        >
          {COLLECTION_BANNER.cta}
        </Link>
        <p className="font-bn-body text-sm text-mustard mt-6">{COLLECTION_BANNER.promo}</p>
        <p className="sr-only">{COLLECTION_BANNER.imageHint}</p>
      </ScrollFadeIn>
    </section>
  );
}
