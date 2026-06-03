'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { CINEMATIC_CLOSING } from '@/lib/cinematic-config';

export function CinematicClosingSection() {
  const reduced = useReducedMotion();
  const lines = CINEMATIC_CLOSING.heading.split('\n');

  return (
    <section className="relative flex h-[500px] items-center justify-center overflow-hidden bg-charcoal px-6">
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(200,155,60,0.18), transparent 60%), radial-gradient(circle at 20% 80%, rgba(45,95,79,0.12), transparent 45%)',
        }}
        animate={reduced ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        aria-hidden
      />

      <motion.div
        className="relative z-10 max-w-lg text-center"
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <p className="font-bn-body text-[10px] uppercase tracking-[0.6em] text-mustard">
          {CINEMATIC_CLOSING.eyebrow}
        </p>
        <h2 className="mt-6 font-bn-heading text-[28px] font-semibold leading-snug text-cream">
          {lines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h2>
        <Link
          href={CINEMATIC_CLOSING.cta.href}
          data-cursor="ring"
          className="mt-10 inline-flex min-h-12 items-center rounded-sm border border-mustard px-10 font-bn-body text-sm font-semibold text-cream transition-colors hover:bg-mustard hover:text-charcoal"
        >
          {CINEMATIC_CLOSING.cta.label}
        </Link>
      </motion.div>
    </section>
  );
}
