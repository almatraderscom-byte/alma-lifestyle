'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AutoRotateProductImage } from '@/components/product/AutoRotateProductImage';
import type { OceanProduct } from '@/components/home/FloatingCollectionOcean';
import { formatBdtPrice } from '@/lib/format-bn';
import { cn } from '@/lib/utils';

interface MagneticConstellationProps {
  products: OceanProduct[];
}

const CARD_CONFIGS = [
  { x: 8, y: 12, rotate: -6, delay: 0 },
  { x: 28, y: 6, rotate: 4, delay: 0.4 },
  { x: 52, y: 14, rotate: -4, delay: 0.8 },
  { x: 72, y: 8, rotate: 5, delay: 1.2 },
  { x: 18, y: 38, rotate: 3, delay: 0.2 },
  { x: 45, y: 42, rotate: -5, delay: 0.6 },
  { x: 68, y: 36, rotate: 4, delay: 1.0 },
  { x: 85, y: 48, rotate: -3, delay: 1.4 },
  { x: 12, y: 62, rotate: -4, delay: 0.5 },
  { x: 38, y: 68, rotate: 2, delay: 0.9 },
  { x: 62, y: 64, rotate: -6, delay: 1.3 },
  { x: 78, y: 72, rotate: 3, delay: 1.6 },
] as const;

function nearestPairs(count: number, maxDist = 3): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < Math.min(i + maxDist + 1, count); j++) {
      pairs.push([i, j]);
    }
  }
  return pairs.slice(0, Math.min(18, pairs.length));
}

export function MagneticConstellation({ products }: MagneticConstellationProps) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [offsets, setOffsets] = useState<{ x: number; y: number }[]>(
    () => CARD_CONFIGS.map(() => ({ x: 0, y: 0 }))
  );
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const slots = useMemo(
    () =>
      CARD_CONFIGS.map((cfg, i) => ({
        cfg,
        product: products[i % Math.max(products.length, 1)],
        key: products[i % Math.max(products.length, 1)]?.id ?? `slot-${i}`,
      })).slice(0, Math.min(12, Math.max(products.length, 8))),
    [products]
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reduced || isMobile) return;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      const next = cardRefs.current.map((el) => {
        if (!el) return { x: 0, y: 0 };
        const cr = el.getBoundingClientRect();
        const cx = cr.left + cr.width / 2 - rect.left;
        const cy = cr.top + cr.height / 2 - rect.top;
        const dx = mouse.x - cx;
        const dy = mouse.y - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > 200) return { x: 0, y: 0 };
        const pull = Math.min(12, ((200 - dist) / 200) * 12);
        const angle = Math.atan2(dy, dx);
        return { x: Math.cos(angle) * pull, y: Math.sin(angle) * pull };
      });
      setOffsets(next);
    },
    [reduced, isMobile, mouse.x, mouse.y]
  );

  const pairs = useMemo(() => nearestPairs(slots.length), [slots.length]);

  if (reduced || isMobile) {
    return (
      <section className="bg-cream px-6 py-16 md:px-12">
        <div className="mx-auto mb-10 max-w-7xl text-center">
          <p className="font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">FAMILY CONSTELLATION</p>
          <h2 className="mt-3 font-bn-heading text-3xl font-bold text-charcoal">সবচেয়ে জনপ্রিয় ডিজাইন</h2>
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-3">
          {products.slice(0, 8).map((product) => (
            <Link
              key={product.id}
              href={product.href}
              className="overflow-hidden rounded-sm bg-white shadow-md focus-visible:outline-2 focus-visible:outline-mustard"
            >
              <div className="relative aspect-[3/4]">
                <AutoRotateProductImage
                  images={product.galleryImages ?? [{ id: product.id, bgClass: product.bgClass }]}
                  alt={product.title}
                  className="h-full w-full object-cover"
                  productSlug={product.slug}
                />
              </div>
              <div className="p-3">
                <p className="font-bn-body text-sm text-charcoal line-clamp-2">{product.title}</p>
                <p className="font-bn-heading text-base text-charcoal">{formatBdtPrice(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-cream py-20"
      style={{
        backgroundImage: 'radial-gradient(ellipse at center, rgba(200,155,60,0.06) 0%, transparent 70%)',
      }}
      onMouseMove={onMouseMove}
      aria-label="সবচেয়ে জনপ্রিয় ডিজাইন"
    >
      <div className="mx-auto mb-12 text-center">
        <p className="font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">FAMILY CONSTELLATION</p>
        <h2 className="mt-3 font-bn-heading text-3xl font-bold text-charcoal md:text-4xl">সবচেয়ে জনপ্রিয় ডিজাইন</h2>
      </div>

      <div className="relative mx-auto h-[520px] max-w-6xl md:h-[620px]">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {pairs.map(([a, b]) => {
            const ca = CARD_CONFIGS[a];
            const cb = CARD_CONFIGS[b];
            if (!ca || !cb) return null;
            return (
              <line
                key={`${a}-${b}`}
                x1={`${ca.x + 8}%`}
                y1={`${ca.y + 8}%`}
                x2={`${cb.x + 8}%`}
                y2={`${cb.y + 8}%`}
                stroke="var(--color-mustard)"
                strokeWidth="1"
                className="animate-constellation-line opacity-25"
              />
            );
          })}
        </svg>

        {slots.map(({ cfg, product, key }, i) => {
          if (!product) return null;
          const offset = offsets[i] ?? { x: 0, y: 0 };
          const dimmed = hovered && hovered !== key;
          return (
            <motion.div
              key={key}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute w-[140px] md:w-[160px]"
              style={{
                left: `${cfg.x}%`,
                top: `${cfg.y}%`,
                rotate: `${cfg.rotate}deg`,
              }}
              animate={{
                y: [0, -8, 0],
                x: offset.x,
              }}
              transition={{
                y: { duration: 6, delay: cfg.delay, repeat: Infinity, ease: 'easeInOut' },
                x: { duration: 0.15 },
              }}
            >
              <Link
                href={product.href}
                data-cursor="ring"
                className={cn(
                  'block overflow-hidden rounded-sm bg-white shadow-lg transition-all duration-300 focus-visible:outline-2 focus-visible:outline-mustard',
                  hovered === key && 'scale-105 shadow-2xl',
                  dimmed && 'opacity-70'
                )}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                aria-label={product.title}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <AutoRotateProductImage
                    images={product.galleryImages ?? [{ id: product.id, bgClass: product.bgClass }]}
                    alt={product.title}
                    className="h-full w-full object-cover"
                    productSlug={product.slug}
                  />
                </div>
                <div className="p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:opacity-100">
                  <p className="font-bn-body text-xs text-charcoal line-clamp-1">{product.title}</p>
                  <p className="font-bn-heading text-sm">{formatBdtPrice(product.price)}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
