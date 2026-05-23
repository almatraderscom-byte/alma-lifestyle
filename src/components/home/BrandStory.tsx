'use client';

import Link from 'next/link';
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { isUsableImageUrl } from '@/lib/homepage-image';
import type { BrandStorySectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';

interface BrandStoryProps {
  data?: BrandStorySectionData;
}

export function BrandStory({ data: dataProp }: BrandStoryProps) {
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'brandStory')!.data;
  return (
    <section className="section-padding bg-warm-white">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <ScrollFadeIn>
          <div>
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
            <p className="font-bn-body text-sm text-text-light mt-3">{data.imageCaption}</p>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.1}>
          <div className="md:py-8">
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
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
