'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CINEMATIC_HERO } from '@/lib/cinematic-config';

const SESSION_KEY = 'cinematic-overlay-seen';

export function CinematicLoadingOverlay() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (reduced) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === '1') return;
    } catch {
      return;
    }
    setDismissed(false);
    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  if (reduced || dismissed) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-charcoal"
      initial={{ opacity: 1, y: 0 }}
      animate={
        visible
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: '-100%' }
      }
      transition={{
        opacity: { duration: 0.5, ease: 'easeInOut' },
        y: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
      }}
      onAnimationComplete={() => {
        if (!visible) setDismissed(true);
      }}
      aria-hidden={!visible}
    >
      <motion.div
        className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-mustard"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.6, 1, 1, 1.4],
        }}
        transition={{ duration: 2.4, times: [0, 0.25, 0.7, 1], ease: 'easeInOut' }}
      >
        <span className="font-brand text-2xl text-mustard">
          {CINEMATIC_HERO.overlayBrandMark}
        </span>
      </motion.div>
      <motion.p
        className="mt-6 font-brand text-sm uppercase tracking-[0.1em] text-cream"
        initial={{ opacity: 0, filter: 'blur(8px)', letterSpacing: '0.5em' }}
        animate={{
          opacity: [0, 1, 1, 0],
          filter: ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(4px)'],
          letterSpacing: ['0.5em', '0.1em', '0.1em', '0.3em'],
        }}
        transition={{ duration: 2.4, times: [0, 0.35, 0.75, 1], ease: 'easeOut' }}
      >
        {CINEMATIC_HERO.overlayTagline}
      </motion.p>
    </motion.div>
  );
}
