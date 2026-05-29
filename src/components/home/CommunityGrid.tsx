'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CommunitySectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { isUsableImageUrl } from '@/lib/homepage-image';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';
import { EASE_PREMIUM, scrollViewport } from '@/lib/animation-variants';

const TILE_GRADIENTS: Record<string, string> = {
  'bg-maroon': 'bg-gradient-to-b from-maroon to-maroon/80',
  'bg-terracotta': 'bg-gradient-to-b from-terracotta to-terracotta/80',
  'bg-mustard': 'bg-gradient-to-b from-mustard to-mustard/80',
  'bg-emerald': 'bg-gradient-to-b from-emerald to-emerald/80',
  'bg-cream': 'bg-gradient-to-b from-cream to-cream/80',
  'bg-charcoal': 'bg-gradient-to-b from-charcoal to-charcoal/80',
};

interface CommunityGridProps {
  data?: CommunitySectionData;
}

export function CommunityGrid({ data: dataProp }: CommunityGridProps) {
  const reduceMotion = useReducedMotion();
  const { ref, isInView } = useScrollAnimation();
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'community')!.data;

  return (
    <section ref={ref} className="section-padding bg-background">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="text-center mb-10 md:mb-12"
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: EASE_PREMIUM }}
        >
          <h2 className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-charcoal">
            {data.title}
          </h2>
          <motion.p
            className="font-bn-body text-base text-text-light mt-3"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE_PREMIUM }}
          >
            {data.subtitle}
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {data.tiles.map((tile, i) => (
            <motion.div
              key={tile.id}
              initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              viewport={scrollViewport}
              transition={{
                duration: 0.55,
                delay: (i % 3) * 0.08 + Math.floor(i / 3) * 0.06,
                ease: EASE_PREMIUM,
              }}
            >
              <Link
                href={data.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square rounded overflow-hidden"
              >
                {isUsableImageUrl(tile.imageUrl) ? (
                  <HomepageSectionImage
                    src={tile.imageUrl}
                    alt={tile.hint}
                    className="transition-transform duration-500 group-hover:scale-105"
                    sizes="120px"
                  />
                ) : (
                  <div
                    className={cn(
                      'absolute inset-0 pattern-overlay transition-transform duration-500 group-hover:scale-105',
                      TILE_GRADIENTS[tile.bgClass] ?? tile.bgClass
                    )}
                    aria-hidden
                  />
                )}
                <span className="sr-only">{tile.hint}</span>
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <InstagramIcon className="text-white opacity-20 group-hover:opacity-0 transition-opacity duration-300" />
                </span>
                <span className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors duration-300 flex items-center justify-center">
                  <InstagramIcon className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
