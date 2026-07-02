'use client';

import { HIGHLIGHT_TARGETS, isHighlightKey } from '@/lib/highlight-targets';

/**
 * ALMA guided spotlight — the ElevenLabs-style "show, don't tell" effect the
 * AI assistant triggers after (or without) navigation:
 *
 *   1. the page dims + blurs behind a four-panel backdrop (top/right/bottom/
 *      left around the target, so the target itself stays crisp — no
 *      stacking-context games, works inside any transformed parent),
 *   2. the target scales gently forward inside a pulsing neon ring
 *      (violet → gold, matching the Obsidian theme),
 *   3. after ~2.6s everything fades back to normal. Any user interaction
 *      (click/scroll/keypress) dismisses it early — the customer stays in
 *      control.
 *
 * Panels + ring are FIXED-position and re-anchored to the target's live
 * bounding rect every animation frame, so mid-effect scrolling or resizing
 * never leaves the glow floating in the wrong place.
 */

const HOLD_MS = 2600;
const TOUR_HOLD_MS = 2100;
const FADE_MS = 420;
const FIND_TIMEOUT_MS = 6000;
const FIND_INTERVAL_MS = 180;
const RING_PAD = 12;

let activeCleanup: (() => void) | null = null;

/** Selector candidates for a target: a registry key ("categories") or a
 *  product reference ("product:<slug>") pointing at that product's card link
 *  on whatever listing/grid page is currently shown. */
function selectorsFor(key: string): string[] | null {
  if (key.startsWith('product:')) {
    const slug = key.slice('product:'.length).replace(/["'\\]/g, '');
    if (!slug) return null;
    const href = `a[href="/products/${slug}"], a[href^="/products/${slug}?"]`;
    // Grid/listing cards first — a bare match could land on the homepage
    // hero's CTA, whose href rotates with the carousel.
    return [
      `[data-product-slug="${slug}"]`,
      `#products :is(${href})`,
      `.pgrid :is(${href})`,
      `main :is(${href})`,
      `a[href="/products/${slug}"]`,
      `a[href^="/products/${slug}?"]`,
    ];
  }
  return isHighlightKey(key) ? HIGHLIGHT_TARGETS[key].selectors : null;
}

function findTarget(key: string, timeoutMs = FIND_TIMEOUT_MS): Promise<HTMLElement | null> {
  const selectors = selectorsFor(key);
  if (!selectors) return Promise.resolve(null);
  const lookup = () => {
    for (const sel of selectors) {
      const el = document.querySelector<HTMLElement>(sel);
      if (el) return el;
    }
    return null;
  };
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      const el = lookup();
      if (el) return resolve(el);
      if (Date.now() - started > timeoutMs) return resolve(null);
      setTimeout(tick, FIND_INTERVAL_MS);
    };
    tick();
  });
}

/** Run the spotlight effect on a named target. Resolves when the effect
 *  finished — `false` means the target wasn't on this page and nothing was
 *  shown (so the caller can tell the customer instead of silently ✓-ing). */
