'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { FeaturedProduct } from '@/lib/content';
import { formatBdtPrice } from '@/lib/format-bn';
import { cn } from '@/lib/utils';

export type OceanProduct = FeaturedProduct & {
  galleryImages?: { id: string; bgClass: string; url?: string }[];
  designGroupName?: string;
};

interface CardConfig {
  x: number;
  y: number;
  rotate: number;
  duration: number;
  delay: number;
  scale: number;
}

const CARD_CONFIGS: CardConfig[] = [
  { x: 5, y: 10, rotate: -8, duration: 8, delay: 0, scale: 1 },
  { x: 25, y: -5, rotate: 4, duration: 10, delay: 0.5, scale: 0.95 },
  { x: 45, y: 15, rotate: -6, duration: 9, delay: 1, scale: 1.05 },
  { x: 65, y: 5, rotate: 5, duration: 11, delay: 0.3, scale: 0.9 },
  { x: 80, y: -8, rotate: -7, duration: 8.5, delay: 0.8, scale: 1 },
  { x: 15, y: 35, rotate: 3, duration: 12, delay: 0.2, scale: 0.98 },
  { x: 60, y: 30, rotate: -5, duration: 9.5, delay: 1.2, scale: 1.02 },
];

interface FloatingCollectionOceanProps {
  products: OceanProduct[];
}

function getImageUrl(product: OceanProduct): string | undefined {
  const url = product.galleryImages?.[0]?.url;
  return url && url.trim().length > 0 ? url : undefined;
}

function mobileConfigs(configs: CardConfig[]): CardConfig[] {
  return configs.map((config) => ({
    ...config,
    x: Math.min(92, Math.max(2, config.x * 0.75)),
    y: config.y * 1.15,
  }));
}

export function FloatingCollectionOcean({ products }: FloatingCollectionOceanProps) {
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const floatingProducts = products.slice(0, 7);
  const configs = useMemo(
    () => (isMobile ? mobileConfigs(CARD_CONFIGS) : CARD_CONFIGS),
    [isMobile]
  );

  if (floatingProducts.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden bg-cream py-20 md:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] text-charcoal" aria-hidden>
        <svg className="h-full w-full" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="ocean-dots" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="1200" height="400" fill="url(#ocean-dots)" />
        </svg>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: '-80px' }}
        className="relative z-10 mb-12 px-4 text-center md:mb-16"
      >
        <p className="editorial-label mx-auto mb-3 w-fit text-terracotta">নতুন সংগ্রহ</p>
        <h2 className="font-bn-heading text-3xl font-bold text-charcoal md:text-5xl lg:text-6xl">
          আমাদের নতুন ডিজাইন
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-bn-body text-base text-text-light md:text-lg">
          হাতে বোনা প্রিমিয়াম পাঞ্জাবি এবং ঐতিহ্যবাহী পোশাক সংগ্রহ
        </p>
      </motion.div>

      <div
        className={cn(
          'relative z-10 mx-auto max-w-7xl px-4',
          isMobile ? 'h-[520px]' : 'h-[500px] md:h-[600px] lg:h-[700px]'
        )}
      >
        {floatingProducts.map((product, idx) => {
          const config = configs[idx % configs.length];
          const imageUrl = getImageUrl(product);
          const bgClass = product.galleryImages?.[0]?.bgClass ?? product.bgClass;

          return (
            <motion.div
              key={`${product.id}-${idx}`}
              className="absolute w-28 cursor-pointer sm:w-32 md:w-40 lg:w-48"
              style={{
                left: `${config.x}%`,
                top: `${config.y}%`,
                zIndex: 10 + idx,
              }}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={
                reduceMotion
                  ? { opacity: 1, scale: config.scale, rotate: config.rotate }
                  : {
                      opacity: 1,
                      scale: config.scale,
                      rotate: config.rotate,
                      y: [0, -30, 0],
                      x: [0, 15, 0],
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0.6, delay: config.delay }
                  : {
                      opacity: { duration: 0.8, delay: config.delay },
                      scale: { duration: 0.8, delay: config.delay },
                      rotate: { duration: 0.8, delay: config.delay },
                      y: {
                        duration: config.duration,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        delay: config.delay,
                      },
                      x: {
                        duration: config.duration,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        delay: config.delay,
                      },
                    }
              }
              whileHover={
                reduceMotion
                  ? undefined
                  : { scale: config.scale * 1.1, zIndex: 50, transition: { duration: 0.35 } }
              }
            >
              <Link href={product.href} className="group block">
                <div
                  className={cn(
                    'relative h-36 overflow-hidden rounded-2xl border-2 border-cream bg-cream shadow-lg',
                    'transition-shadow duration-500 group-hover:shadow-[0_16px_40px_rgba(201,125,93,0.35)]',
                    'md:h-56 lg:h-72',
                    !imageUrl && bgClass
                  )}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 120px, 192px"
                    />
                  ) : (
                    <div className="absolute inset-0 pattern-overlay opacity-25" aria-hidden />
                  )}

                  <div className="absolute inset-0 flex items-end bg-charcoal/0 p-3 transition-colors duration-500 group-hover:bg-charcoal/25">
                    <div className="translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="font-bn-heading text-sm text-cream line-clamp-2">{product.title}</p>
                      <p className="font-bn-body text-xs text-cream/85">{formatBdtPrice(product.price)}</p>
                    </div>
                  </div>

                  {product.designGroupName && (
                    <span className="absolute top-3 right-3 rounded-full bg-cream/90 px-2 py-1 font-bn-body text-[10px] font-medium text-charcoal backdrop-blur-sm">
                      {product.designGroupName}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        viewport={{ once: true }}
        className="relative z-10 mt-12 flex justify-center md:mt-16"
      >
        <Link
          href="/products"
          className="inline-flex min-h-12 items-center justify-center rounded bg-terracotta px-8 py-3 font-bn-body text-base font-semibold text-white transition-all hover:bg-[#b06d4f] hover:shadow-lg"
        >
          সম্পূর্ণ কালেকশন দেখুন →
        </Link>
      </motion.div>

      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-terracotta/30 to-transparent"
        aria-hidden
      />
    </section>
  );
}
