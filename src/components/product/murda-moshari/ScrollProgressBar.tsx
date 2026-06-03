'use client';

import { useEffect, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { toBanglaNumber } from '@/lib/format-bn';

export function ScrollProgressBar() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const percentRaw = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const [percentBn, setPercentBn] = useState('০');
  const [showLabel, setShowLabel] = useState(false);

  useMotionValueEvent(percentRaw, 'change', (v) => {
    setPercentBn(toBanglaNumber(Math.round(v)));
    setShowLabel(v >= 30 && v <= 95);
  });

  useEffect(() => {
    if (reduced) setShowLabel(false);
  }, [reduced]);

  if (reduced) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[60] h-0.5 origin-left bg-emerald"
        style={{ width }}
        aria-hidden
      />
      <motion.span
        className="pointer-events-none fixed right-4 top-2 z-[60] font-bn-body text-xs text-mustard/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: showLabel ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        aria-hidden
      >
        {percentBn}% পঠিত
      </motion.span>
    </>
  );
}
