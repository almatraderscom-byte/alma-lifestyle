'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ProductCardGalleryImage = {
  id: string;
  bgClass: string;
  url?: string;
};

export interface AutoRotateProductImageProps {
  images: ProductCardGalleryImage[];
  alt: string;
  className?: string;
  rotationInterval?: number;
  staggerOffset?: number;
  priority?: boolean;
}

function GalleryImageLayer({
  image,
  alt,
  priority,
}: {
  image: ProductCardGalleryImage;
  alt: string;
  priority?: boolean;
}) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [image.id, image.url]);

  if (!image.url || broken) {
    return <div className={cn('absolute inset-0', image.bgClass)} aria-hidden />;
  }

  return (
    <Image
      src={image.url}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 50vw, 25vw"
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => setBroken(true)}
    />
  );
}

export function AutoRotateProductImage({
  images,
  alt,
  className = '',
  rotationInterval = 3000,
  staggerOffset = 0,
  priority = false,
}: AutoRotateProductImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(containerRef, {
    margin: '-50px',
    amount: 0.3,
  });

  const validImages = images?.filter(Boolean) ?? [];
  const hasMultiple = validImages.length > 1;
  const hasRealUrls = validImages.some((g) => g.url);

  useEffect(() => {
    setCurrentIndex((i) => (i >= validImages.length ? 0 : i));
  }, [validImages.length]);

  useEffect(() => {
    if (!isInView || isPaused || !hasMultiple || reduceMotion) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;
    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % validImages.length);
      }, rotationInterval);
    }, staggerOffset);

    return () => {
      clearTimeout(startTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    isInView,
    isPaused,
    hasMultiple,
    validImages.length,
    rotationInterval,
    staggerOffset,
    reduceMotion,
  ]);

  useEffect(() => {
    if (!hasMultiple) return;
    const nextIdx = (currentIndex + 1) % validImages.length;
    const nextUrl = validImages[nextIdx]?.url;
    if (!nextUrl) return;
    const img = new window.Image();
    img.src = nextUrl;
  }, [currentIndex, hasMultiple, validImages]);

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  function pauseBriefly(ms: number) {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      pauseTimeoutRef.current = null;
    }, ms);
  }

  function goToIndex(idx: number) {
    setCurrentIndex(idx);
    pauseBriefly(5000);
  }

  function handleSwipe(_: unknown, info: { offset: { x: number } }) {
    if (!hasMultiple || reduceMotion) return;
    if (info.offset.x < -50) {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
      pauseBriefly(2000);
    } else if (info.offset.x > 50) {
      setCurrentIndex(
        (prev) => (prev - 1 + validImages.length) % validImages.length
      );
      pauseBriefly(2000);
    }
  }

  if (validImages.length === 0) {
    return (
      <div ref={containerRef} className={cn('bg-gray-200', className)}>
        <div className="flex h-full w-full items-center justify-center text-gray-400">
          No image
        </div>
      </div>
    );
  }

  const active = validImages[currentIndex] ?? validImages[0];

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => pauseBriefly(2000)}
    >
      <motion.div
        className="absolute inset-0"
        drag={hasMultiple && !reduceMotion ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={handleSwipe}
      >
        {reduceMotion || !hasMultiple ? (
          <GalleryImageLayer
            image={active}
            alt={alt}
            priority={priority && currentIndex === 0}
          />
        ) : (
          <AnimatePresence mode="sync">
            <motion.div
              key={active.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              <GalleryImageLayer
                image={active}
                alt={`${alt} - image ${currentIndex + 1}`}
                priority={priority && currentIndex === 0}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {hasMultiple && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {validImages.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToIndex(idx);
              }}
              className={cn(
                'rounded-full transition-all duration-300',
                hasRealUrls
                  ? idx === currentIndex
                    ? 'h-1.5 w-6 bg-white'
                    : 'h-1.5 w-1.5 bg-white/60'
                  : idx === currentIndex
                    ? 'h-1.5 w-6 border border-terracotta bg-terracotta'
                    : 'h-1.5 w-1.5 border border-cream/80 bg-cream/40'
              )}
              style={
                hasRealUrls
                  ? { boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }
                  : undefined
              }
              aria-label={`ছবি ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {hasMultiple && hasRealUrls && (
        <div className="absolute top-3 right-3 z-10 rounded-full bg-black/50 px-2 py-1 text-xs text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          {currentIndex + 1}/{validImages.length}
        </div>
      )}
    </div>
  );
}
