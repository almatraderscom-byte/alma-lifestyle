/* ==========================================================================
   Obsidian scroll-sky palette — shared source of truth.
   The homepage (ObsidianHome) and every sub-page (ObsidianShell) drive the same
   set of `--sky-*` custom properties so the pale-ice → deep-royal background
   transition is IDENTICAL system-wide. Extracted here (requirement #5) so no
   effect lives inline in a single page component.
   ========================================================================== */

export type SkyStop = {
  top: number[];
  bot: number[];
  ink: number[];
  sun: number[];
  strip: number;
};

/** 4-stop day → night hyperlapse (pale ice-blue → deep royal blue). */
export const SKY: SkyStop[] = [
  { top: [198, 222, 247], bot: [152, 194, 238], ink: [16, 28, 54], sun: [255, 248, 224, 0.55], strip: 0.16 },
  { top: [120, 168, 236], bot: [86, 138, 220], ink: [22, 38, 78], sun: [224, 236, 255, 0.42], strip: 0.22 },
  { top: [70, 116, 220], bot: [48, 90, 196], ink: [232, 240, 255], sun: [198, 218, 255, 0.3], strip: 0.32 },
  { top: [46, 84, 204], bot: [30, 58, 168], ink: [238, 244, 255], sun: [150, 182, 238, 0.2], strip: 0.44 },
];

export const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
export const mix = (a: number[], b: number[], f: number) => a.map((v, i) => lerp(v, b[i], f));
export const rgb = (a: number[]) => `rgb(${a.map((v) => Math.round(v)).join(',')})`;
export const rgba = (a: number[]) =>
  `rgba(${a.slice(0, 3).map((v) => Math.round(v)).join(',')},${a[3] !== undefined ? a[3] : 1})`;

/**
 * Paint the `--sky-*` custom properties on <html> from a raw 0..1 scroll
 * progress. Applies the same 1.7 gamma + 4-stop interpolation the homepage uses.
 */
export function paintSky(raw: number): void {
  const ds = document.documentElement.style;
  const p = Math.pow(Math.max(0, Math.min(1, raw)), 1.7);
  const seg = p * (SKY.length - 1);
  const i = Math.min(SKY.length - 2, Math.floor(seg));
  const f = seg - i;
  const A = SKY[i];
  const B = SKY[i + 1];
  ds.setProperty('--sky-top', rgb(mix(A.top, B.top, f)));
  ds.setProperty('--sky-bot', rgb(mix(A.bot, B.bot, f)));
  const ink = mix(A.ink, B.ink, f);
  ds.setProperty('--sky-ink', rgb(ink));
  ds.setProperty('--sky-dim', rgba([...ink, 0.66]));
  ds.setProperty('--sky-line', rgba([...ink, 0.16]));
  ds.setProperty('--sun', rgba(mix(A.sun, B.sun, f)));
  ds.setProperty('--strip-op', lerp(A.strip, B.strip, f).toFixed(3));
}
