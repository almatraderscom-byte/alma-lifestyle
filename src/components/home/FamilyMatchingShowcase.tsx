'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { isUsableImageUrl } from '@/lib/homepage-image';
import type { FamilyMatchingSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageExtras } from '@/lib/homepage-extras';
import { EASE_PREMIUM } from '@/lib/animation-variants';
import { cn } from '@/lib/utils';
import { getTextFontClass } from '@/lib/text-utils';

interface FamilyMatchingShowcaseProps {
  data?: FamilyMatchingSectionData;
}

const CARD_FLOAT_CONFIG = [
  { duration: 4.0, y: [0, -8, 0], rotate: [0, 0.5, 0] },
  { duration: 5.0, y: [0, -6, 0], rotate: [0, -0.7, 0] },
  { duration: 4.5, y: [0, -10, 0], rotate: [0, 0.6, 0] },
  { duration: 5.5, y: [0, -7, 0], rotate: [0, -0.5, 0] },
];

export function FamilyMatchingShowcase({ data: dataProp }: FamilyMatchingShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px', amount: 0.2 });
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const data = dataProp ?? getDefaultHomepageExtras().familyMatching;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const cardsParallaxY = useTransform(scrollYProgress, [0, 1], [16, -16]);

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-cream overflow-hidden"
      data-alma-target="family-matching"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, ease: EASE_PREMIUM }}
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
            initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE_PREMIUM }}
            style={reduceMotion ? undefined : { y: imageY }}
            className="relative"
          >
            <motion.div
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
              transition={{ duration: 0.6, ease: EASE_PREMIUM }}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-xl"
            >
              {isUsableImageUrl(data.banner.url) ? (
                <HomepageSectionImage
                  src={data.banner.url}
                  alt={data.banner.alt || data.banner.caption}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <PlaceholderImage
                  hint={data.banner.imageHint}
                  bgClass={cn(data.banner.bgClass ?? 'bg-maroon', 'aspect-[4/3] w-full')}
                />
              )}
            </motion.div>
            {data.banner.caption && (
              <p className="font-bn-body text-sm text-text-light mt-2">{data.banner.caption}</p>
            )}
          </motion.div>
        </div>

        <motion.div
          className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
          style={reduceMotion ? undefined : { y: cardsParallaxY }}
        >
          {data.cards.map((item, idx) => {
            const float = CARD_FLOAT_CONFIG[idx % CARD_FLOAT_CONFIG.length];
            const floatY = isMobile ? float.y.map((v) => v * 0.6) : [...float.y];
            const floatRotate = isMobile ? [0, 0, 0] : [...float.rotate];

            return (
              <motion.div
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : undefined}
                transition={{
                  duration: 0.6,
                  delay: 0.35 + idx * 0.15,
                  ease: EASE_PREMIUM,
                }}
              >
                <Link href={item.href} className="group block overflow-hidden rounded-lg">
                  <motion.div
                    animate={
                      reduceMotion || !isInView
                        ? undefined
                        : { y: floatY, rotate: floatRotate }
                    }
                    transition={{
                      duration: float.duration,
                      delay: 0.95 + idx * 0.2,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatType: 'loop',
                    }}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : { y: -8, scale: 1.05, transition: { duration: 0.3, ease: 'easeOut' } }
                    }
                    className="relative"
                  >
                    {isUsableImageUrl(item.imageUrl) ? (
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg shadow-md transition-shadow duration-500 group-hover:shadow-2xl">
                        <HomepageSectionImage
                          src={item.imageUrl}
                          alt={item.alt || item.label}
                          className="transition-transform duration-700 group-hover:scale-110"
                          sizes="25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 flex items-end p-3">
                          <span className="font-bn-body text-xs text-white">দেখুন →</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <PlaceholderImage
                          hint={item.imageHint}
                          bgClass={cn(
                            item.bgClass,
                            'aspect-[3/4] w-full rounded-lg shadow-md transition-shadow duration-500 group-hover:shadow-2xl'
                          )}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 flex items-end p-3 rounded-lg">
                          <span className="font-bn-body text-xs text-white">দেখুন →</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                  <p className="font-bn-heading mt-3 text-center text-lg font-semibold text-charcoal transition-colors duration-300 group-hover:text-terracotta">
                    {item.label}
                  </p>
                  {item.caption && (
                    <p className="font-bn-body text-center text-xs text-text-light mt-1">{item.caption}</p>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
