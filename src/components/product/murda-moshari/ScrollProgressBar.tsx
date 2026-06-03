'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

export function ScrollProgressBar() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  if (reduced) return null;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[60] h-0.5 origin-left bg-emerald"
      style={{ width }}
      aria-hidden
    />
  );
}
