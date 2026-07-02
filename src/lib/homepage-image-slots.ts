import type React from 'react';
import type {
  CategoryColorClass,
  HomepageImageSlot,
  HomepageImageSlotAdjust,
} from '@/lib/homepage-config-types';

export type { HomepageImageSlot };

/**
 * Framing style for an adjusted image slot: objectPosition + zoom-with-pan.
 *
 * Repositioning uses TWO mechanisms because `object-position` alone can only
 * shift along the axis where the cover-fit image overflows its box — on the
 * other axis the image fits exactly and objectPosition is a no-op (which made
 * vertical drags feel dead). So when zoomed, posX/posY additionally drive a
 * translate() into the slack created by scale(zoom): at zoom z the scaled
 * image extends (z-1)/2 of the box beyond every edge, so a full posX swing
 * (0↔100) maps to exactly that much translate — pan works on BOTH axes with
 * no gaps at the extremes.
 */
export function imageSlotStyle(
  slot: HomepageImageSlotAdjust | undefined
): React.CSSProperties | undefined {
  const hasPos = slot?.posX !== undefined || slot?.posY !== undefined;
  const z = slot?.zoom && slot.zoom > 1 ? slot.zoom : 1;
  if (!hasPos && z === 1) return undefined;

  const px = slot?.posX ?? 50;
  const py = slot?.posY ?? 50;
  const style: React.CSSProperties = {
    objectPosition: `${px}% ${py}%`,
    transformOrigin: 'center',
  };
  if (z > 1) {
    // % of the element's own box; (50-pos)/50 ∈ [-1, 1] scaled to the zoom slack.
    const slack = ((z - 1) / 2) * 100;
    const tx = ((50 - px) / 50) * slack;
    const ty = ((50 - py) / 50) * slack;
    style.transform = `translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}%) scale(${z})`;
  }
  return style;
}

/**
 * Resolve a per-slot image override for the Obsidian homepage. Returns the
 * effective `src` (override URL when set, otherwise the catalog fallback) and an
 * inline `style` for framing (objectPosition + zoom/pan). When the slot has no
 * pos/zoom adjustments the `style` is `undefined` so the element renders exactly
 * as before (zero visual change).
 */
export function resolveImageSlot(
  slots: Record<string, HomepageImageSlotAdjust> | undefined,
  key: string,
  fallbackUrl: string
): { src: string; style: React.CSSProperties | undefined } {
  const slot = slots?.[key];
  const src = slot?.url?.trim() || fallbackUrl;
  return { src, style: imageSlotStyle(slot) };
}

export function emptyImageSlot(
  imageHint = '',
  bgClass: CategoryColorClass = 'bg-maroon'
): HomepageImageSlot {
  return { url: '', caption: '', alt: '', imageHint, bgClass };
}

export function ensureImageSlots(
  slots: HomepageImageSlot[] | undefined,
  count: number,
  hints: string[],
  bgClasses: CategoryColorClass[] = []
): HomepageImageSlot[] {
  const out: HomepageImageSlot[] = [];
  for (let i = 0; i < count; i++) {
    const prev = slots?.[i];
    out.push({
      url: prev?.url ?? '',
      caption: prev?.caption ?? '',
      alt: prev?.alt ?? '',
      imageHint: prev?.imageHint || hints[i] || '',
      bgClass: prev?.bgClass ?? bgClasses[i] ?? 'bg-maroon',
    });
  }
  return out;
}

export function patchImageSlot(
  slots: HomepageImageSlot[],
  index: number,
  patch: Partial<HomepageImageSlot>,
  defaultHint = ''
): HomepageImageSlot[] {
  const next = [...slots];
  while (next.length <= index) {
    next.push(emptyImageSlot(defaultHint));
  }
  next[index] = { ...next[index], ...patch };
  return next;
}
