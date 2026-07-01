'use client';

import { useEffect, useRef } from 'react';

/** Constant per-letter 3D float + cursor-reactive chromatic refraction glow
 *  (cyan/orange split). This is the SAME effect that powers the footer wordmark
 *  — extracted here so massive headings on any sub-page get the identical
 *  liquid-glass / RGB-split / glowing-trail treatment (requirement #3). */
function useWordmarkRipple(wordRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const word = wordRef.current;
    if (!word) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const letters = Array.from(word.querySelectorAll<HTMLElement>('.fw-l'));
    if (!letters.length) return;

    const st = letters.map(() => ({ z: 0, rx: 0, ry: 0, y: 0, g: 0 }));
    let mX = 0;
    let mY = 0;
    let mIn = false;
    const R = 220;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mX = e.clientX;
      mY = e.clientY;
      mIn = true;
    };
    const onLeave = () => {
      mIn = false;
    };
    word.addEventListener('pointermove', onMove);
    word.addEventListener('pointerleave', onLeave);

    const loop = () => {
      const t = performance.now() / 1000;
      for (let i = 0; i < letters.length; i++) {
        const ph = i * 0.42;
        const iy = Math.sin(t * 1.05 + ph) * 12;
        const irx = Math.sin(t * 0.85 + ph) * 9;
        const iry = Math.sin(t * 0.5 + ph) * 5;
        const irz = Math.sin(t * 0.6 + ph) * 2.4;
        let tz = 0;
        let trx = 0;
        let tryv = 0;
        let ty = 0;
        let tg = 0;
        if (mIn) {
          const r = letters[i].getBoundingClientRect();
          const cxl = r.left + r.width / 2;
          const dx = mX - cxl;
          const dy = mY - (r.top + r.height / 2);
          let inf = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / R);
          inf *= inf;
          tz = inf * 120;
          tryv = -(dx / R) * inf * 40;
          trx = (dy / R) * inf * 32;
          ty = -inf * 14;
          tg = Math.max(0, 1 - Math.abs(dx) / (R * 1.15));
          tg *= tg;
        }
        const s = st[i];
        s.z += (tz - s.z) * 0.12;
        s.rx += (trx - s.rx) * 0.12;
        s.ry += (tryv - s.ry) * 0.12;
        s.y += (ty - s.y) * 0.12;
        s.g += (tg - s.g) * 0.14;
        letters[i].style.transform = `translateY(${(iy + s.y).toFixed(2)}px) translateZ(${s.z.toFixed(
          2
        )}px) rotateX(${(irx + s.rx).toFixed(2)}deg) rotateY(${(iry + s.ry).toFixed(2)}deg) rotateZ(${irz.toFixed(
          2
        )}deg)`;
        if (s.g > 0.01) {
          const g = s.g;
          letters[i].style.filter = `brightness(${(1 + g * 0.55).toFixed(3)})`;
          letters[i].style.textShadow = `${(g * 3).toFixed(1)}px 0 ${(g * 4).toFixed(1)}px rgba(255,120,90,${(
            g * 0.5
          ).toFixed(2)}),${(-g * 3).toFixed(1)}px 0 ${(g * 4).toFixed(1)}px rgba(90,150,255,${(g * 0.5).toFixed(
            2
          )}),0 0 ${(g * 22).toFixed(1)}px rgba(255,255,255,${(g * 0.65).toFixed(2)})`;
        } else if (letters[i].style.filter) {
          letters[i].style.filter = '';
          letters[i].style.textShadow = '';
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      word.removeEventListener('pointermove', onMove);
      word.removeEventListener('pointerleave', onLeave);
    };
  }, [wordRef]);
}

interface FloatingWordProps {
  /** The heading text. Spaces are preserved as gaps between floating letters. */
  text: string;
  /** 'light' = white gradient (for dark backgrounds), 'ink' = dark gradient
   *  (for the pale scroll-sky backgrounds). */
  tone?: 'light' | 'ink';
  className?: string;
  /** Accessible label override (defaults to `text`). */
  ariaLabel?: string;
}

/** Massive Anton display heading whose letters constantly float in 3D and
 *  refract chromatically under the cursor. Drop-in for any hero/section title. */
export function FloatingWord({ text, tone = 'ink', className = '', ariaLabel }: FloatingWordProps) {
  const wordRef = useRef<HTMLDivElement | null>(null);
  useWordmarkRipple(wordRef);
  return (
    <div
      className={`ob-fword ob-fword-${tone} anton ${className}`.trim()}
      ref={wordRef}
      aria-label={ariaLabel ?? text}
    >
      {text.split('').map((ch, i) => (
        <span className="fw-l" key={i} aria-hidden>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </div>
  );
}
