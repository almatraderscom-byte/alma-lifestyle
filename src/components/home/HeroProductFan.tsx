'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import type { FeaturedProduct } from '@/lib/content';
import { SITE } from '@/lib/content';
import { cn } from '@/lib/utils';
import { EASE_PREMIUM } from '@/lib/animation-variants';

const FAN_LAYOUT = [
  { x: -120, y: 20, rotate: -15, zIndex: 1 },
  { x: -60, y: -10, rotate: -7, zIndex: 2 },
  { x: 0, y: 0, rotate: 0, zIndex: 5 },
  { x: 60, y: -10, rotate: 7, zIndex: 3 },
  { x: 120, y: 20, rotate: 15, zIndex: 2 },
  { x: 90, y: 32, rotate: 12, zIndex: 1 },
] as const;

const PLACEHOLDER_BGS = [
  'bg-maroon',
  'bg-terracotta',
  'bg-mustard',
  'bg-emerald',
  'bg-cream',
  'bg-charcoal',
] as const;

type FanCard = FeaturedProduct & {
  galleryImages?: { id: string; bgClass: string; url?: string }[];
};

interface HeroProductFanProps {
  products?: FanCard[];
}

export function HeroProductFan({ products = [] }: HeroProductFanProps) {
  const reduceMotion = useReducedMotion();
  const cards: FanCard[] =
    products.length > 0
      ? products.slice(0, 6)
      : PLACEHOLDER_BGS.map((bg, i) => ({
          id: `placeholder-${i}`,
          title: 'আলমা কালেকশন',
          price: 0,
          bgClass: bg,
          href: '/products',
        }));

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
      aria-hidden={products.length === 0}
    >
      <div className="relative h-[min(72vw,420px)] w-[min(92vw,520px)]">
        {cards.map((product, index) => {
          const layout = FAN_LAYOUT[index] ?? FAN_LAYOUT[2];
          const imageUrl = product.galleryImages?.[0]?.url;
          const bgClass =
            product.galleryImages?.[0]?.bgClass ?? product.bgClass ?? PLACEHOLDER_BGS[index % 6];

          return (
            <motion.div
              key={product.id}
              className="absolute left-1/2 top-1/2 w-[38%] max-w-[140px] -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ zIndex: layout.zIndex }}
              initial={
                reduceMotion
                  ? {
                      x: layout.x,
                      y: layout.y,
                      rotate: layout.rotate,
                      scale: 1,
                      opacity: 1,
                    }
                  : { x: 0, y: 0, rotate: 0, scale: 0.9, opacity: 0.85 }
              }
              animate={
                reduceMotion
                  ? { x: layout.x, y: layout.y, rotate: layout.rotate, scale: 1, opacity: 1 }
                  : {
                      x: layout.x,
                      rotate: layout.rotate,
                      scale: 1,
                      opacity: 1,
                      y: [layout.y, layout.y - 5, layout.y],
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      x: { duration: 1.2, ease: 'easeOut', delay: index * 0.1 },
                      rotate: { duration: 1.2, ease: 'easeOut', delay: index * 0.1 },
                      scale: { duration: 1.2, ease: 'easeOut', delay: index * 0.1 },
                      opacity: { duration: 0.5, delay: index * 0.1 },
                      y: {
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1.2 + index * 0.1,
                      },
                    }
              }
            >
              <Link
                href={product.href}
                className={cn(
                  'group relative block aspect-[3/4] overflow-hidden rounded-md shadow-lg',
                  'ring-1 ring-cream/30 will-change-transform',
                  !imageUrl && bgClass
                )}
                tabIndex={products.length === 0 ? -1 : 0}
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="140px"
                    priority={index === 2}
                  />
                ) : (
                  <div className="absolute inset-0 pattern-overlay opacity-30" aria-hidden />
                )}
                <span className="absolute top-2 right-2 rounded-full bg-charcoal/55 px-2 py-0.5 font-bn-body text-[9px] text-cream backdrop-blur-sm">
                  @{SITE.brandName}
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/80 to-transparent p-2 pt-6">
                  <p className="font-bn-body text-[10px] sm:text-xs text-cream line-clamp-2 leading-snug">
                    {product.title}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
