'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMurdaPage } from '@/components/product/murda-moshari/MurdaPageContext';
import {
  calmEase,
  fadeIn,
  murdaViewport,
  useMurdaMotionTiming,
} from '@/components/product/murda-moshari/animation-config';

export function ProblemSection() {
  const { problem } = useMurdaPage();
  const [before, after] = problem.outro.split('পরিপূর্ণ সমাধান');
  const reduced = useReducedMotion();
  const { duration, stagger, transition } = useMurdaMotionTiming();

  const Wrapper = reduced ? 'section' : motion.section;
  const Card = reduced ? 'div' : motion.div;

  return (
    <Wrapper
      className="bg-white py-14 md:py-20"
      {...(!reduced && {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: murdaViewport,
        transition: transition({ duration: duration(0.7) }),
      })}
    >
      <div className="mx-auto max-w-2xl px-4">
        <Card
          className="rounded-2xl border border-border-subtle bg-white p-8 md:p-12"
          {...(!reduced && {
            initial: { opacity: 0, scale: 0.97 },
            whileInView: { opacity: 1, scale: 1 },
            viewport: murdaViewport,
            transition: transition({ duration: duration(0.7) }),
          })}
        >
          <div className="relative text-center">
            <h2 className="font-bn-heading text-2xl text-charcoal md:text-3xl">
              {problem.heading}
            </h2>
            {!reduced && (
              <motion.span
                className="absolute -bottom-1 left-1/2 h-px w-24 -translate-x-1/2 bg-mustard"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={murdaViewport}
                transition={transition({ duration: duration(0.5), delay: duration(0.35) })}
                style={{ transformOrigin: 'center' }}
                aria-hidden
              />
            )}
          </div>
          <p className="font-bn-body mt-8 text-base leading-relaxed text-charcoal md:text-lg">
            {problem.intro}
          </p>
          <ul className="font-bn-body mt-6 space-y-3 text-base leading-relaxed text-charcoal">
            {problem.points.map((point, i) =>
              reduced ? (
                <li key={point} className="flex gap-3">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mustard" />
                  <span>{point}</span>
                </li>
              ) : (
                <motion.li
                  key={point}
                  className="flex gap-3"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={murdaViewport}
                  transition={transition({
                    duration: duration(0.5),
                    delay: stagger(0.4) + i * stagger(0.4),
                    ease: calmEase,
                  })}
                >
                  <motion.span
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mustard"
                    initial={{ scale: 1 }}
                    whileInView={{ scale: [1, 1.4, 1] }}
                    viewport={murdaViewport}
                    transition={transition({ duration: duration(0.6), delay: stagger(0.4) + i * stagger(0.4) })}
                    aria-hidden
                  />
                  <span>{point}</span>
                </motion.li>
              )
            )}
          </ul>
          {reduced ? (
            <p className="font-bn-body mt-8 text-base leading-relaxed text-charcoal md:text-lg">
              {before}
              <span className="font-semibold text-emerald">পরিপূর্ণ সমাধান</span>
              {after}
            </p>
          ) : (
            <motion.p
              className="font-bn-body mt-8 text-base leading-relaxed text-charcoal md:text-lg"
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={murdaViewport}
            >
              {before}
              <motion.span
                className="font-semibold text-emerald"
                initial={{
                  backgroundImage:
                    'linear-gradient(90deg, rgba(200,155,60,0.35) 0%, rgba(200,155,60,0.35) 100%)',
                  backgroundSize: '0% 100%',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'left bottom',
                }}
                whileInView={{
                  backgroundSize: '100% 100%',
                }}
                viewport={murdaViewport}
                transition={transition({ duration: duration(0.7), delay: duration(0.5) })}
                style={{ backgroundPosition: 'left bottom' }}
              >
                পরিপূর্ণ সমাধান
              </motion.span>
              {after}
            </motion.p>
          )}
        </Card>
      </div>
    </Wrapper>
  );
}
