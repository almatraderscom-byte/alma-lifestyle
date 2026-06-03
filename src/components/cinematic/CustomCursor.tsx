'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const LERP = 0.18;
const TRAIL_LAG = [0.35, 0.55, 0.75];

export function CustomCursor() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);
  const [hovering, setHovering] = useState(false);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const trails = useRef([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);
  const mainRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ringRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const narrow = window.innerWidth < 1024;
    if (coarse || narrow) return;

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
      pos.current.x += (target.current.x - pos.current.x) * LERP;
      pos.current.y += (target.current.y - pos.current.y) * LERP;

      trails.current.forEach((trail, i) => {
        const lag = TRAIL_LAG[i] ?? 0.5;
        trail.x += (pos.current.x - trail.x) * lag;
        trail.y += (pos.current.y - trail.y) * lag;
      });

      const { x, y } = pos.current;
      if (mainRef.current) {
        mainRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
      trailRefs.current.forEach((el, i) => {
        if (!el) return;
        const t = trails.current[i];
        el.style.transform = `translate(${t.x}px, ${t.y}px) translate(-50%, -50%)`;
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
      {trails.current.map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          className="absolute top-0 left-0 h-1.5 w-1.5 rounded-full bg-mustard/50 mix-blend-difference will-change-transform"
        />
      ))}
      <div
        ref={mainRef}
        className={cn(
          'absolute top-0 left-0 rounded-full bg-mustard mix-blend-difference will-change-transform',
          hovering ? 'h-0 w-0 opacity-0' : 'h-2.5 w-2.5'
        )}
      />
      <div
        ref={ringRef}
        className={cn(
          'absolute top-0 left-0 rounded-full border border-mustard mix-blend-difference will-change-transform transition-[width,height,opacity] duration-300',
          hovering ? 'h-11 w-11 opacity-100' : 'h-2.5 w-2.5 opacity-0'
        )}
      />
    </div>
  );
}
