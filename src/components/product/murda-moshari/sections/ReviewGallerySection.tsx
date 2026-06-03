'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMurdaPage } from '@/components/product/murda-moshari/MurdaPageContext';
import { formatBnText } from '@/lib/format-bn';
import {
  calmEase,
  murdaViewport,
  useMurdaMotionTiming,
} from '@/components/product/murda-moshari/animation-config';
import { cn } from '@/lib/utils';

export function ReviewGallerySection() {
  const { reviews } = useMurdaPage();
  const reduced = useReducedMotion();
  const { duration, stagger, transition } = useMurdaMotionTiming();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / (el.offsetWidth * 0.85 + 16));
    setActiveDot(Math.min(reviews.images.length - 1, Math.max(0, idx)));
  }, [reviews.images.length]);

  const Wrapper = reduced ? 'section' : motion.section;

  return (
    <Wrapper className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-bn-heading text-center text-2xl text-charcoal md:text-3xl">
          {reviews.heading}
        </h2>
        <p className="font-bn-body mt-3 text-center text-sm text-charcoal/70 md:text-base">
          {reviews.subheading}
        </p>
        <div className="relative mt-10 md:static">
          <div
            className="pointer-events-none absolute left-0 top-0 z-10 h-full w-6 bg-gradient-to-r from-white to-transparent md:hidden"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-0 top-0 z-10 h-full w-6 bg-gradient-to-l from-white to-transparent md:hidden"
            aria-hidden
          />
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible"
          >
            {reviews.images.map((src, index) => {
              const tilt = index % 2 === 0 ? -2 : 2;
              const Card = reduced ? 'div' : motion.div;
              return (
                <Card
                  key={src}
                  className={cn(
                    'w-[85vw] max-w-full shrink-0 snap-center md:w-auto',
                    !reduced && 'md:hover:shadow-[0_0_32px_rgba(245,235,221,0.9)]'
                  )}
                  {...(!reduced && {
                    initial: { opacity: 0, y: 24, rotate: tilt },
                    whileInView: { opacity: 1, y: 0, rotate: 0 },
                    viewport: murdaViewport,
                    transition: transition({
                      duration: duration(0.6),
                      delay: index * stagger(0.12),
                      ease: calmEase,
                    }),
                    whileHover: { scale: 1.02, rotate: 0 },
                  })}
                >
                  <div className="rounded-2xl bg-white p-2">
                    <div className="relative aspect-square overflow-hidden rounded-xl">
                      <Image
                        src={src}
                        alt={formatBnText(`গ্রাহক রিভিউ ${index + 1}`)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 85vw, 33vw"
                      />
                    </div>
                    <p className="font-bn-body mt-3 flex items-center justify-center gap-1.5 text-sm text-charcoal/70">
                      {!reduced ? (
                        <motion.svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                          <motion.path
                            d="M2 7 L5.5 10.5 L12 3"
                            fill="none"
                            stroke="var(--color-mustard)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={murdaViewport}
                            transition={transition({
                              duration: duration(0.4),
                              delay: duration(0.6) + index * stagger(0.12),
                            })}
                          />
                        </motion.svg>
                      ) : (
                        <span className="text-mustard" aria-hidden>
                          ✓
                        </span>
                      )}
                      {reviews.verifiedLabel}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
          <div className="mt-4 flex justify-center gap-2 md:hidden" aria-hidden>
            {reviews.images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  i === activeDot ? 'bg-mustard' : 'bg-mustard/30'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
