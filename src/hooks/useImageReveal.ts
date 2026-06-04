'use client';

import { useEffect, useRef } from 'react';

export function useImageReveal<T extends HTMLElement>(staggerMs = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            window.setTimeout(() => {
              el.style.animation = 'imageReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards';
            }, staggerMs);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [staggerMs]);

  return ref;
}
