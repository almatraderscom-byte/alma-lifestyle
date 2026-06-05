'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CINEMATIC_HERO } from '@/lib/cinematic-config';
import { CINEMATIC_HOME_NAV_START } from '@/lib/cinematic-navigation';
import { isEmbedPreviewMode } from '@/lib/homepage-config';

const DISMISS_DELAY_MS = 450;
const MAX_VISIBLE_MS = 8000;

export function HomeNavigationOverlay() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (isEmbedPreviewMode()) return;

    const onStart = () => {
      setPending(true);
      setVisible(true);
    };

    window.addEventListener(CINEMATIC_HOME_NAV_START, onStart);
    return () => window.removeEventListener(CINEMATIC_HOME_NAV_START, onStart);
  }, []);

  useEffect(() => {
    if (!pending || pathname !== '/') return;

    const timer = window.setTimeout(() => {
      setVisible(false);
      setPending(false);
    }, DISMISS_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [pathname, pending]);

  useEffect(() => {
    if (!visible) return;

    const timer = window.setTimeout(() => {
      setVisible(false);
      setPending(false);
    }, MAX_VISIBLE_MS);

    return () => window.clearTimeout(timer);
  }, [visible]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-charcoal/96 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          role="status"
          aria-live="polite"
          aria-label="Returning to ALMA homepage"
        >
          <motion.div
            className="flex h-[64px] w-[64px] items-center justify-center rounded-full border border-mustard"
            initial={{ opacity: 0, scale: 0.72 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-brand text-2xl text-mustard">
              {CINEMATIC_HERO.overlayBrandMark}
            </span>
          </motion.div>

          <motion.p
            className="mt-5 font-brand text-sm uppercase tracking-[0.28em] text-cream"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            {CINEMATIC_HERO.overlayTagline}
          </motion.p>

          <motion.p
            className="mt-2 font-bn-body text-xs uppercase tracking-[0.35em] text-cream/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.16 }}
          >
            Returning home
          </motion.p>

          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[3px] overflow-hidden bg-charcoal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            aria-hidden
          >
            <motion.div
              className="h-full w-1/3 rounded-r-full"
              style={{
                background:
                  'linear-gradient(90deg, var(--color-mustard), var(--color-terracotta), var(--color-mustard))',
                boxShadow: '0 0 14px rgba(200, 155, 60, 0.55)',
              }}
              initial={{ x: '-100%' }}
              animate={{ x: '400%' }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
