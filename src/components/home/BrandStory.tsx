'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { isUsableImageUrl } from '@/lib/homepage-image';
import type { BrandStorySectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { migrateBrandStorySection } from '@/lib/homepage-migrations';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';
import { EASE_PREMIUM, scrollViewport } from '@/lib/animation-variants';
import { BRAND_STORY } from '@/lib/content';
import { cn } from '@/lib/utils';

interface BrandStoryProps {
  data?: BrandStorySectionData;
}

function CollageSlot({
  slot,
  className,
  sizes,
}: {
  slot: BrandStorySectionData['images'][0];
  className?: string;
  sizes: string;
}) {
  const bg = slot.bgClass ?? 'bg-maroon';
  if (isUsableImageUrl(slot.url)) {
    return (
      <div className={cn('relative overflow-hidden rounded-lg', className)}>
        <HomepageSectionImage src={slot.url} alt={slot.alt || slot.caption} sizes={sizes} />
      </div>
    );
  }
  return (
    <PlaceholderImage
      hint={slot.imageHint}
      bgClass={cn(bg, 'w-full rounded-lg', className)}
    />
  );
}

export function BrandStory({ data: dataProp }: BrandStoryProps) {
  const reduceMotion = useReducedMotion();
  const { ref: sectionRef } = useScrollAnimation();

  const raw =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'brandStory')!.data;
  const data = migrateBrandStorySection(raw);
  const images = data.images.map((img, i) => ({
    ...img,
    caption:
      img.caption?.trim() ||
      BRAND_STORY.imageCaptions[i] ||
      (i === 0 ? BRAND_STORY.imageCaption : ''),
  }));

  const storyParagraphs = BRAND_STORY.paragraphs;

  return (
    <section ref={sectionRef} className="section-padding bg-warm-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={scrollViewport}
            transition={{ duration: 0.7, ease: EASE_PREMIUM }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <CollageSlot slot={images[0]} className="aspect-[16/10]" sizes="(max-width: 768px) 100vw, 45vw" />
                {images[0]?.caption && (
                  <p className="font-bn-body text-sm text-text-light mt-2">{images[0].caption}</p>
                )}
              </div>
              <div>
                <CollageSlot slot={images[1]} className="aspect-square" sizes="25vw" />
                {images[1]?.caption && (
                  <p className="font-bn-body text-sm text-text-light mt-2">{images[1].caption}</p>
                )}
              </div>
              <div>
                <CollageSlot slot={images[2]} className="aspect-square" sizes="25vw" />
                {images[2]?.caption && (
                  <p className="font-bn-body text-sm text-text-light mt-2">{images[2].caption}</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={scrollViewport}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE_PREMIUM }}
            className="md:py-4"
          >
            <p className="editorial-label mb-4 text-terracotta">{data.label || BRAND_STORY.label}</p>
            <h2 className="font-bn-heading text-[1.75rem] font-bold text-charcoal md:text-4xl leading-[1.35]">
              {data.title || BRAND_STORY.title}
            </h2>

            <blockquote className="my-6 border-l-4 border-terracotta pl-5 font-bn-heading text-xl italic text-maroon md:text-2xl">
              {BRAND_STORY.blockquote}
            </blockquote>

            <div className="space-y-4 font-bn-body text-base text-text-light leading-relaxed md:text-lg">
              {storyParagraphs.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>

            <p className="mt-6 font-bn-body text-sm text-terracotta font-medium">
              প্রতিষ্ঠা · ২০১৮ · বাংলাদেশ
            </p>

            <Link
              href={data.ctaHref}
              className="link-underline mt-8 inline-block font-bn-body text-base font-semibold text-charcoal"
            >
              {data.cta}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
