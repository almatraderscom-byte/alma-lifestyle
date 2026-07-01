'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';

export type FloatingSocial = 'whatsapp' | 'facebook' | 'instagram' | 'call';

export interface FloatingImageArrayProps {
  /** Product image URLs. Only the first 7 are used. Ignored when `socials` is set. */
  images?: string[];
  /** When provided, render social-icon bubbles instead of product images. */
  socials?: FloatingSocial[];
  /** The trigger element the user hovers (wrapped by this component). */
  children: React.ReactNode;
  /** Optional extra classes for the wrapper element. */
  className?: string;
}

/**
 * Scatter slots split into a LEFT wing and a RIGHT wing with an empty central
 * gutter — the cards fan out to both sides of the hovered link (client: "dan
 * bame chorai jabe") and deliberately leave the middle clear so they never fall
 * on the hero model's face. Up to 7 slots. Panel is 720×300; centre ≈ (295,60).
 */
const PANEL_W = 720;
const PANEL_H = 300;
const CARD = 128;
const CENTER_X = PANEL_W / 2 - CARD / 2; // 296
const CENTER_Y = 40;

// Interleaved L / R / L / R… so any count stays balanced across both wings and
// the central gutter (≈180px wide, where the model's face sits) stays clear.
const SCATTER: Array<{ x: number; y: number; rotate: number }> = [
  { x: 4, y: 34, rotate: -11 }, // L
  { x: 588, y: 30, rotate: 8 }, // R
  { x: 128, y: 6, rotate: 6 }, // L
  { x: 470, y: 8, rotate: -6 }, // R
  { x: 30, y: 152, rotate: -6 }, // L
  { x: 560, y: 150, rotate: 10 }, // R
  { x: 150, y: 140, rotate: 8 }, // L
];

// The cluster centre floats just below-right of the pointer. Because the trigger
// is in the TOP nav, Y is positive (drops down); X is negative so the wide panel
// is roughly centred under the hovered link and emits to both sides.
const OFFSET_X = -PANEL_W / 2;
const OFFSET_Y = 44;

const SOCIAL_META: Record<
  FloatingSocial,
  { label: string; bg: string; path: React.ReactNode }
