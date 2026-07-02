'use client';

import { useEffect, useRef } from 'react';

/**
 * AdminCursorComet — a lightweight 2D-canvas comet trail that follows the mouse
 * across the admin panel (violet #7c5cff fading to gold #d8a94e), adapted from
 * the storefront ObsidianFX `initCursorTrail`. Pure 2D canvas + rAF, self-contained.
 *
 * Disabled entirely on coarse pointers, narrow viewports (<1024px) and when the
 * user prefers reduced motion — same guards the storefront uses.
 */
export function AdminCursorComet() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || typeof window === 'undefined' || !window.matchMedia) return;

    const disabled =
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(max-width: 1023px)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (disabled) {
      cv.style.display = 'none';
      return;
    }

    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    const size = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * DPR;
      cv.height = H * DPR;
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    size();
    window.addEventListener('resize', size);

    const pts: Array<{ x: number; y: number }> = [];
    let mx = -100;
    let my = -100;
    let hasMoved = false;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      mx = e.clientX;
      my = e.clientY;
      hasMoved = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let running = true;
    const onVis = () => {
      running = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVis);

    let rafId = 0;
    let disposed = false;
    function loop() {
      if (disposed || !ctx) return;
      rafId = requestAnimationFrame(loop);
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      if (hasMoved) pts.push({ x: mx, y: my });
      if (pts.length > 26) pts.shift();
      if (pts.length < 2) return;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1];
        const p1 = pts[i];
        const t = i / pts.length;
        const w = Math.max(0.4, t * 7);
        const g = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
        // violet #7c5cff -> gold #d8a94e along the trail
        g.addColorStop(0, `rgba(124,92,255,${t * 0.5})`);
        g.addColorStop(1, `rgba(216,169,78,${t * 0.65})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = w;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
      const head = pts[pts.length - 1];
      const hg = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 14);
      hg.addColorStop(0, 'rgba(255,255,255,.9)');
      hg.addColorStop(0.4, 'rgba(154,125,255,.5)');
      hg.addColorStop(1, 'rgba(154,125,255,0)');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 14, 0, Math.PI * 2);
      ctx.fill();
      if (!hasMoved && pts.length) pts.shift();
      hasMoved = false;
    }
    rafId = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
