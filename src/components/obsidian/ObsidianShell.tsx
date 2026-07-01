'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ObsidianFX } from '@/components/home/obsidian/ObsidianFX';
import { ObsidianHeader } from '@/components/home/obsidian/ObsidianHeader';
import { ObsidianFooter } from '@/components/home/obsidian/ObsidianFooter';
import { ObMarquee } from './ObMarquee';
import { paintSky } from './obsidian-sky';
import { applyThemeColor } from './obsidian-theme';

/** Scroll-linked pale-ice → deep-royal sky, driven page-wide. Measures from the
 *  top of the shell to the bottom of the footer so the transition completes as
 *  the user reaches the footer — identical feel to the homepage. */
function useObsidianSky(rootRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const footEl = root.querySelector<HTMLElement>('.ob-footer');
    if (!footEl) return;

    let raf = 0;
    const paint = () => {
      raf = 0;
      const vh = window.innerHeight;
      const sY = window.pageYOffset;
      const startZ = root.getBoundingClientRect().top + sY;
      const fr = footEl.getBoundingClientRect();
      const zEnd = fr.top + sY + fr.height;
      const raw = (sY + vh - startZ) / Math.max(1, zEnd - startZ);
      paintSky(raw);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    paint();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [rootRef]);
}

interface ObsidianShellProps {
  children: ReactNode;
  /** Bottom collage strip for the footer (reuses the homepage's strip images). */
  stripImages?: string[];
  /** Accent colour to tint the whole page (`--theme`/`--wash`) — e.g. the active
   *  product's dominant colour on the PDP. Re-applied whenever it changes. */
  themeColor?: string;
  /** Marquee words + CTA; pass `marquee={null}` to hide the band. */
  marquee?: { items?: string[]; cta?: { label: string; href: string } | null } | null;
  /** Extra class on the `.obsidian-home` root (page-specific hooks). */
  className?: string;
}

/**
 * The universal Obsidian page wrapper. Provides the dark cinematic chrome —
 * header, footer, infinite marquee, the global FX runtime (cursor comet,
 * magnetic buttons, 3D-tilt cards, scroll reveals, Lenis smooth scroll) and the
 * scroll-linked sky background — to any sub-page. Wrap page content in it and
 * everything inherits the homepage design language (requirements #1, #4, #5).
 */
export function ObsidianShell({
  children,
  stripImages = [],
  themeColor,
  marquee = {},
  className = '',
}: ObsidianShellProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useObsidianSky(rootRef);

  useEffect(() => {
    // An explicit accent (e.g. the PDP's product dominant colour) always wins and
    // tints the whole page to that product.
    if (themeColor) {
      applyThemeColor(themeColor);
      return;
    }
    // Otherwise slowly cycle the accent through a curated luxe palette so every
    // sub-page's header band gently cross-fades hue (via the registered `--theme`
    // @property) — the same living colour-shift as the homepage spotlight, never
    // a static flat panel. 1.2s cross-fade, ~5s hold between colours.
    const PALETTE = ['#7c5cff', '#3f7bff', '#2fb5c9', '#d8a94e', '#b25cff'];
    let i = 0;
    applyThemeColor(PALETTE[0]);
    const id = window.setInterval(() => {
      i = (i + 1) % PALETTE.length;
      applyThemeColor(PALETTE[i]);
    }, 5200);
    return () => window.clearInterval(id);
  }, [themeColor]);

  return (
    <div className={`obsidian-home ${className}`.trim()} ref={rootRef}>
      <ObsidianFX />
      <ObsidianHeader />
      <main id="top">{children}</main>
      {marquee && <ObMarquee items={marquee.items} cta={marquee.cta} />}
      <ObsidianFooter stripImages={stripImages} />
    </div>
  );
}
