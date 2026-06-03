'use client';

import { useMemo, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { MURDA_MOSHARI_PAGE } from '@/lib/content';
import { patternDiamondStyle } from '@/components/product/murda-moshari/animation-config';

function NarrativeScene({
  text,
  index,
  total,
  scrollYProgress,
}: {
  text: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Each scene gets a clean slot with NO overlap with neighbors.
  // Per scene: fade-in (4%) → hold (rest) → fade-out (4%).
  // First scene starts at full opacity; last scene ends at full opacity.
  // Handoff between scenes is sequential: scene N fully fades out
  // BEFORE scene N+1 starts fading in — eliminating the overlap bug.
  const segment = 1 / total;
  const fade = 0.04;

  const segStart = index * segment;
  const segEnd = (index + 1) * segment;
  const fadeInEnd = segStart + fade;
  const fadeOutStart = segEnd - fade;

  const isFirst = index === 0;
  const isLast = index === total - 1;

  // Slight vertical drift adds gentle motion so a slow scroll feels alive
  // even during the brief blank moment between scenes.
  const y = useTransform(
    scrollYProgress,
    [segStart, fadeInEnd, fadeOutStart, segEnd],
    [16, 0, 0, -16]
  );

  const opacity = useTransform(
    scrollYProgress,
    [
      isFirst ? 0 : segStart,
      fadeInEnd,
      fadeOutStart,
      isLast ? 1 : segEnd,
    ],
    [
      isFirst ? 1 : 0,
      1,
      1,
      isLast ? 1 : 0,
    ]
  );

  return (
    <motion.p
      style={{ opacity, y }}
      className="absolute inset-x-0 top-1/2 mx-auto max-w-3xl -translate-y-1/2 px-6 text-center font-bn-heading text-2xl leading-relaxed text-charcoal md:text-4xl"
    >
      {text}
    </motion.p>
  );
}

export function NarrativeStickySection() {
  const { narrative } = MURDA_MOSHARI_PAGE;
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const desktopScenes = narrative.scenes;
  const mobileScenes = useMemo(
    () => [
      narrative.scenes[0],
      `${narrative.scenes[1]} ${narrative.scenes[2]}`,
      narrative.scenes[3],
    ],
    [narrative.scenes]
  );

  if (reduced) {
    return (
      <section className="bg-cream/95 px-4 py-14 md:py-20">
        <p className="font-bn-body text-center text-xs uppercase tracking-wider text-mustard">
          {narrative.eyebrow}
        </p>
        <div className="mx-auto mt-8 max-w-3xl space-y-8">
          {narrative.scenes.map((scene) => (
            <p
              key={scene}
              className="font-bn-heading text-center text-xl leading-relaxed text-charcoal md:text-2xl"
            >
              {scene}
            </p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="relative h-[200vh] md:h-[300vh]"
      aria-label={narrative.eyebrow}
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden bg-cream">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]"
          aria-hidden
        >
          <motion.div
            className="h-[120%] w-[120%]"
            style={patternDiamondStyle}
            animate={{ rotate: 360 }}
            transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <p className="relative z-10 px-4 font-bn-body text-xs uppercase tracking-wider text-mustard">
          {narrative.eyebrow}
        </p>
        <div className="relative z-10 mt-6 h-[45vh] w-full max-w-4xl md:mt-8 md:h-[40vh]">
          <div className="md:hidden">
            {mobileScenes.map((scene, i) => (
              <NarrativeScene
                key={`m-${i}`}
                text={scene}
                index={i}
                total={mobileScenes.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
          <div className="hidden md:block">
            {desktopScenes.map((scene, i) => (
              <NarrativeScene
                key={scene}
                text={scene}
                index={i}
                total={desktopScenes.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
