'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(false);

  const searchKey = searchParams.toString();

  useEffect(() => {
    if (reduceMotion) return;
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, [pathname, searchKey, reduceMotion]);

  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9998] h-[3px] pointer-events-none overflow-hidden"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            transformOrigin: '0% 50%',
            background:
              'linear-gradient(90deg, #7c5cff 0%, #9a7dff 35%, #b25cff 60%, #d8a94e 100%)',
            boxShadow:
              '0 0 12px rgba(124,92,255,0.75), 0 0 26px rgba(178,92,255,0.45)',
          }}
          aria-hidden
        >
          {/* Sweeping specular highlight — reads as a fast comet crossing the bar. */}
          <motion.span
            className="absolute inset-y-0 w-1/3"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
              filter: 'blur(1px)',
            }}
            initial={{ x: '-120%' }}
            animate={{ x: '360%' }}
            transition={{ duration: 0.9, ease: 'easeInOut', repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
