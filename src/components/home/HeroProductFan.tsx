'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { FeaturedProduct } from '@/lib/content';
import { SITE } from '@/lib/content';
import { cn } from '@/lib/utils';

const FAN_LAYOUT_DESKTOP = [
  { x: -110, y: -10, rotate: -15, zIndex: 1 },
  { x: -55, y: -20, rotate: -7, zIndex: 2 },
  { x: 0, y: -28, rotate: 0, zIndex: 5 },
  { x: 55, y: -20, rotate: 7, zIndex: 3 },
  { x: 110, y: -10, rotate: 15, zIndex: 2 },
] as const;

const FAN_LAYOUT_MOBILE = [
  { x: -48, y: -8, rotate: -12, zIndex: 2 },
  { x: 0, y: -16, rotate: 0, zIndex: 5 },
  { x: 48, y: -8, rotate: 12, zIndex: 2 },
] as const;

const PLACEHOLDER_BGS = [
  'bg-terracotta',
  'bg-maroon',
  'bg-mustard',
  'bg-emerald',
  'bg-charcoal',
] as const;

const CARD_W_DESKTOP = 140;
const CARD_H_DESKTOP = 180;
const CARD_W_MOBILE = 100;
const CARD_H_MOBILE = 130;
const STAGE_W_DESKTOP = 360;
const STAGE_H_DESKTOP = 220;
const STAGE_W_MOBILE = 220;
const STAGE_H_MOBILE = 160;

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

function getProductImageUrl(product: FanCard): string | undefined {
  const url = product.galleryImages?.[0]?.url;
  return url && url.trim().length > 0 ? url : undefined;
}

function buildFanSlots(products: FanCard[], slotCount: number): FanSlot[] {
  const slots: FanSlot[] = [];
  const seenImageUrls = new Set<string>();
  const seenProductIds = new Set<string>();

  for (let i = 0; i < slotCount; i++) {
    const source = products[i];
    let usePlaceholder = !source;

    if (source) {
      if (products.length === 1 && i > 0) {
        usePlaceholder = true;
      } else if (i > 0 && seenProductIds.has(source.id)) {
        usePlaceholder = true;
      } else {
        const imageUrl = getProductImageUrl(source);
        if (imageUrl && seenImageUrls.has(imageUrl)) {
          usePlaceholder = true;
        }
      }
    }

    if (usePlaceholder) {
      const product = placeholderCard(i);
      slots.push({
        key: `placeholder-${i}`,
        product,
        imageUrl: undefined,
        bgClass: PLACEHOLDER_BGS[i % PLACEHOLDER_BGS.length],
        isPlaceholder: true,
      });
      continue;
    }

    const sourceProduct = source!;
    const imageUrl = getProductImageUrl(sourceProduct);
    seenProductIds.add(sourceProduct.id);
    if (imageUrl) {
      seenImageUrls.add(imageUrl);
    }

    slots.push({
      key: `${sourceProduct.id}-slot-${i}`,
      product: sourceProduct,
      imageUrl,
      bgClass:
        sourceProduct.galleryImages?.[0]?.bgClass ??
        sourceProduct.bgClass ??
        PLACEHOLDER_BGS[i % PLACEHOLDER_BGS.length],
      isPlaceholder: !imageUrl,
    });
  }

  return slots;
}

/** Card top-left from bottom-right stage pivot */
function cardPosition(
  stageW: number,
  stageH: number,
  cardW: number,
  cardH: number,
  offsetX: number,
  offsetY: number
) {
  return {
    left: stageW - cardW + offsetX,
    top: stageH - cardH + offsetY,
  };
}

export function HeroProductFan({ products = [] }: HeroProductFanProps) {
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

  const cardW = isMobile ? CARD_W_MOBILE : CARD_W_DESKTOP;
  const cardH = isMobile ? CARD_H_MOBILE : CARD_H_DESKTOP;
  const stageW = isMobile ? STAGE_W_MOBILE : STAGE_W_DESKTOP;
  const stageH = isMobile ? STAGE_H_MOBILE : STAGE_H_DESKTOP;

  useEffect(() => {
    console.log(
      '[HeroFan] Featured products:',
      products.length,
      products.map((p) => p.title)
    );
    console.log(
      '[HeroFan] Slots:',
      slots.map((s, i) => ({
        slot: i,
        title: s.product.title,
        hasImage: Boolean(s.imageUrl),
        placeholder: s.isPlaceholder,
      }))
    );
  }, [products, slots]);

  const wrapperStyle: CSSProperties = isMobile
    ? {
        position: 'absolute',
        bottom: '5%',
        left: '50%',
        transform: 'translateX(-50%) scale(0.7)',
        transformOrigin: 'bottom center',
        width: stageW,
        height: stageH,
        zIndex: 20,
        pointerEvents: 'auto',
        border: '2px solid red',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
      }
    : {
        position: 'absolute',
        bottom: '8%',
        right: '4%',
        maxWidth: '45%',
        width: stageW,
        height: stageH,
        zIndex: 20,
        pointerEvents: 'auto',
        border: '2px solid red',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
      };

  return (
    <>
      {/* DEBUG: featured.length={products.length} slots={slots.length} mobile={String(isMobile)} */}
      <div className="absolute" style={wrapperStyle} data-hero-fan="root">
        <div
          style={{
            position: 'relative',
            width: stageW,
            height: stageH,
          }}
        >
          {slots.map((slot, index) => {
            const layout = layouts[index] ?? layouts[Math.floor(layouts.length / 2)];
            const { product, imageUrl, bgClass, isPlaceholder } = slot;
            const isHovered = hoveredIndex === index;
            const zIndex = isHovered ? 50 : layout.zIndex;
            const { left, top } = cardPosition(
              stageW,
              stageH,
              cardW,
              cardH,
              layout.x,
              layout.y
            );

            return (
              <motion.div
                key={slot.key}
                className="absolute"
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width: cardW,
                  height: cardH,
                  zIndex,
                }}
                initial={
                  reduceMotion
                    ? { opacity: 1, scale: 1, rotate: layout.rotate }
                    : { opacity: 0, scale: 0.9, rotate: 0 }
                }
                animate={
                  reduceMotion
                    ? { opacity: 1, scale: 1, rotate: layout.rotate }
                    : {
                        opacity: 1,
                        scale: isHovered ? 1.15 : 1,
                        rotate: layout.rotate,
                      }
                }
                transition={{
                  opacity: { duration: 0.5, delay: index * 0.1 },
                  scale: { duration: 0.4, ease: 'easeOut' },
                  rotate: { duration: 1.2, ease: 'easeOut', delay: index * 0.1 },
                }}
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        scale: 1.15,
                        y: -10,
                        transition: { duration: 0.4, ease: 'easeOut' },
                      }
                }
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
              >
                <Link
                  href={product.href}
                  className={cn(
                    'group relative block h-full w-full overflow-hidden rounded-md',
                    'bg-cream border-2 border-cream',
                    'shadow-[0_8px_24px_rgba(201,125,93,0.45)]',
                    'ring-1 ring-white/80',
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
                      sizes={`${cardW}px`}
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
    </>
  );
}
