'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { FeaturedProduct } from '@/lib/content';
import { SITE } from '@/lib/content';
import { cn } from '@/lib/utils';
import { EASE_PREMIUM } from '@/lib/animation-variants';

const FAN_LAYOUT_DESKTOP = [
  { x: -100, y: -8, rotate: -15, zIndex: 1 },
  { x: -50, y: -18, rotate: -7, zIndex: 2 },
  { x: 0, y: -24, rotate: 0, zIndex: 5 },
  { x: 50, y: -18, rotate: 7, zIndex: 3 },
  { x: 100, y: -8, rotate: 15, zIndex: 2 },
] as const;

const FAN_LAYOUT_MOBILE = [
  { x: -52, y: -6, rotate: -12, zIndex: 2 },
  { x: 0, y: -14, rotate: 0, zIndex: 5 },
  { x: 52, y: -6, rotate: 12, zIndex: 2 },
] as const;

/** Distinct earthy placeholders when a slot has no product */
const PLACEHOLDER_BGS = [
  'bg-terracotta',
  'bg-maroon',
  'bg-mustard',
  'bg-emerald',
  'bg-charcoal',
] as const;

type FanCard = FeaturedProduct & {
  galleryImages?: { id: string; bgClass: string; url?: string }[];
};

type FanSlot = {
  key: string;
  product: FanCard;
  imageUrl?: string;
  bgClass: string;
  isPlaceholder: boolean;
};

interface HeroProductFanProps {
  products?: FanCard[];
}

function placeholderCard(index: number): FanCard {
  return {
    id: `fan-placeholder-${index}`,
    title: 'আলমা কালেকশন',
    price: 0,
    bgClass: PLACEHOLDER_BGS[index % PLACEHOLDER_BGS.length],
    href: '/products',
  };
}

function buildFanSlots(products: FanCard[], slotCount: number): FanSlot[] {
  const slots: FanSlot[] = [];

  for (let i = 0; i < slotCount; i++) {
    const source = products[i];
    const usePlaceholder = !source || (products.length === 1 && i > 0);

    if (usePlaceholder) {
      const product = placeholderCard(i);
      slots.push({
        key: product.id,
        product,
        imageUrl: undefined,
        bgClass: PLACEHOLDER_BGS[i % PLACEHOLDER_BGS.length],
        isPlaceholder: true,
      });
      continue;
    }

    const imageUrl = source.galleryImages?.[0]?.url;
    slots.push({
      key: `${source.id}-${i}`,
      product: source,
      imageUrl,
      bgClass:
        source.galleryImages?.[0]?.bgClass ??
        source.bgClass ??
        PLACEHOLDER_BGS[i % PLACEHOLDER_BGS.length],
      isPlaceholder: !imageUrl,
    });
  }

  return slots;
}

export function HeroProductFan({ products = [] }: HeroProductFanProps) {
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const slotCount = isMobile ? 3 : 5;
  const layouts = isMobile ? FAN_LAYOUT_MOBILE : FAN_LAYOUT_DESKTOP;
  const slots = useMemo(() => buildFanSlots(products, slotCount), [products, slotCount]);

  return (
    <div
      className={cn(
        'absolute z-10 pointer-events-none',
        'bottom-[10%] right-[5%] max-w-[50%]',
        'max-sm:bottom-[6%] max-sm:right-auto max-sm:left-1/2 max-sm:-translate-x-1/2',
        'max-sm:max-w-[88%] max-sm:scale-[0.7] max-sm:origin-bottom'
      )}
      aria-hidden={products.length === 0 && slots.every((s) => s.isPlaceholder)}
    >
      <div
        className={cn(
          'relative',
          isMobile ? 'h-[160px] w-[200px]' : 'h-[180px] w-[340px]'
        )}
      >
        {slots.map((slot, index) => {
          const layout = layouts[index] ?? layouts[Math.floor(layouts.length / 2)];
          const { product, imageUrl, bgClass, isPlaceholder } = slot;

          return (
            <motion.div
              key={slot.key}
              className="absolute bottom-0 right-0 w-[120px] h-[160px] pointer-events-auto"
              style={{
                zIndex: layout.zIndex,
                transformOrigin: 'bottom right',
              }}
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
                  'group relative block h-full w-full overflow-hidden rounded-md',
                  'bg-cream border border-cream/95 shadow-[0_4px_14px_rgba(42,38,34,0.22)]',
                  'ring-1 ring-white/70 will-change-transform',
                  !imageUrl && bgClass
                )}
                tabIndex={isPlaceholder && products.length === 0 ? -1 : 0}
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="120px"
                    priority={index === Math.floor(slotCount / 2)}
                  />
                ) : (
                  <div className="absolute inset-0 pattern-overlay opacity-30" aria-hidden />
                )}
                <span className="absolute top-2 right-2 rounded-full bg-charcoal/55 px-2 py-0.5 font-bn-body text-[9px] text-cream backdrop-blur-sm">
                  @{SITE.brandName}
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/80 to-transparent p-2 pt-6">
                  <p className="font-bn-body text-[10px] text-cream line-clamp-2 leading-snug">
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
