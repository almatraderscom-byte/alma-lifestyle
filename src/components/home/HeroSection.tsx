'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HERO } from '@/lib/content';
import { cn } from '@/lib/utils';

export function HeroSection() {
  return (
    <section
      className={cn(
        'relative flex flex-col items-center justify-center text-center',
        'min-h-[100dvh] md:min-h-[80vh] px-4 py-16',
        'bg-gradient-to-b from-secondary via-warm-white to-primary/90'
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-secondary/30 pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="font-bn-heading text-[1.75rem] sm:text-4xl md:text-5xl font-bold text-primary leading-relaxed">
          {HERO.title}
        </h1>
        <p className="font-bn-body text-base sm:text-lg text-text-light mt-4 md:mt-6 max-w-lg mx-auto leading-relaxed">
          {HERO.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 md:mt-10">
          <Link
            href={HERO.shopHref}
            className={cn(
              'inline-flex items-center justify-center',
              'min-h-12 w-full sm:w-[180px] px-6 rounded-lg',
              'bg-accent text-white font-bn-body text-base font-semibold',
              'hover:bg-[#7a6549] transition-colors shadow-md'
            )}
          >
            {HERO.ctaShop}
          </Link>
          <Link
            href={HERO.newHref}
            className={cn(
              'inline-flex items-center justify-center',
              'min-h-12 w-full sm:w-[180px] px-6 rounded-lg',
              'border-2 border-primary bg-transparent text-primary',
              'font-bn-body text-base font-semibold',
              'hover:bg-primary hover:text-secondary transition-colors'
            )}
          >
            {HERO.ctaNew}
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary/60"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        aria-hidden
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </section>
  );
}
