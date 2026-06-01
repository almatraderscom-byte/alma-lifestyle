'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { resolveProductImageUrl } from '@/lib/default-images';
import { cn } from '@/lib/utils';
import type { StorefrontGalleryImage } from '@/lib/product-gallery';

export type { StorefrontGalleryImage as GalleryImage };

interface ProductGalleryProps {
  images: StorefrontGalleryImage[];
  title: string;
  aspectRatio?: '3/4' | '1/1';
  /** Design group name overlay on family hero */
  designGroupName?: string;
  /** Reset autoplay when tab/member changes */
  resetKey?: string;
  productSlug?: string;
  categorySlug?: string;
}

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export function ProductGallery({
  images,
  title,
  aspectRatio = '3/4',
  designGroupName,
  resetKey,
  productSlug,
  categorySlug,
}: ProductGalleryProps) {
  const displayImages: StorefrontGalleryImage[] =
    images.length > 0
      ? images.map((img) => ({
          ...img,
          url: productSlug
            ? resolveProductImageUrl(img.url, productSlug, categorySlug)
            : img.url,
        }))
      : productSlug
        ? [
            {
              id: 'default',
              bgClass: 'bg-cream',
              url: resolveProductImageUrl(undefined, productSlug, categorySlug),
            },
          ]
        : [{ id: 'placeholder', bgClass: 'bg-secondary' }];

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = displayImages[activeIndex] ?? displayImages[0];
  const hasMultiple = displayImages.length > 1;
  const showFamilyOverlay = Boolean(active?.isFamilyGroup && designGroupName);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [resetKey]);

  const scheduleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!hasMultiple || paused || reducedMotion) return;

    const duration = displayImages[activeIndex]?.durationMs ?? 4000;
    timerRef.current = setTimeout(() => {
      setActiveIndex((i) => (i + 1) % displayImages.length);
    }, duration);
  }, [activeIndex, displayImages, hasMultiple, paused, reducedMotion]);

  useEffect(() => {
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleNext]);

  function goTo(index: number) {
    setActiveIndex(index);
    scheduleNext();
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -50) {
      goTo((activeIndex + 1) % displayImages.length);
    } else if (info.offset.x > 50) {
      goTo((activeIndex - 1 + displayImages.length) % displayImages.length);
    }
  }

  const aspectClass = aspectRatio === '3/4' ? 'aspect-[3/4]' : 'aspect-square';

  return (
    <div className="space-y-3">
      <motion.div
        className={cn('relative overflow-hidden rounded-xl bg-secondary', aspectClass)}
        drag={hasMultiple ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${resetKey ?? ''}-${active.id}-${activeIndex}`}
            className="absolute inset-0"
            initial={reducedMotion ? false : { opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 0.6, ease: EASE }
            }
          >
            {active.url ? (
              <Image
                src={active.url}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={activeIndex === 0}
                loading={activeIndex === 0 ? 'eager' : 'lazy'}
              />
            ) : null}

            {showFamilyOverlay && (
              <div
                className="absolute inset-x-0 bottom-0 pt-16 pb-4 px-4 bg-gradient-to-t from-charcoal/80 to-transparent pointer-events-none"
                aria-hidden
              >
                <p className="font-bn-heading text-lg md:text-xl text-cream leading-snug">
                  {designGroupName}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {hasMultiple && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
            {displayImages.map((img, index) => (
              <button
                key={img.id}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all border',
                  index === activeIndex
                    ? 'bg-terracotta border-terracotta scale-110'
                    : 'bg-cream/40 border-cream/80 hover:border-terracotta'
                )}
                aria-label={`ছবি ${index + 1}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