export async function runSpotlight(
  key: string,
  opts?: { holdMs?: number; findTimeoutMs?: number }
): Promise<boolean> {
  const holdMs = opts?.holdMs ?? HOLD_MS;
  const el = await findTarget(key, opts?.findTimeoutMs);
  if (!el) return false;

  // Only one spotlight at a time.
  activeCleanup?.();

  // Bring the target into view. Native smooth scrolling is DEAD on the
  // Obsidian pages — Lenis's rAF loop rewrites scrollTop every frame and
  // cancels the browser animation — but direct instant writes stick (Lenis
  // syncs to native scroll events). So we drive an eased pan ourselves with
  // per-frame window.scrollTo writes: cinematic, and engine-agnostic.
  const targetYFor = () => {
    const r = el.getBoundingClientRect();
    const centerPad = Math.max(0, (window.innerHeight - Math.min(r.height, window.innerHeight)) / 2);
    return Math.max(0, r.top + window.scrollY - centerPad);
  };
  // Timer-driven (not rAF): rAF pauses entirely in occluded windows, which
  // would leave the pan hanging forever; a 16ms timer ticks everywhere.
  const animateScrollTo = (targetY: number, ms: number) =>
    new Promise<void>((resolve) => {
      const startY = window.scrollY;
      const delta = targetY - startY;
      if (Math.abs(delta) < 2) return resolve();
      const t0 = performance.now();
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const step = () => {
        const p = Math.min(1, (performance.now() - t0) / ms);
        window.scrollTo(0, startY + delta * easeOutCubic(p));
        if (p < 1) setTimeout(step, 16);
        else resolve();
      };
      step();
    });
  await animateScrollTo(targetYFor(), 750);
  // One settle pass — lazy content above may have shifted the target.
  await new Promise((r) => setTimeout(r, 180));
  await animateScrollTo(targetYFor(), 350);

  const root = document.createElement('div');
  root.className = 'alma-hl-root';
  const panels = (['top', 'right', 'bottom', 'left'] as const).map((side) => {
    const p = document.createElement('div');
    p.className = `alma-hl-panel alma-hl-${side}`;
    root.appendChild(p);
    return p;
  });
  // Aurora bloom (blurred, behind) + crisp rotating conic ring (in front) —
  // the ElevenLabs-style multi-colour glow, but animated.
  const glow = document.createElement('div');
  glow.className = 'alma-hl-glow';
  root.appendChild(glow);
  const ring = document.createElement('div');
  ring.className = 'alma-hl-ring';
  root.appendChild(ring);
  document.body.appendChild(root);

  el.classList.add('alma-hl-target');

  const anchor = () => {
    const r = el.getBoundingClientRect();
    const top = Math.max(0, r.top - RING_PAD);
    const left = Math.max(0, r.left - RING_PAD);
    const right = Math.min(window.innerWidth, r.right + RING_PAD);
    const bottom = Math.min(window.innerHeight, r.bottom + RING_PAD);
    const [pt, pr, pb, pl] = panels;
    pt.style.cssText = `top:0;left:0;right:0;height:${top}px`;
    pb.style.cssText = `top:${bottom}px;left:0;right:0;bottom:0`;
    pl.style.cssText = `top:${top}px;left:0;width:${left}px;height:${bottom - top}px`;
    pr.style.cssText = `top:${top}px;left:${right}px;right:0;height:${bottom - top}px`;
    const w = right - left;
    const h = bottom - top;
    // --alma-hl-d sizes the rotating conic square to the rect's diagonal, so
    // the sweep always covers the ring (and no bigger — GPU texture stays small).
    const d = Math.ceil(Math.hypot(w, h));
    ring.style.cssText = `top:${top}px;left:${left}px;width:${w}px;height:${h}px;--alma-hl-d:${d}px`;
    glow.style.cssText = `top:${top - 8}px;left:${left - 8}px;width:${w + 16}px;height:${h + 16}px;--alma-hl-d:${d + 32}px`;
  };
  anchor();
  // Re-anchor on a timer (rAF pauses in occluded windows) so mid-effect
  // scrolls/resizes never leave the glow floating in the wrong place.
  const anchorTimer = window.setInterval(anchor, 40);

  let holdTimer = 0;
  let done = false;
  let fading = false;

  // JS-driven fades (CSS transitions freeze in occluded windows, and a
  // spotlight that silently stays at opacity 0 is worse than no spotlight).
  let fadeTick = 0;
  const fadeTo = (to: number, ms: number, then?: () => void) => {
    clearTimeout(fadeTick);
    const from = parseFloat(root.style.opacity || '0');
    const t0 = performance.now();
    const step = () => {
      if (done) return;
      const p = Math.min(1, (performance.now() - t0) / ms);
      root.style.opacity = String(from + (to - from) * p);
      if (p < 1) fadeTick = window.setTimeout(step, 16);
      else then?.();
    };
    step();
  };

  const cleanup = () => {
    if (done) return;
    done = true;
    activeCleanup = null;
    clearInterval(anchorTimer);
    clearTimeout(holdTimer);
    clearTimeout(fadeTick);
    window.removeEventListener('pointerdown', dismiss, true);
    window.removeEventListener('wheel', dismiss, true);
    window.removeEventListener('keydown', dismiss, true);
    el.classList.remove('alma-hl-target');
    root.remove();
  };
  activeCleanup = cleanup;

  const fadeOut = () => {
    if (fading) return;
    fading = true;
    el.classList.remove('alma-hl-target');
    fadeTo(0, FADE_MS, cleanup);
  };
  const dismiss = () => fadeOut();

  // enter → hold → fade
  fadeTo(1, 380);
  holdTimer = window.setTimeout(fadeOut, holdMs);
  window.addEventListener('pointerdown', dismiss, true);
  window.addEventListener('wheel', dismiss, { capture: true, passive: true });
  window.addEventListener('keydown', dismiss, true);

  await new Promise<void>((resolve) => {
    const wait = () => (done ? resolve() : setTimeout(wait, 120));
    wait();
  });
  return true;
}

/** Sequential product tour — spotlights each product card one after another
 *  (shorter hold per item). Missing cards are skipped, so a stale slug never
 *  stalls the tour. Returns how many products were actually shown. */
export async function runSpotlightTour(slugs: string[]): Promise<number> {
  let shown = 0;
  for (let i = 0; i < slugs.length; i++) {
    // First item gets the full find timeout (page may still be rendering);
    // later items are already on-page or genuinely missing.
    const ok = await runSpotlight(`product:${slugs[i]}`, {
      holdMs: TOUR_HOLD_MS,
      findTimeoutMs: i === 0 ? FIND_TIMEOUT_MS : 1500,
    });
    if (ok) shown += 1;
    if (i < slugs.length - 1) await new Promise((r) => setTimeout(r, 260));
  }
  return shown;
}

/* ------------- pending spotlight across a client-side navigation ------------- */

// Debug/QA handles — trigger from the console:
//   window.__almaSpotlight('family-matching')
//   window.__almaSpotlightTour(['slug-a', 'slug-b'])
if (typeof window !== 'undefined') {
  const w = window as unknown as {
    __almaSpotlight?: typeof runSpotlight;
    __almaSpotlightTour?: typeof runSpotlightTour;
  };
  w.__almaSpotlight = runSpotlight;
  w.__almaSpotlightTour = runSpotlightTour;
}

const PENDING_KEY = 'alma-hl-pending';
const PENDING_TTL_MS = 20_000;

export interface PendingSpotlight {
  key?: string;
  tour?: string[];
}

export function queueSpotlight(pending: PendingSpotlight): void {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ ...pending, at: Date.now() }));
  } catch {
    /* storage unavailable */
  }
}

/** Consume the queued spotlight (if fresh). The caller runs it — that lets
 *  the chat widget show its "Highlighting…" status chip around the effect. */
export function takePendingSpotlight(): PendingSpotlight | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_KEY);
    const parsed = JSON.parse(raw) as PendingSpotlight & { at: number };
    if (Date.now() - parsed.at > PENDING_TTL_MS) return null;
    if (!parsed.key && !parsed.tour?.length) return null;
    return { key: parsed.key, tour: parsed.tour };
  } catch {
    return null;
  }
}
