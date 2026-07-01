/* ==========================================================================
   Obsidian accent-theme helpers — shared.
   `--theme` / `--wash` drive the interpolating pastel wash (see the
   `@property --theme` registration + color-mix in obsidian.css). The hero sets
   these per active slide; sub-pages (e.g. the PDP) set them from the active
   product's dominant colour so the whole page tints to the product — the same
   mechanism, reused (requirement #1).
   ========================================================================== */

/** rgba() string from a #hex + alpha. */
export function hexRGBA(hex: string, a: number): string {
  let h = String(hex).replace('#', '').trim();
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h || '000000', 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Apply an accent colour to the `.obsidian-home` root (interpolates smoothly
 *  via the registered @property). Also nudges the WebGL orb when present. */
export function applyThemeColor(hex: string | undefined | null): void {
  if (!hex) return;
  const root = (document.querySelector('.obsidian-home') as HTMLElement | null)?.style;
  if (root) {
    root.setProperty('--theme', hex);
    root.setProperty('--wash', hexRGBA(hex, 0.34));
  }
  if (typeof window !== 'undefined' && typeof window.almaTheme === 'function') {
    window.almaTheme(hex);
  }
}

/** Extract a Tailwind `bg-[#rrggbb]` arbitrary value or a bare hex from a class
 *  string. Returns undefined when none is present. Lets us reuse the catalog's
 *  existing `bgClass` swatches as accent colours without adding new data. */
export function hexFromBgClass(bgClass: string | undefined): string | undefined {
  if (!bgClass) return undefined;
  const m = bgClass.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})/);
  return m ? `#${m[1]}` : undefined;
}
