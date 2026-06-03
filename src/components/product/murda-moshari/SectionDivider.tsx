'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { calmEase, murdaViewport } from '@/components/product/murda-moshari/animation-config';

export function SectionDivider() {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div className="flex justify-center py-6" aria-hidden>
        <div className="h-px w-32 max-w-[8rem] bg-mustard/60" />
      </div>
    );
  }

  return (
    <div className="flex justify-center py-6" aria-hidden>
      <motion.div
        className="h-px w-32 max-w-[8rem] bg-mustard"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={murdaViewport}
        transition={{ duration: 0.7, ease: calmEase }}
        style={{ transformOrigin: 'center' }}
      />
    </div>
  );
}
