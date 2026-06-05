'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CINEMATIC_HERO } from '@/lib/cinematic-config';
import { CINEMATIC_HOME_NAV_START } from '@/lib/cinematic-navigation';
import { isEmbedPreviewMode } from '@/lib/homepage-config';

const DISMISS_DELAY_MS = 300;
const MAX_VISIBLE_MS = 3500;

/** Non-blocking top banner — feedback without covering the whole page. */
export function HomeNavigationOverlay() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isEmbedPreviewMode()) return;

    const onStart = () => setVisible(true);
    window.addEventListener(CINEMATIC_HOME_NAV_START, onStart);
    return () => window.removeEventListener(CINEMATIC_HOME_NAV_START, onStart);
  }, []);

  useEffect(() => {
    if (!visible) return;

    if (pathname === '/') {
      const timer = window.setTimeout(() => setVisible(false), DISMISS_DELAY_MS);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => setVisible(false), MAX_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [pathname, visible]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-0 z-[9999] overflow-hidden border-b border-mustard/30 bg-charcoal/95 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm"
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
          aria-label="Returning to ALMA homepage"
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-center gap-4 px-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-mustard font-brand text-lg text-mustard">
              {CINEMATIC_HERO.overlayBrandMark}
            </span>
            <div className="text-left">
              <p className="font-brand text-xs uppercase tracking-[0.28em] text-cream">
                {CINEMATIC_HERO.overlayTagline}
              </p>
              <p className="font-bn-body text-[11px] text-cream/60">Loading homepage…</p>
            </div>
          </div>
          <motion.div className="h-[2px] w-full bg-charcoal" aria-hidden>
            <motion.div
              className="h-full w-1/3 rounded-r-full"
              style={{
                background:
                  'linear-gradient(90deg, var(--color-mustard), var(--color-terracotta), var(--color-mustard))',
              }}
              initial={{ x: '-100%' }}
              animate={{ x: '400%' }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
