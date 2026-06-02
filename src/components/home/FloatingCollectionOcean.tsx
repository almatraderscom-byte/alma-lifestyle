'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, type Transition } from 'framer-motion';
import { AutoRotateProductImage } from '@/components/product/AutoRotateProductImage';
import { getDefaultProductImage, resolveProductImageUrl } from '@/lib/default-images';
import { shouldUseStaticDemoCatalog } from '@/lib/storefront/catalog-source';
import { HOME_FEATURED_PRODUCTS } from '@/lib/content';
import { formatBdtPrice } from '@/lib/format-bn';
import { cn } from '@/lib/utils';

export type OceanProduct = {
  id: string;
  slug?: string;
  title: string;
  price: number;
  href: string;
  bgClass: string;
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

type OceanSlot = {
  key: string;
  product: OceanProduct;
  galleryImages: { id: string; bgClass: string; url?: string }[];
  imageUrl?: string;
  bgClass: string;
  isPlaceholder: boolean;
};

const OCEAN_SLOT_COUNT = 12;

const FALL_START_Y = -600;
const FALL_STAGGER_S = 0.2;
const FALL_DURATION_S = 1.5;
const LANDING_STAGGER_MS = 200;

const FALL_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const CARD_CONFIGS: CardConfig[] = [
  { x: 5, y: 10, rotate: -8, duration: 8, delay: 0, scale: 1 },
  { x: 25, y: -5, rotate: 4, duration: 10, delay: 0.5, scale: 0.95 },
  { x: 45, y: 15, rotate: -6, duration: 9, delay: 1, scale: 1.05 },
  { x: 65, y: 5, rotate: 5, duration: 11, delay: 0.3, scale: 0.9 },
  { x: 80, y: -8, rotate: -7, duration: 8.5, delay: 0.8, scale: 1 },
  { x: 15, y: 35, rotate: 3, duration: 12, delay: 0.2, scale: 0.98 },
  { x: 60, y: 30, rotate: -5, duration: 9.5, delay: 1.2, scale: 1.02 },
  { x: 35, y: 50, rotate: -3, duration: 10.5, delay: 0.7, scale: 0.93 },
  { x: 75, y: 50, rotate: 6, duration: 11.5, delay: 0.4, scale: 1.03 },
  { x: 8, y: 60, rotate: -4, duration: 9, delay: 1.5, scale: 0.97 },
  { x: 50, y: 65, rotate: 2, duration: 12.5, delay: 0.6, scale: 1.04 },
  { x: 85, y: 70, rotate: -6, duration: 10, delay: 0.9, scale: 0.95 },
];

const PLACEHOLDER_BGS = [
  'bg-terracotta',
  'bg-maroon',
  'bg-mustard',
  'bg-emerald',
  'bg-charcoal',
  'bg-[#92400e]',
  'bg-teal-700',
] as const;

interface FloatingCollectionOceanProps {
  products: OceanProduct[];
}

function oceanSlugFromHref(href: string): string {
  return href.replace(/^\/products\//, '').replace(/\/$/, '') || 'product';
}

function resolveOceanGallery(product: OceanProduct) {
  const slug = product.slug ?? oceanSlugFromHref(product.href);
  const imgs = product.galleryImages?.length
    ? product.galleryImages
    : [{ id: product.id, bgClass: product.bgClass }];
  return imgs.map((img) => ({
    ...img,
    url: resolveProductImageUrl(img.url, slug),
  }));
}

function getImageUrl(product: OceanProduct): string {
  return resolveOceanGallery(product)[0]?.url ?? getDefaultProductImage(oceanSlugFromHref(product.href));
}

function placeholderProduct(index: number): OceanProduct {
  const seed = HOME_FEATURED_PRODUCTS[index % HOME_FEATURED_PRODUCTS.length];
  const slug = seed?.slug ?? oceanSlugFromHref(seed?.href ?? '/products');
  const defaultUrl = getDefaultProductImage(slug, 'panjabi');
  return {
    id: `ocean-placeholder-${index}`,
    slug,
    title: seed?.title ?? `প্রিমিয়াম সংগ্রহ ${index + 1}`,
    price: seed?.price ?? 2500,
    href: seed?.href ?? '/products',
    bgClass: PLACEHOLDER_BGS[index % PLACEHOLDER_BGS.length],
    galleryImages: [{ id: seed?.id ?? `ph-${index}`, bgClass: seed?.bgClass ?? 'bg-cream', url: defaultUrl }],
  };
}

function buildOceanSlots(products: OceanProduct[]): OceanSlot[] {
  const slots: OceanSlot[] = [];
  const seenIds = new Set<string>();
  const seenImageUrls = new Set<string>();
  const useDemoFill = shouldUseStaticDemoCatalog();
  const slotLimit = useDemoFill
    ? OCEAN_SLOT_COUNT
    : Math.min(OCEAN_SLOT_COUNT, products.length);

  let productIndex = 0;

  for (let i = 0; i < slotLimit; i++) {
    let assigned: OceanSlot | null = null;

    while (productIndex < products.length) {
      const candidate = products[productIndex];
      productIndex += 1;
      if (seenIds.has(candidate.id)) continue;

      const imageUrl = getImageUrl(candidate);
      if (imageUrl && seenImageUrls.has(imageUrl)) continue;

      seenIds.add(candidate.id);
      if (imageUrl) seenImageUrls.add(imageUrl);

      const galleryImages = resolveOceanGallery(candidate);

      assigned = {
        key: `${candidate.id}-ocean-${i}`,
        product: candidate,
        galleryImages,
        imageUrl,
        bgClass:
          candidate.galleryImages?.[0]?.bgClass ??
          candidate.bgClass ??
          PLACEHOLDER_BGS[i % PLACEHOLDER_BGS.length],
        isPlaceholder: false,
      };
      break;
    }

    if (!assigned && useDemoFill) {
      const product = placeholderProduct(i);
      const imageUrl = getImageUrl(product);
      assigned = {
        key: product.id,
        product,
        galleryImages:
          product.galleryImages ?? [
            { id: product.id, bgClass: product.bgClass, url: imageUrl },
          ],
        imageUrl,
        bgClass: PLACEHOLDER_BGS[i % PLACEHOLDER_BGS.length],
        isPlaceholder: true,
      };
    }

    if (assigned) slots.push(assigned);
  }

  return slots;
}

function mobileConfigs(configs: CardConfig[]): CardConfig[] {
  return configs.map((config) => ({
    ...config,
    x: Math.min(92, Math.max(2, config.x * 0.75)),
    y: config.y * 1.15,
  }));
}

function waveTransition(config: CardConfig): Transition {
  return {
    y: {
      duration: config.duration,
      delay: config.delay,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
    x: {
      duration: config.duration,
      delay: config.delay,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  };
}

function fallTransition(idx: number): Transition {
  const stagger = idx * FALL_STAGGER_S;
  return {
    y: { duration: FALL_DURATION_S, delay: stagger, ease: FALL_EASE },
    opacity: { duration: 0.6, delay: stagger },
    rotate: { duration: FALL_DURATION_S, delay: stagger, ease: 'easeOut' },
    scale: { duration: FALL_DURATION_S, delay: stagger, ease: 'easeOut' },
  };
}

interface OceanCardProps {
  slot: OceanSlot;
  config: CardConfig;
  idx: number;
  isInView: boolean;
  reduceMotion: boolean | null;
}

function OceanCard({ slot, config, idx, isInView, reduceMotion }: OceanCardProps) {
  const { product, galleryImages, imageUrl, bgClass, isPlaceholder } = slot;
  const staggerOffset = (idx * 420) % 2500;
  const fallRotateOffset = idx % 2 === 0 ? -15 : 15;
  const startRotate = config.rotate + fallRotateOffset;
  const [hasLanded, setHasLanded] = useState(Boolean(reduceMotion));

  useEffect(() => {
    if (!isInView) {
      setHasLanded(Boolean(reduceMotion));
      return;
    }
    if (reduceMotion) {
      setHasLanded(true);
      return;
    }
    const landingTime = idx * LANDING_STAGGER_MS + FALL_DURATION_S * 1000;
    const timer = window.setTimeout(() => setHasLanded(true), landingTime);
    return () => window.clearTimeout(timer);
  }, [isInView, idx, reduceMotion]);

  const showWave = hasLanded;
  const active = isInView || Boolean(reduceMotion);

  return (
    <motion.div
      className="absolute w-28 cursor-pointer sm:w-32 md:w-40 lg:w-48"
      style={{
        left: `${config.x}%`,
        top: `${config.y}%`,
        zIndex: 10 + idx,
      }}
      initial={
        reduceMotion
          ? false
          : {
              y: FALL_START_Y,
              opacity: 0,
              rotate: startRotate,
              scale: config.scale,
              x: 0,
            }
      }
      animate={
        !active
          ? {
              y: FALL_START_Y,
              opacity: 0,
              rotate: startRotate,
              scale: config.scale,
              x: 0,
            }
          : showWave
            ? {
                y: [0, -30, 0],
                x: [0, 15, 0],
                opacity: 1,
                rotate: config.rotate,
                scale: config.scale,
              }
            : {
                y: 0,
                x: 0,
                opacity: 1,
                rotate: config.rotate,
                scale: config.scale,
              }
      }
      transition={showWave ? waveTransition(config) : fallTransition(idx)}
      whileHover={
        showWave && !reduceMotion
          ? { scale: config.scale * 1.1, zIndex: 50, transition: { duration: 0.3 } }
          : undefined
      }
    >
      <Link
        href={isPlaceholder ? '/products' : product.href}
        className="group block"
        tabIndex={isPlaceholder ? -1 : 0}
      >
        <div
          className={cn(
            'relative h-36 overflow-hidden rounded-2xl border-2 border-cream bg-cream shadow-lg',
            'transition-shadow duration-500 group-hover:shadow-[0_16px_40px_rgba(201,125,93,0.35)]',
            'md:h-56 lg:h-72',
            !imageUrl && bgClass
          )}
        >
          <AutoRotateProductImage
            images={galleryImages}
            alt={product.title}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
            rotationInterval={3000}
            staggerOffset={staggerOffset}
            productSlug={product.slug ?? oceanSlugFromHref(product.href)}
          />

          {imageUrl && (
            <div className="absolute inset-0 flex items-end bg-charcoal/0 p-3 transition-colors duration-500 group-hover:bg-charcoal/25">
              <div className="translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="font-bn-heading text-sm text-cream line-clamp-2">{product.title}</p>
                <p className="font-bn-body text-xs text-cream/85">{formatBdtPrice(product.price)}</p>
              </div>
            </div>
          )}

          {product.designGroupName && imageUrl && (
            <span className="absolute top-3 right-3 rounded-full bg-cream/90 px-2 py-1 font-bn-body text-[10px] font-medium text-charcoal backdrop-blur-sm">
              {product.designGroupName}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export function FloatingCollectionOcean({ products }: FloatingCollectionOceanProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const slots = useMemo(() => buildOceanSlots(products), [products]);
  const configs = useMemo(
    () => (isMobile ? mobileConfigs(CARD_CONFIGS) : CARD_CONFIGS),
    [isMobile]
  );

  const ctaDelay = reduceMotion ? 0.5 : (OCEAN_SLOT_COUNT - 1) * (LANDING_STAGGER_MS / 1000) + FALL_DURATION_S + 0.3;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-cream py-16 md:py-24"
    >
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
        <p className="editorial-label mx-auto mb-3 w-fit text-terracotta">জনপ্রিয় সংগ্রহ</p>
        <h2 className="font-bn-display text-3xl font-bold text-charcoal md:text-5xl lg:text-6xl">
          সবচেয়ে জনপ্রিয় ডিজাইন
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-bn-body text-base text-text-light md:text-lg">
          আমাদের ক্রেতাদের সবচেয়ে পছন্দের পাঞ্জাবি এবং পরিবার সেট সংগ্রহ
        </p>
      </motion.div>

      <div
        className={cn(
          'relative z-10 mx-auto max-w-7xl px-4',
          isMobile ? 'h-[640px]' : 'h-[900px] md:h-[1000px]'
        )}
      >
        {slots.map((slot, idx) => (
          <OceanCard
            key={slot.key}
            slot={slot}
            config={configs[idx % configs.length]}
            idx={idx}
            isInView={isInView}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: ctaDelay }}
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
