'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn';
import { formatBnText } from '@/lib/format-bn';
import { cn } from '@/lib/utils';
import type { CollectionBannerSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { isUsableImageUrl } from '@/lib/homepage-image';

interface CollectionBannerEditorialProps {
  data?: CollectionBannerSectionData;
}

export function CollectionBannerEditorial({ data: dataProp }: CollectionBannerEditorialProps) {
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'collectionBanner')!.data;

  const hasBgImage = isUsableImageUrl(data.backgroundImageUrl);

  return (
    <section
      className={cn(
        'relative min-h-[70vh] flex items-center justify-center pattern-overlay',
        !hasBgImage && data.bgClass
      )}
    >
      {hasBgImage && (
        <HomepageSectionImage
          src={data.backgroundImageUrl}
          alt={data.title}
          sizes="100vw"
        />
      )}
      <div
        className={cn(
          'absolute inset-0',
          hasBgImage ? 'bg-charcoal/50' : 'bg-maroon/95'
        )}
        aria-hidden
      />
      <ScrollFadeIn className="relative z-10 text-center px-6 md:px-12 max-w-3xl">
        <p className="editorial-label text-mustard mb-6 mx-auto w-fit">{data.label}</p>
        <h2 className="font-bn-heading text-[2rem] sm:text-5xl md:text-6xl font-bold text-cream leading-[1.3]">
          {data.title}
        </h2>
        <p className="font-bn-body text-lg md:text-xl text-cream/85 mt-5">{data.subtitle}</p>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <Link
            href={data.href}
            className="inline-flex items-center justify-center min-h-14 px-10 bg-cream text-charcoal font-bn-body text-lg font-semibold rounded hover:bg-white transition-colors duration-300"
          >
            {data.cta}
          </Link>
        </motion.div>
        <p className="font-bn-body text-sm text-mustard mt-6">{formatBnText(data.promo)}</p>
        <p className="sr-only">{data.imageHint}</p>
      </ScrollFadeIn>
    </section>
  );
}
