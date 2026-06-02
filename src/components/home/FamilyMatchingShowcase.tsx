'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { isUsableImageUrl } from '@/lib/homepage-image';
import type { FamilyMatchingSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageExtras } from '@/lib/homepage-extras';
import { scrollViewport } from '@/lib/animation-variants';
import { cn } from '@/lib/utils';
import { getTextFontClass } from '@/lib/text-utils';

interface FamilyMatchingShowcaseProps {
  data?: FamilyMatchingSectionData;
}

export function FamilyMatchingShowcase({ data: dataProp }: FamilyMatchingShowcaseProps) {
  const reduceMotion = useReducedMotion();
  const data = dataProp ?? getDefaultHomepageExtras().familyMatching;

  return (
    <section className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65 }}
            viewport={scrollViewport}
          >
            <p className="editorial-label mb-3 text-terracotta">{data.label}</p>
            <h2
              className={cn(
                getTextFontClass(data.title, 'display'),
                'text-3xl font-bold text-charcoal md:text-5xl leading-[1.35]'
              )}
            >
              {data.title}
            </h2>
            <p className="font-bn-body mt-5 text-base text-text-light md:text-lg leading-relaxed">
              {data.body}
            </p>
            <Link
              href={data.ctaHref}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded bg-terracotta px-8 font-bn-body text-base font-semibold text-white transition-colors hover:bg-[#b06d4f]"
            >
              {data.ctaText}
            </Link>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            viewport={scrollViewport}
            className="relative"
          >
            {isUsableImageUrl(data.banner.url) ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                <HomepageSectionImage
                  src={data.banner.url}
                  alt={data.banner.alt || data.banner.caption}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ) : (
              <PlaceholderImage
                hint={data.banner.imageHint}
                bgClass={cn(data.banner.bgClass ?? 'bg-maroon', 'aspect-[4/3] w-full rounded-xl')}
              />
            )}
            {data.banner.caption && (
              <p className="font-bn-body text-sm text-text-light mt-2">{data.banner.caption}</p>
            )}
          </motion.div>
        </div>

        <motion.div
          className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={scrollViewport}
        >
          {data.cards.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group block overflow-hidden rounded-lg"
            >
              {isUsableImageUrl(item.imageUrl) ? (
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                  <HomepageSectionImage
                    src={item.imageUrl}
                    alt={item.alt || item.label}
                    className="transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="25vw"
                  />
                </div>
              ) : (
                <PlaceholderImage
                  hint={item.imageHint}
                  bgClass={cn(
                    item.bgClass,
                    'aspect-[3/4] w-full transition-transform duration-500 group-hover:scale-[1.02]'
                  )}
                />
              )}
              <p className="font-bn-heading mt-3 text-center text-lg font-semibold text-charcoal">
                {item.label}
              </p>
              {item.caption && (
                <p className="font-bn-body text-center text-xs text-text-light mt-1">{item.caption}</p>
              )}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
