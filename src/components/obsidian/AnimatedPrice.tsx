'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { formatBdtPrice, formatDiscountPercent } from '@/lib/format-bn';

interface AnimatedPriceProps {
  /** Current / offer price (product.price) — always shown. */
  price: number;
  /** Higher regular price (product.compareAtPrice). When it is greater than
   *  `price` the discount choreography runs; otherwise a clean price renders. */
  compareAtPrice?: number | null;
  /** Pre-computed integer discount percent (matches the page's own rounding). */
  discountPercent?: number | null;
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Obsidian PDP price with a choreographed discount reveal (client requirement):
 *   1. The REGULAR price appears prominently.
 *   2. A strike-through line draws left→right across it.
 *   3. The OFFER price zooms/pops in, highlighted, with the discount badge.
 *
 * Formatting is delegated to `formatBdtPrice` / `formatDiscountPercent` so the
 * exact Bengali numerals and copy are preserved. `prefers-reduced-motion` is
 * honoured — everything settles instantly in its final state.
 */
export function AnimatedPrice({ price, compareAtPrice, discountPercent }: AnimatedPriceProps) {
  const reduce = useReducedMotion();
  const hasDiscount = Boolean(compareAtPrice && compareAtPrice > price && discountPercent);

  // Gate the animation until the block is on screen (or immediately when
  // reduced motion is requested), so the reveal lands as the user reaches it.
  const rootRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (reduce || started) {
      if (reduce) setStarted(true);
      return;
    }
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setStarted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [reduce, started]);

  // No discount → render the offer price cleanly, no strike, no choreography.
  if (!hasDiscount) {
    return (
      <div className="ob-pdp-price price" ref={rootRef}>
        <span className="ob-pdp-now">{formatBdtPrice(price)}</span>
      </div>
    );
  }

  // Timeline (seconds): regular fades in → strike draws → offer pops → badge.
  const wasVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 0.55, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
  };
  const strikeVariants: Variants = {
    hidden: { scaleX: 0 },
    show: { scaleX: 1, transition: { duration: 0.42, ease: EASE_OUT, delay: 0.5 } },
  };
  const nowVariants: Variants = {
    hidden: { opacity: 0, scale: 0.6 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 420, damping: 18, delay: 1.0 },
    },
  };
  const badgeVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5, y: 6 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 500, damping: 20, delay: 1.18 },
    },
  };

  const animate = reduce ? 'show' : started ? 'show' : 'hidden';

  return (
    <div className="ob-pdp-price price ob-pdp-price--deal" ref={rootRef}>
      <motion.span
        className="was"
        variants={wasVariants}
        initial={reduce ? 'show' : 'hidden'}
        animate={animate}
        aria-label="আগের দাম"
      >
        {formatBdtPrice(compareAtPrice!)}
        <motion.span
          className="ob-pdp-strike"
          aria-hidden
          variants={strikeVariants}
          initial={reduce ? 'show' : 'hidden'}
          animate={animate}
        />
      </motion.span>

      <motion.span
        className="ob-pdp-now"
        variants={nowVariants}
        initial={reduce ? 'show' : 'hidden'}
        animate={animate}
      >
        {formatBdtPrice(price)}
      </motion.span>

      <AnimatePresence>
        {(reduce || started) && (
          <motion.span
            className="ob-pdp-off"
            variants={badgeVariants}
            initial={reduce ? 'show' : 'hidden'}
            animate="show"
            exit={{ opacity: 0 }}
          >
            {formatDiscountPercent(discountPercent!)}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
