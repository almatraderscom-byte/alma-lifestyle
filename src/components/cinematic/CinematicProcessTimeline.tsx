'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { OurProcessSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageExtras } from '@/lib/homepage-extras';
import { cn } from '@/lib/utils';

interface CinematicProcessTimelineProps {
  data?: OurProcessSectionData;
}

const STEP_ICONS = [SearchIcon, VerifyIcon, CameraIcon, ListIcon, BoxIcon, MapIcon] as const;
const BN_NUMBERS = ['০১', '০২', '০৩', '০৪', '০৫', '০৬'];

function SearchIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full text-mustard">
      <motion.circle cx="42" cy="42" r="18" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 1 }} />
      <motion.path d="M56 56 L72 72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.5, delay: 0.8 }} />
      <motion.path d="M24 52 H60 M24 42 H52" stroke="currentColor" strokeWidth="1" opacity="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.4 }} />
    </svg>
  );
}

function VerifyIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full text-mustard">
      <motion.rect x="28" y="20" width="44" height="56" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 1 }} />
      <motion.path d="M38 48 L46 56 L62 38" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.8 }} />
    </svg>
  );
}

function CameraIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full text-mustard">
      <motion.rect x="22" y="32" width="56" height="36" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 1 }} />
      <motion.circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.5 }} />
      <motion.path d="M36 32 L42 24 H58 L64 32" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.3 }} />
    </svg>
  );
}

function ListIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full text-mustard">
      <motion.path d="M30 24 H70 M30 44 H70 M30 64 H58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 1 }} />
      <motion.path d="M62 58 L72 68 L62 78" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.5, delay: 0.8 }} />
    </svg>
  );
}

function BoxIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full text-mustard">
      <motion.path d="M20 36 L50 20 L80 36 V68 L50 84 L20 68 Z" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 1.2 }} />
      <motion.path d="M50 20 V52 M20 36 L50 52 L80 36" stroke="currentColor" strokeWidth="1.2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.5 }} />
    </svg>
  );
}

function MapIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full text-mustard">
      <motion.path d="M30 28 Q50 18 70 28 V72 Q50 82 30 72 Z" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 1.1 }} />
      <motion.path d="M38 58 H62 L58 48 H42 Z" stroke="currentColor" strokeWidth="1.2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.7 }} />
      <motion.circle cx="50" cy="62" r="3" stroke="currentColor" strokeWidth="1.2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.4, delay: 1 }} />
    </svg>
  );
}

function TimelineStep({
  step,
  index,
  instant,
  active,
}: {
  step: OurProcessSectionData['steps'][0];
  index: number;
  instant: boolean;
  active: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const draw = instant || inView;
  const Icon = STEP_ICONS[index % STEP_ICONS.length];
  const words = step.description.split(/\s+/);

  return (
    <div
      ref={ref}
      className={cn(
        'relative grid min-h-[280px] grid-cols-1 gap-8 border-l-2 py-8 pl-10 md:grid-cols-2 md:pl-16',
        active ? 'border-mustard' : 'border-charcoal/15'
      )}
    >
      <div>
        <p className="font-bn-heading text-5xl text-mustard/60">{BN_NUMBERS[index] ?? String(index + 1).padStart(2, '0')}</p>
        <h3 className="mt-4 font-bn-heading text-2xl font-semibold text-charcoal">{step.title}</h3>
        <p className="mt-4 font-bn-body text-base leading-relaxed text-charcoal/75">
          {instant || !active
            ? step.description
            : words.map((word, wi) => (
                <motion.span
                  key={wi}
                  className="mr-1 inline-block"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: wi * 0.04, duration: 0.25 }}
                >
                  {word}
                </motion.span>
              ))}
        </p>
      </div>
      <div className="flex items-center justify-center">
        <motion.div
          className="h-24 w-24 md:h-[100px] md:w-[100px]"
          animate={active && !instant ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Icon draw={draw} />
        </motion.div>
      </div>
    </div>
  );
}

export function CinematicProcessTimeline({ data: dataProp }: CinematicProcessTimelineProps) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const data = dataProp ?? getDefaultHomepageExtras().ourProcess;
  const steps = data.steps.slice(0, 6);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    if (reduced) return;
    const unsub = scrollYProgress.on('change', (v) => {
      setActiveStep(Math.min(steps.length - 1, Math.floor(v * steps.length)));
    });
    return () => unsub();
  }, [scrollYProgress, reduced, steps.length]);

  const instant = !!reduced;

  return (
    <section ref={sectionRef} className="relative bg-cream px-6 py-20 lg:px-16" aria-labelledby="process-heading">
      <div className="mx-auto max-w-4xl">
        <p className="font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">{data.label}</p>
        <h2 id="process-heading" className="mt-3 font-bn-heading text-4xl font-bold text-charcoal">
          {data.title}
        </h2>
        {data.subtitle && (
          <p className="mt-3 font-bn-body text-base text-charcoal/70">{data.subtitle}</p>
        )}

        <div className="relative mt-16">
          {!instant && (
            <div className="absolute bottom-0 left-0 top-0 w-px bg-charcoal/10" aria-hidden>
              <motion.div className="w-full bg-mustard" style={{ height: lineHeight }} />
            </div>
          )}
          {steps.map((step, index) => (
            <TimelineStep
              key={step.title + index}
              step={step}
              index={index}
              instant={instant}
              active={instant || activeStep >= index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
