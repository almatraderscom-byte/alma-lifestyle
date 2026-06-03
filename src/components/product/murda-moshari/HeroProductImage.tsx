'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { calmEase, murdaViewport, useMurdaMotionTiming } from './animation-config';

const HERO_IMAGE = '/products/murda-moshari/hero-black.jpg';

export function HeroProductImage() {
  const reduced = useReducedMotion();
  const { duration } = useMurdaMotionTiming();

  const image = (
    <Image
      src={HERO_IMAGE}
      alt="স্মার্ট মুর্দা মশারী — কালো রঙের পর্দা মশারী"
      fill
      priority
      sizes="(max-width: 768px) 100vw, 50vw"
      className="object-contain object-center"
    />
  );

  return (
    <div className="relative aspect-[4/3] w-full min-h-[220px] md:min-h-[300px]">
      <div className="absolute inset-0 overflow-hidden rounded-xl bg-charcoal/5">
        {reduced ? (
          image
        ) : (
          <motion.div
            className="absolute inset-0"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            whileInView={{ clipPath: 'inset(0 0 0 0)' }}
            viewport={murdaViewport}
            transition={{ duration: duration(1.2), ease: calmEase }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1 }}
              animate={{ scale: 1.04 }}
              transition={{ duration: 20, ease: 'linear' }}
            >
              {image}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
