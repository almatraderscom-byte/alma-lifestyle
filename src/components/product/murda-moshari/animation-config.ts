'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion, type Transition } from 'framer-motion';

/** Calm ease-out — meditative, no bounce */
export const calmEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const murdaViewport = { once: true as const, amount: 0.2 as const };

/** Above-the-fold hero — fire on mount (whileInView can miss first paint). */
export const heroViewport = { once: true as const, amount: 0 as const };

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: calmEase } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.9, ease: calmEase } },
};

export const staggerContainer = (delay = 0.08) => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay, delayChildren: 0.1 } },
});

export function useMurdaReducedMotion() {
  return useReducedMotion() ?? false;
}

/** Shorter durations and stagger on mobile (<768px). */
export function useMurdaMotionTiming() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return {
    isMobile,
    duration(scale: number) {
      return isMobile ? Math.max(0.25, scale - 0.2) : scale;
    },
    stagger(scale: number) {
      return isMobile ? scale * 0.5 : scale;
    },
    transition(extra?: Partial<Transition>): Transition {
      return { ease: calmEase, ...extra };
    },
  };
}

export const patternDiamondStyle = {
  backgroundImage: 'var(--pattern-diamond)',
  backgroundSize: '48px 48px',
} as const;

/** 8-point star tile for donation band */
export const starPatternSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath fill='%23f5ebdd' d='M30 2 L36 24 L58 30 L36 36 L30 58 L24 36 L2 30 L24 24 Z'/%3E%3C/svg%3E")`;
