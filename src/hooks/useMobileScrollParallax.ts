'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';

type ScrollOffset = `${'start' | 'center' | 'end'} ${'start' | 'center' | 'end'}`;

export function useMobileScrollParallax(
  range: [string, string] = ['-10%', '10%'],
  offset: ScrollOffset[] = ['start end', 'end start']
): {
  ref: React.RefObject<HTMLElement | null>;
  y: MotionValue<string> | undefined;
  isMobile: boolean;
} {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  });
  const y = useTransform(scrollYProgress, [0, 1], range);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return {
    ref,
    y: !reduced && isMobile ? y : undefined,
    isMobile,
  };
}
