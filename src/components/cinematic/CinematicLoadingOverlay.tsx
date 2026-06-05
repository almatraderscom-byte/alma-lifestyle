'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CINEMATIC_HERO } from '@/lib/cinematic-config';
import { isCinematicPreviewMode, isEmbedPreviewMode } from '@/lib/homepage-config';

const SESSION_KEY = 'cinematic-overlay-seen';
const OVERLAY_DURATION_MS = 900;

export function CinematicLoadingOverlay() {
  if (isCinematicPreviewMode() || isEmbedPreviewMode()) return null;

  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (reduced || dismissed) return;
    const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
    const conn = nav.connection?.effectiveType;
    if (conn === '2g' || conn === 'slow-2g') return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === '1') return;
    } catch {
      return;
    }

    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      setDismissed(true);
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
    }, OVERLAY_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [reduced, dismissed]);

  if (reduced || dismissed || !visible) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center bg-charcoal"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      role="status"
      aria-live="polite"
      aria-label="Loading Alma Lifestyle"
    >
      <motion.div
        className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-mustard"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <span className="font-brand text-2xl text-mustard">
          {CINEMATIC_HERO.overlayBrandMark}
        </span>
      </motion.div>
      <motion.p
        className="mt-6 font-brand text-sm uppercase tracking-[0.1em] text-cream"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        {CINEMATIC_HERO.overlayTagline}
      </motion.p>
    </motion.div>
  );
}
