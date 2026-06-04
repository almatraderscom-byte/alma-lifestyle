'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const QUOTE = 'প্রতিটি সুতোয় — একটি প্রজন্মের গল্প';

export function EditorialQuotePause() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduced = useReducedMotion();
  const instant = !!reduced;

  return (
    <section
      ref={ref}
      className="relative flex min-h-[60vh] items-center justify-center bg-cream px-6 py-20 md:px-12"
      aria-label="Editorial quote"
    >
      <div className="mx-auto max-w-4xl text-center">
        <motion.blockquote
          className="font-bn-heading text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-snug text-charcoal"
          initial={instant ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(12px)' }}
          animate={
            instant || inView
              ? { opacity: 1, filter: 'blur(0px)' }
              : { opacity: 0, filter: 'blur(12px)' }
          }
          transition={{ duration: instant ? 0 : 1.5, ease: 'easeOut' }}
        >
          {QUOTE}
        </motion.blockquote>
        <motion.span
          className="mx-auto mt-8 block h-0.5 origin-left bg-mustard"
          initial={instant ? { scaleX: 1 } : { scaleX: 0 }}
          animate={instant || inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: instant ? 0 : 0.9, delay: instant ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: 'min(280px, 60%)' }}
          aria-hidden
        />
      </div>
    </section>
  );
}
