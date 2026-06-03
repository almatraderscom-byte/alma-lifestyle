'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { CINEMATIC_HERO } from '@/lib/cinematic-config';
import { useCinematicCapabilities } from '@/hooks/useCinematicCapabilities';
import { cn } from '@/lib/utils';

const PARALLAX_DEPTHS = [0.5, 1.5, 3, 5] as const;

function AlmaInkWord({ instant }: { instant: boolean }) {
  return (
    <svg
      viewBox="0 0 200 48"
      className="mx-auto h-12 w-auto max-w-[min(280px,80vw)] md:h-14"
      aria-label={CINEMATIC_HERO.brandName}
      role="img"
    >
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-none stroke-cream font-brand text-[42px] font-semibold tracking-[0.2em]"
        style={{
          strokeWidth: 1.2,
          strokeDasharray: 420,
          strokeDashoffset: instant ? 0 : 420,
          animation: instant ? undefined : 'cinematic-ink-draw 3.5s ease-in-out 3.8s forwards',
        }}
      >
        {CINEMATIC_HERO.brandName}
      </text>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-cream font-brand text-[42px] font-semibold tracking-[0.2em] opacity-0"
        style={{
          animation: instant ? undefined : 'cinematic-ink-fill 0.6s ease-out 7s forwards',
        }}
      >
        {CINEMATIC_HERO.brandName}
      </text>
    </svg>
  );
}

export function CinematicHero() {
  const reduced = useReducedMotion();
  const { useVideo, isMobile, isReady } = useCinematicCapabilities();
  const containerRef = useRef<HTMLElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const instant = !!reduced;
  const letterboxH = isMobile ? 24 : 40;

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reduced || isMobile) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const localX = (e.clientX - rect.left) / rect.width - 0.5;
      const localY = (e.clientY - rect.top) / rect.height - 0.5;
      setParallax({ x: localX, y: localY });
    },
    [reduced, isMobile]
  );

  return (
    <section
      ref={containerRef}
      className="relative h-screen min-h-[700px] max-h-[900px] overflow-hidden bg-charcoal"
      onMouseMove={onMouseMove}
      data-cursor="ring"
    >
      <div className="absolute inset-0">
        {isReady && useVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={CINEMATIC_HERO.videoSrc}
            poster={CINEMATIC_HERO.posterSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden
          />
        ) : (
          <Image
            src={CINEMATIC_HERO.posterSrc}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.7) 100%)',
        }}
        aria-hidden
      />

      {!reduced &&
        !isMobile &&
        PARALLAX_DEPTHS.map((depth, i) => (
          <div
            key={depth}
            className="pointer-events-none absolute inset-0 z-[2] opacity-[0.08]"
            data-depth={depth}
            style={{
              background:
                i % 2 === 0
                  ? 'radial-gradient(circle at 30% 40%, var(--color-mustard), transparent 55%)'
                  : 'radial-gradient(circle at 70% 60%, var(--color-terracotta), transparent 50%)',
              transform: `translate(${-parallax.x * depth * 6}px, ${-parallax.y * depth * 4}px)`,
              transition: 'transform 0.15s ease-out',
            }}
            aria-hidden
          />
        ))}

      <motion.div
        className="absolute top-0 left-0 right-0 z-20 bg-charcoal"
        style={{ height: letterboxH }}
        initial={instant ? { y: 0 } : { y: '-100%' }}
        animate={{ y: 0 }}
        transition={{ delay: instant ? 0 : 2.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-20 bg-charcoal"
        style={{ height: letterboxH }}
        initial={instant ? { y: 0 } : { y: '100%' }}
        animate={{ y: 0 }}
        transition={{ delay: instant ? 0 : 2.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col justify-between px-6 py-10 md:px-12">
        <div className="flex items-center gap-2">
          <motion.span
            className="h-2 w-2 rounded-full bg-mustard"
            animate={instant ? undefined : { opacity: [1, 0.35, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="font-bn-body text-[10px] uppercase tracking-[0.25em] text-cream/80"
            initial={instant ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: instant ? 0 : 3.2, duration: 0.6 }}
          >
            AI VIDEO · CINEMATIC MODE
          </motion.span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <motion.p
            className="mb-4 font-bn-body text-[10px] uppercase tracking-[0.35em] text-mustard md:text-xs"
            initial={instant ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: instant ? 0 : 4.2, duration: 0.8 }}
          >
            {CINEMATIC_HERO.eyebrow}
          </motion.p>

          {instant ? (
            <h1 className="font-brand text-4xl tracking-[0.2em] text-cream md:text-5xl">
              {CINEMATIC_HERO.brandName}
            </h1>
          ) : (
            <AlmaInkWord instant={false} />
          )}

          <motion.p
            className={cn(
              'mt-6 max-w-md font-bn-heading text-lg leading-relaxed text-cream/90 md:text-xl',
              isMobile && 'text-base'
            )}
            initial={instant ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: instant ? 0 : 7.4, duration: 0.9 }}
          >
            {CINEMATIC_HERO.subheading}
          </motion.p>
        </div>

        <motion.div
          className="flex items-end justify-between font-bn-body text-[10px] uppercase tracking-[0.3em] text-cream/60"
          initial={instant ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: instant ? 0 : 8.2, duration: 0.7 }}
        >
          <span>{CINEMATIC_HERO.metaLeft}</span>
          <span>{CINEMATIC_HERO.metaRight}</span>
        </motion.div>
      </div>
    </section>
  );
}
