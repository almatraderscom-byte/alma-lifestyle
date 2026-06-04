'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';

export const CINEMATIC_ROUTE_START = 'cinematic:route-start';

export function dispatchRouteTransitionStart() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CINEMATIC_ROUTE_START));
  }
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function RouteTransitionBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const widthRef = useRef(0);
  const rafRef = useRef(0);
  const activeRef = useRef(false);
  const mountedRef = useRef(false);

  const cancelAnim = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const animateTo = useCallback(
    (from: number, to: number, durationMs: number, onDone?: () => void) => {
      cancelAnim();
      const t0 = performance.now();
      activeRef.current = true;
      setOpacity(1);

      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / durationMs);
        const next = from + (to - from) * easeOutCubic(t);
        widthRef.current = next;
        setWidth(next);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          activeRef.current = false;
          onDone?.();
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [cancelAnim]
  );

  const startNavigation = useCallback(() => {
    widthRef.current = 0;
    setWidth(0);
    animateTo(0, 70, 600, () => {
      animateTo(70, 90, 1500);
    });
  }, [animateTo]);

  const finishNavigation = useCallback(() => {
    cancelAnim();
    const from = widthRef.current;
    if (from < 90) {
      widthRef.current = 90;
      setWidth(90);
    }
    animateTo(widthRef.current, 100, 200, () => {
      window.setTimeout(() => {
        setOpacity(0);
        setWidth(0);
        widthRef.current = 0;
      }, 300);
    });
  }, [animateTo, cancelAnim]);

  useEffect(() => {
    if (reduced) return;
    const onStart = () => startNavigation();
    window.addEventListener(CINEMATIC_ROUTE_START, onStart);
    return () => window.removeEventListener(CINEMATIC_ROUTE_START, onStart);
  }, [reduced, startNavigation]);

  useEffect(() => {
    if (reduced) return;
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (widthRef.current > 0 || activeRef.current) {
      finishNavigation();
    }
  }, [pathname, searchKey, reduced, finishNavigation]);

  useEffect(() => () => cancelAnim(), [cancelAnim]);

  if (reduced) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[999] h-[2.5px] pointer-events-none transition-opacity duration-300"
      style={{ opacity }}
      aria-hidden
    >
      <div
        className="relative h-full overflow-hidden rounded-r-full"
        style={{
          width: `${width}%`,
          background:
            'linear-gradient(90deg, var(--color-mustard) 0%, var(--color-terracotta) 50%, var(--color-mustard) 100%)',
          boxShadow: '0 0 12px rgba(255, 248, 220, 0.55), 0 0 6px rgba(200, 155, 60, 0.45)',
        }}
      >
        <span
          className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full blur-md"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,240,0.9) 0%, rgba(200,155,60,0.4) 50%, transparent 70%)',
          }}
        />
      </div>
    </div>
  );
}
