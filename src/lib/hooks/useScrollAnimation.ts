'use client';

import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { scrollViewport } from '@/lib/animation-variants';

export function useScrollAnimation(options?: { margin?: string; once?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, {
    once: options?.once ?? scrollViewport.once,
    margin: (options?.margin ?? scrollViewport.margin) as '-100px',
  });
  return { ref, isInView };
}
