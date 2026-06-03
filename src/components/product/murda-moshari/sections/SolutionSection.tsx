'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { MURDA_MOSHARI_PAGE } from '@/lib/content';
import {
  calmEase,
  fadeUp,
  murdaViewport,
  staggerContainer,
  useMurdaMotionTiming,
} from '@/components/product/murda-moshari/animation-config';
import { cn } from '@/lib/utils';

const IN_USE_IMAGE = '/products/murda-moshari/in-use.jpg';

const chipPositions = ['left-3 top-3', 'right-3 top-3', 'left-3 bottom-3'] as const;
const chipOffsets = [
  { x: 24, y: 24 },
  { x: -24, y: 24 },
  { x: 24, y: -24 },
] as const;

export function SolutionSection() {
  const { solution } = MURDA_MOSHARI_PAGE;
  const reduced = useReducedMotion();
  const { duration, stagger, transition } = useMurdaMotionTiming();
  const Wrapper = reduced ? 'section' : motion.section;

  return (
    <Wrapper className="overflow-visible bg-cream py-14 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:gap-14">
        <div className="order-2 md:order-1">
          <div className="relative overflow-visible">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl md:rounded-l-3xl md:rounded-r-none">
              {reduced ? (
                <Image
                  src={IN_USE_IMAGE}
                  alt="স্মার্ট মুর্দা মশারী ব্যবহারে — চারদিক ঢাকা ও পর্দা"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <motion.div
                  className="relative h-full w-full"
                  initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
                  whileInView={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
                  viewport={murdaViewport}
                  transition={{ duration: duration(1.1), ease: calmEase }}
                >
                  <Image
                    src={IN_USE_IMAGE}
                    alt="স্মার্ট মুর্দা মশারী ব্যবহারে — চারদিক ঢাকা ও পর্দা"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </motion.div>
              )}
              {solution.tags.map((tag, i) =>
                reduced ? (
                  <span
                    key={tag}
                    className={cn(
                      'absolute rounded-full bg-cream px-3 py-1.5 font-bn-body text-xs font-medium text-emerald md:text-sm',
                      chipPositions[i]
                    )}
                  >
                    {tag}
                  </span>
                ) : (
                  <motion.span
                    key={tag}
                    className={cn(
                      'absolute rounded-full bg-cream px-3 py-1.5 font-bn-body text-xs font-medium text-emerald md:text-sm',
                      chipPositions[i]
                    )}
                    initial={{
                      opacity: 0,
                      scale: 0.5,
                      x: chipOffsets[i].x,
                      y: chipOffsets[i].y,
                    }}
                    whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    viewport={murdaViewport}
                    transition={{
                      type: 'spring',
                      stiffness: 80,
                      damping: 18,
                      delay: duration(1.1) + i * stagger(0.2),
                    }}
                  >
                    {tag}
                  </motion.span>
                )
              )}
            </div>
          </div>
        </div>
        <motion.div
          className="order-1 md:order-2"
          {...(!reduced && {
            variants: staggerContainer(stagger(0.12)),
            initial: 'hidden',
            whileInView: 'visible',
            viewport: murdaViewport,
          })}
        >
          {reduced ? (
            <>
              <p className="font-bn-body text-xs uppercase tracking-wider text-mustard">
                {solution.eyebrow}
              </p>
              <h2 className="font-bn-heading mt-2 text-2xl text-charcoal md:text-3xl">
                {solution.heading}
              </h2>
              <p className="font-bn-body mt-5 text-base leading-relaxed text-charcoal/80 md:text-lg">
                {solution.body}
              </p>
            </>
          ) : (
            <>
              <motion.p
                variants={fadeUp}
                className="font-bn-body text-xs uppercase tracking-wider text-mustard"
              >
                {solution.eyebrow}
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="font-bn-heading mt-2 text-2xl text-charcoal md:text-3xl"
              >
                {solution.heading}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="font-bn-body mt-5 text-base leading-relaxed text-charcoal/80 md:text-lg"
              >
                {solution.body}
              </motion.p>
            </>
          )}
        </motion.div>
      </div>
    </Wrapper>
  );
}
