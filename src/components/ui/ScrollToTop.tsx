'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const SHOW_AFTER_PX = 600;

export function ScrollToTop() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  return (
    <motion.button
      type="button"
      onClick={scrollToTop}
      aria-label="উপরে যান"
      className={cn(
        'fixed bottom-6 left-6 md:bottom-8 md:left-8 z-40',
        'flex h-10 w-10 items-center justify-center rounded-full',
        'bg-terracotta text-white shadow-lg',
        'hover:bg-[#b06d4f] transition-colors'
      )}
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.9,
        pointerEvents: visible ? 'auto' : 'none',
      }}
      transition={{ duration: reduceMotion ? 0 : 0.3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
    >
      <span className="text-lg leading-none" aria-hidden>
        ↑
      </span>
    </motion.button>
  );
}
