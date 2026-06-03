'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MURDA_MOSHARI_PAGE } from '@/lib/content';
import { calmEase } from '@/components/product/murda-moshari/animation-config';

const STORAGE_KEY = 'murda-overlay-seen';

interface CinematicOverlayProps {
  onComplete: () => void;
}

export function CinematicOverlay({ onComplete }: CinematicOverlayProps) {
  const reduced = useReducedMotion();
  const { brand, tagline } = MURDA_MOSHARI_PAGE.overlay;
  const [phase, setPhase] = useState<'brand' | 'tagline' | 'exit'>('brand');
  const letters = tagline.split('');

  useEffect(() => {
    if (reduced) {
      onComplete();
      return;
    }
    const t1 = window.setTimeout(() => setPhase('tagline'), 600);
    const t2 = window.setTimeout(() => setPhase('exit'), 1600);
    const t3 = window.setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, '1');
      onComplete();
    }, 2400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [reduced, onComplete]);

  if (reduced) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream px-6"
      initial={{ opacity: 1 }}
      animate={
        phase === 'exit'
          ? { opacity: 0, y: -24, scale: 0.98 }
          : { opacity: 1, y: 0, scale: 1 }
      }
      transition={{ duration: phase === 'exit' ? 0.8 : 0.5, ease: calmEase }}
      aria-hidden
    >
      <p className="font-brand text-xs tracking-[0.35em] text-mustard uppercase">{brand}</p>
      <p className="font-bn-heading mt-8 text-center text-xl text-charcoal md:text-2xl">
        {letters.map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            className="inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'brand' ? 0 : 1 }}
            transition={{
              duration: 0.35,
              delay: phase === 'tagline' ? i * 0.08 : 0,
              ease: calmEase,
            }}
          >
            {char === ' ' ? '\u00a0' : char}
          </motion.span>
        ))}
      </p>
    </motion.div>
  );
}

export function readMurdaOverlaySeen(): boolean {
  if (typeof window === 'undefined') return true;
  return sessionStorage.getItem(STORAGE_KEY) === '1';
}
