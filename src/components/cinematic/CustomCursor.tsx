'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const LERP = 0.18;
const TRAIL_DELAYS = [5, 10, 15] as const;
const TRAIL_OPACITY = [0.5, 0.3, 0.15] as const;

export function CustomCursor() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);
  const [hovering, setHovering] = useState(false);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const history = useRef<{ x: number; y: number }[]>([]);
  const frame = useRef(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ringRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;

    const coarseMq = window.matchMedia('(pointer: coarse)');
    const narrowMq = window.matchMedia('(max-width: 1023px)');
    if (coarseMq.matches || narrowMq.matches) return;

    setActive(true);
    document.body.classList.add('cinematic-cursor-active');

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest) return;
      const interactive = t.closest('a, button, [data-cursor="ring"]');
      setHovering(Boolean(interactive));
    };

    const tick = () => {
      frame.current += 1;
      pos.current.x += (target.current.x - pos.current.x) * LERP;
      pos.current.y += (target.current.y - pos.current.y) * LERP;

      history.current.unshift({ x: pos.current.x, y: pos.current.y });
      if (history.current.length > 20) history.current.length = 20;

      const { x, y } = pos.current;
      if (mainRef.current) {
        mainRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      trailRefs.current.forEach((el, i) => {
        if (!el) return;
        const delay = TRAIL_DELAYS[i] ?? 15;
        const trailPos = history.current[delay] ?? pos.current;
        el.style.transform = `translate3d(${trailPos.x}px, ${trailPos.y}px, 0) translate(-50%, -50%)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      setActive(false);
      document.body.classList.remove('cinematic-cursor-active');
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] hidden lg:block" aria-hidden>
      {TRAIL_DELAYS.map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          className="absolute top-0 left-0 h-2.5 w-2.5 rounded-full bg-mustard mix-blend-difference will-change-transform"
          style={{ opacity: TRAIL_OPACITY[i] }}
        />
      ))}
      <div
        ref={mainRef}
        className={cn(
          'absolute top-0 left-0 h-2.5 w-2.5 rounded-full bg-mustard mix-blend-difference will-change-transform',
          hovering && 'opacity-0'
        )}
      />
      <div
        ref={ringRef}
        className={cn(
          'absolute top-0 left-0 rounded-full border border-mustard bg-transparent mix-blend-difference will-change-transform transition-[width,height,opacity] duration-300',
          hovering ? 'h-11 w-11 opacity-100' : 'h-2.5 w-2.5 opacity-0'
        )}
      />
    </div>
  );
}
