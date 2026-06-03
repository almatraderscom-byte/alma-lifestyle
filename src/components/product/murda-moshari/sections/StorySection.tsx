'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MURDA_MOSHARI_PAGE } from '@/lib/content';
import {
  calmEase,
  murdaViewport,
  useMurdaMotionTiming,
} from '@/components/product/murda-moshari/animation-config';

function splitSentences(text: string): string[] {
  return text.split(/(?<=[।])\s+/).filter(Boolean);
}

export function StorySection() {
  const { story } = MURDA_MOSHARI_PAGE;
  const reduced = useReducedMotion();
  const { duration, stagger, transition } = useMurdaMotionTiming();
  const sentences = splitSentences(story.body);

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="relative mx-auto max-w-3xl px-4 md:px-8">
        <span
          className="pointer-events-none absolute -left-2 top-0 font-bn-heading text-7xl leading-none text-mustard opacity-[0.06] md:left-0"
          aria-hidden
        >
          “
        </span>
        <p className="font-bn-body text-xs uppercase tracking-wider text-mustard">
          {story.eyebrow}
        </p>
        <h2 className="font-bn-heading mt-3 text-2xl font-bold text-charcoal md:text-3xl">
          {story.heading}
        </h2>
        <div className="mt-8 space-y-6">
          {sentences.map((sentence, i) =>
            reduced ? (
              <p
                key={`${i}-${sentence.slice(0, 20)}`}
                className="font-bn-heading text-lg leading-loose text-charcoal md:text-xl"
              >
                {sentence}
              </p>
            ) : (
              <motion.p
                key={`${i}-${sentence.slice(0, 20)}`}
                className="font-bn-heading text-lg leading-loose text-charcoal md:text-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={murdaViewport}
                transition={transition({
                  duration: duration(0.55),
                  delay: i * stagger(0.2),
                  ease: calmEase,
                })}
              >
                {sentence}
              </motion.p>
            )
          )}
        </div>
        <p className="font-bn-body mt-10 text-right text-sm italic text-charcoal/70 md:text-base">
          {story.attribution}
        </p>
      </div>
    </section>
  );
}
