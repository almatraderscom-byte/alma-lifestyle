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
          className="fixed top-0 left-0 right-0 z-[9998] h-0.5 bg-terracotta pointer-events-none"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          style={{ transformOrigin: '0% 50%' }}
          aria-hidden
        />
      )}
    </AnimatePresence>
  );
}