> = {
  whatsapp: {
    label: 'WhatsApp',
    bg: 'linear-gradient(150deg,#25d366,#128c4b)',
    path: (
      <path d="M12 2a10 10 0 0 0-8.6 15l-1.2 4.4 4.5-1.2A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .3-3.4-.7-2.9-1.2-4.7-4.2-4.8-4.4-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.4.2.5.4.1.2.1.9-.1 1.4Z" />
    ),
  },
  facebook: {
    label: 'Facebook',
    bg: 'linear-gradient(150deg,#3b82f6,#1d4ed8)',
    path: (
      <path d="M14 8.5V6.8c0-.7.5-.9 1-.9h1.5V3h-2.4C11.4 3 10.5 4.8 10.5 6.6v1.9H8.5V11h2v10h3.5V11h2.2l.4-2.5H14Z" />
    ),
  },
  instagram: {
    label: 'Instagram',
    bg: 'linear-gradient(135deg,#feda75,#d62976 45%,#962fbf 80%,#4f5bd5)',
    path: (
      <>
        <rect x="4.5" y="4.5" width="15" height="15" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16.6" cy="7.4" r="1.1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  call: {
    label: 'Call',
    bg: 'linear-gradient(150deg,#8b7bff,#5b3fe0)',
    path: (
      <path d="M6.6 3h3.2l1.4 3.5-2 1.4a11 11 0 0 0 4.9 4.9l1.4-2 3.5 1.4V19a2 2 0 0 1-2 2A15 15 0 0 1 4.6 5a2 2 0 0 1 2-2Z" />
    ),
  },
};

export function FloatingImageArray({
  images,
  socials,
  children,
  className,
}: FloatingImageArrayProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // Raw cursor position tracked via motion values.
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Spring-smoothed values create the lag/lerp follow behavior.
  const springConfig = { damping: 22, stiffness: 160, mass: 0.6 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  // Magnetic tilt reacting to pointer velocity.
  const tilt = useMotionValue(0);
  const tiltSpring = useSpring(tilt, { damping: 18, stiffness: 200, mass: 0.5 });

  const initializedRef = useRef(false);
  const lastMoveRef = useRef<{ x: number; t: number } | null>(null);

  // Detect touch/coarse-pointer devices — disable the floating overlay there.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  const usableImages = useMemo(
    () => (Array.isArray(images) ? Array.from(new Set(images.filter(Boolean))).slice(0, 7) : []),
    [images],
  );
  const usableSocials = useMemo(
    () => (Array.isArray(socials) ? socials.slice(0, 7) : []),
    [socials],
  );

  const slotCount = usableSocials.length || usableImages.length;
  const enabled = slotCount > 0 && !isTouch;

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;
      const nextX = e.clientX + OFFSET_X;
      const nextY = e.clientY + OFFSET_Y;
      // On first move, jump springs to position so it doesn't fly in from origin.
      if (!initializedRef.current) {
        cursorX.jump?.(nextX);
        cursorY.jump?.(nextY);
        x.jump?.(nextX);
        y.jump?.(nextY);
        initializedRef.current = true;
      }
      cursorX.set(nextX);
      cursorY.set(nextY);

      // Magnetic tilt: derive from horizontal pointer velocity, clamped to ±8deg.
      const now = performance.now();
      const last = lastMoveRef.current;
      if (last) {
        const dt = now - last.t;
        if (dt > 0) {
          const velocity = (e.clientX - last.x) / dt; // px per ms
          const next = Math.max(-8, Math.min(8, velocity * 12));
          tilt.set(next);
        }
      }
      lastMoveRef.current = { x: e.clientX, t: now };
    },
    [enabled, cursorX, cursorY, x, y, tilt],
  );

  const handleEnter = useCallback(() => {
    if (!enabled) return;
    setHovered(true);
  }, [enabled]);

  const handleLeave = useCallback(() => {
    setHovered(false);
    initializedRef.current = false;
    lastMoveRef.current = null;
    tilt.set(0);
  }, [tilt]);

  const renderSlot = (i: number, content: React.ReactNode, isSocial: boolean) => {
    const pos = SCATTER[i % SCATTER.length];
    const r = pos.rotate;
    const floatDuration = 2.6 + (i % 4) * 0.4;
    const size = isSocial ? 76 : CARD;
    return (
      // OUTER: fast, staggered ENTRANCE — each card flies one-by-one from the
      // panel centre out to its scatter slot (spring, delay i * 0.055s).
      <motion.div
        key={i}
        className="absolute"
        style={{ left: pos.x, top: pos.y, width: size, height: size }}
        initial={{ opacity: 0, scale: 0.4, x: CENTER_X - pos.x, y: CENTER_Y - pos.y }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.4, x: CENTER_X - pos.x, y: CENTER_Y - pos.y }}
        transition={{
          type: 'spring',
          stiffness: 520,
          damping: 26,
          mass: 0.5,
          delay: i * 0.055,
        }}
      >
        {/* INNER: continuous idle float + subtle rotation. */}
        <motion.div
          className="h-full w-full"
          style={{ rotate: r }}
          animate={
            prefersReducedMotion ? undefined : { y: [0, -9, 0], rotate: [r - 3, r + 3, r - 3] }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: floatDuration, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }
          }
        >
          {content}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <span
      className={className}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={handleMove}
    >
      {children}

      <AnimatePresence>
        {enabled && hovered && (
          <motion.div
            key="floating-image-array"
            className="pointer-events-none fixed left-0 top-0 z-[9999]"
            style={{ x, y, rotate: tiltSpring, width: PANEL_W, height: PANEL_H }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* No solid panel — cards float free so they never blanket the hero. */}
            {usableSocials.length
              ? usableSocials.map((s, i) => {
                  const meta = SOCIAL_META[s];
                  return renderSlot(
                    i,
                    <span
                      className="flex h-full w-full items-center justify-center rounded-full text-white shadow-[0_18px_46px_-12px_rgba(6,5,12,0.9)] ring-1 ring-inset ring-white/25"
                      style={{ background: meta.bg }}
                      aria-label={meta.label}
                    >
                      <svg viewBox="0 0 24 24" width="38" height="38" fill="currentColor" aria-hidden>
                        {meta.path}
                      </svg>
                    </span>,
                    true,
                  );
                })
              : usableImages.map((src, i) =>
                  renderSlot(
                    i,
                    <span className="relative block h-full w-full overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] shadow-[0_20px_54px_-12px_rgba(6,5,12,0.9)] backdrop-blur-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                    </span>,
                    false,
                  ),
                )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

export default FloatingImageArray;
