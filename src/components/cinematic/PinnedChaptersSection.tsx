'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  CINEMATIC_CHAPTERS,
  CINEMATIC_GRADIENT_CSS,
  type CinematicGradientToken,
} from '@/lib/cinematic-config';
import { cn } from '@/lib/utils';

function stageGradient(from: CinematicGradientToken, to: CinematicGradientToken) {
  return `linear-gradient(135deg, ${CINEMATIC_GRADIENT_CSS[from]}, ${CINEMATIC_GRADIENT_CSS[to]})`;
}

export function PinnedChaptersSection() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 3.99]);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (isMobile || reduced) return;
    const unsub = progress.on('change', (v) => {
      setActiveStage(Math.min(3, Math.max(0, Math.floor(v))));
    });
    return () => unsub();
  }, [progress, isMobile, reduced]);

  const stages = CINEMATIC_CHAPTERS.stages;
  const instant = !!reduced;

  if (isMobile) {
    return (
      <section className="bg-cream px-6 py-16 md:hidden">
        <p className="mb-10 text-center font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">
          {CINEMATIC_CHAPTERS.sectionNumber}
        </p>
        <div className="space-y-16">
          {stages.map((stage, index) => (
            <article
              key={stage.eyebrow}
              className="rounded-sm border border-border-subtle bg-background p-8"
              style={{
                backgroundImage: stageGradient(
                  stage.gradientFrom as CinematicGradientToken,
                  stage.gradientTo as CinematicGradientToken
                ),
                backgroundBlendMode: 'overlay',
              }}
            >
              <p className="font-bn-body text-[10px] uppercase tracking-[0.35em] text-mustard">
                {stage.eyebrow}
              </p>
              <h2 className="mt-4 font-bn-heading text-xl font-semibold text-charcoal">
                {stage.heading}
              </h2>
              <p className="mt-3 font-bn-body text-sm leading-relaxed text-charcoal/85">
                {stage.body}
              </p>
              {'cta' in stage && stage.cta && (
                <Link
                  href={stage.cta.href}
                  data-cursor="ring"
                  className="mt-6 inline-flex min-h-12 items-center rounded-sm border border-charcoal px-6 font-bn-body text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal hover:text-cream"
                >
                  {stage.cta.label}
                </Link>
              )}
              <p className="mt-6 font-bn-heading text-sm text-cream/90">{stage.imageLabel}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative hidden h-[2400px] bg-cream md:block">
      <div className="sticky top-0 flex h-screen overflow-hidden">
        <div className="relative w-1/2">
          {stages.map((stage, index) => (
            <div
              key={stage.eyebrow}
              className={cn(
                'cinematic-stage-shimmer absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-[800ms] ease-out',
                activeStage === index ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-[1.05]'
              )}
              style={{
                backgroundImage: stageGradient(
                  stage.gradientFrom as CinematicGradientToken,
                  stage.gradientTo as CinematicGradientToken
                ),
                transitionProperty: instant ? 'opacity' : 'opacity, transform',
                transitionDuration: instant ? '0ms' : undefined,
              }}
              aria-hidden={activeStage !== index}
            >
              <span className="font-bn-heading text-lg text-cream">{stage.imageLabel}</span>
            </div>
          ))}
        </div>

        <div className="relative flex w-1/2 flex-col justify-center px-12 lg:px-16">
          <p className="absolute top-10 right-12 font-bn-body text-[10px] uppercase tracking-[0.35em] text-text-light">
            {CINEMATIC_CHAPTERS.sectionNumber} · 0{activeStage + 1}/04
          </p>

          {stages.map((stage, index) => (
            <div
              key={stage.eyebrow}
              className={cn(
                'absolute inset-x-12 lg:inset-x-16 transition-[opacity,transform] duration-700 ease-out',
                activeStage === index
                  ? 'translate-y-0 opacity-100'
                  : 'pointer-events-none translate-y-10 opacity-0'
              )}
              style={{
                transitionDuration: instant ? '0ms' : undefined,
              }}
            >
              <p className="font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">
                {stage.eyebrow}
              </p>
              <h2 className="mt-4 font-bn-heading text-[26px] font-semibold leading-snug text-charcoal">
                {stage.heading}
              </h2>
              <p className="mt-4 max-w-md font-bn-body text-sm leading-relaxed text-text-light">
                {stage.body}
              </p>
              {'cta' in stage && stage.cta && (
                <Link
                  href={stage.cta.href}
                  data-cursor="ring"
                  className="mt-8 inline-flex min-h-12 items-center rounded-sm border-2 border-mustard px-8 font-bn-body text-sm font-semibold text-charcoal transition-colors hover:bg-mustard hover:text-charcoal"
                >
                  {stage.cta.label}
                </Link>
              )}
            </div>
          ))}

          <div className="absolute bottom-12 left-12 flex gap-2 lg:left-16">
            {stages.map((_, index) => (
              <span
                key={index}
                className={cn(
                  'h-0.5 rounded-full bg-charcoal/20 transition-all duration-500',
                  activeStage === index ? 'w-9 bg-mustard' : 'w-6'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
