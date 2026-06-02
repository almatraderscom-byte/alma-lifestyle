'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ProductCard } from '@/components/product/ProductCard';
import type { FeaturedProduct } from '@/lib/content';
import { formatBnText } from '@/lib/format-bn';
import { cn } from '@/lib/utils';
import type { FeaturedSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';
import { EASE_PREMIUM, cardRevealViewport } from '@/lib/animation-variants';

const AUTO_INTERVAL_MS = 4000;
const PAUSE_AFTER_TOUCH_MS = 5000;
const MOBILE_MEDIA = '(max-width: 767px)';

interface FeaturedProductsSectionProps {
  data?: FeaturedSectionData;
  products?: FeaturedProduct[];
}

export function FeaturedProductsSection({
  data: dataProp,
  products: productsProp,
}: FeaturedProductsSectionProps) {
  const reduceMotion = useReducedMotion();
  const { ref, isInView } = useScrollAnimation();
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'featured')!.data;
  const products = productsProp ?? [];
  const displayProducts = products.slice(0, Math.min(products.length, 4));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPauseTimer = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  const scheduleResume = useCallback(() => {
    clearPauseTimer();
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
      pauseTimerRef.current = null;
    }, PAUSE_AFTER_TOUCH_MS);
  }, [clearPauseTimer]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MEDIA);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const onVisibility = () => setIsTabHidden(document.hidden);
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    setCurrentIndex((i) =>
      displayProducts.length === 0 ? 0 : i % displayProducts.length
    );
  }, [displayProducts.length]);

  useEffect(() => {
    if (
      !isMobile ||
      isPaused ||
      isTabHidden ||
      reduceMotion ||
      displayProducts.length <= 1
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
    }, AUTO_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [
    isMobile,
    isPaused,
    isTabHidden,
    reduceMotion,
    displayProducts.length,
  ]);

  useEffect(() => () => clearPauseTimer(), [clearPauseTimer]);

  const handleTouchStart = () => {
    setIsPaused(true);
    clearPauseTimer();
  };

  const handleTouchEnd = () => {
    scheduleResume();
  };

  const handleDotClick = (idx: number) => {
    setCurrentIndex(idx);
    setIsPaused(true);
    scheduleResume();
  };

  const currentProduct = displayProducts[currentIndex];

  return (
    <section ref={ref} className="section-padding bg-background">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: EASE_PREMIUM }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 md:mb-12">
            <div>
              <p className="editorial-label text-terracotta mb-3">
                {formatBnText(data.label)}
              </p>
              <motion.h2
                className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-charcoal"
                initial={reduceMotion ? false : { opacity: 0, y: 30 }}
                animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.6, delay: 0.15, ease: EASE_PREMIUM }}
              >
                {data.title}
              </motion.h2>
            </div>
            <Link
              href={data.viewAllHref}
              className="link-underline font-bn-body text-base font-semibold text-charcoal shrink-0"
            >
              {data.viewAllText}
            </Link>
          </div>
        </motion.div>

        {/* Desktop: 4-column grid */}
        <div className="hidden md:grid md:grid-cols-4 md:items-end gap-5">
          {displayProducts.map((product, i) => (
            <motion.div
              key={product.id}
              className={cn(
                product.layout === 'tall' && 'border-t-4 border-terracotta'
              )}
              initial={reduceMotion ? false : { opacity: 0, y: 40 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={cardRevealViewport}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_PREMIUM }}
            >
              <ProductCard
                product={product}
                layout={product.layout ?? 'normal'}
                editorial
                index={i}
              />
            </motion.div>
          ))}
        </div>

        {/* Mobile: auto-rotating carousel */}
        {displayProducts.length > 0 && (
          <div
            className="md:hidden"
            role="region"
            aria-label="Featured products carousel"
            aria-live="polite"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative overflow-hidden rounded-lg">
              <AnimatePresence mode="wait" initial={false}>
                {currentProduct && (
                  <motion.div
                    key={currentProduct.id}
                    initial={
                      reduceMotion ? false : { x: 48, opacity: 0 }
                    }
                    animate={{ x: 0, opacity: 1 }}
                    exit={reduceMotion ? undefined : { x: -48, opacity: 0 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.5,
                      ease: EASE_PREMIUM,
                    }}
                    className={cn(
                      currentProduct.layout === 'tall' &&
                        'border-t-4 border-terracotta'
                    )}
                  >
                    <ProductCard
                      product={currentProduct}
                      layout={currentProduct.layout ?? 'normal'}
                      editorial
                      index={currentIndex}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {displayProducts.length > 1 && (
              <>
                <div className="flex justify-center gap-2 mt-5">
                  {displayProducts.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDotClick(idx)}
                      className={cn(
                        'rounded-full transition-all duration-300',
                        idx === currentIndex
                          ? 'w-8 h-2 bg-terracotta'
                          : 'w-2 h-2 bg-gray-300'
                      )}
                      aria-label={`Show product ${idx + 1} of ${displayProducts.length}`}
                      aria-current={idx === currentIndex ? 'true' : undefined}
                    />
                  ))}
                </div>
                <p className="text-center mt-2 text-xs text-muted-foreground font-bn-body">
                  {currentIndex + 1} / {displayProducts.length}
                  {!reduceMotion && isMobile && !isPaused && ' · Auto-rotating'}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
