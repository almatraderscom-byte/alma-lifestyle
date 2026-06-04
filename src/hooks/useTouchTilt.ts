'use client';

import { useRef, useEffect } from 'react';

export function useTouchTilt(strength = 8) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(pointer: coarse)').matches) return;

    let rafId = 0;

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const rect = el.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width;
      const y = (touch.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * strength * 2;
      const rotateX = (0.5 - y) * strength * 2;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
      });
    };

    const reset = () => {
      cancelAnimationFrame(rafId);
      el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    };

    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', reset);
    el.addEventListener('touchcancel', reset);

    return () => {
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', reset);
      el.removeEventListener('touchcancel', reset);
      cancelAnimationFrame(rafId);
    };
  }, [strength]);

  return ref;
}
