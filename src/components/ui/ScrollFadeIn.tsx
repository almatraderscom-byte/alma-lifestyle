'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EASE_PREMIUM, scrollViewport } from '@/lib/animation-variants';

interface ScrollFadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollFadeIn({ children, className, delay = 0 }: ScrollFadeInProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={scrollViewport}
      transition={{ duration: 0.6, delay, ease: EASE_PREMIUM }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
