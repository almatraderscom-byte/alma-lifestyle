import type React from 'react';
import type {
  CategoryColorClass,
  HomepageImageSlot,
  HomepageImageSlotAdjust,
} from '@/lib/homepage-config-types';

export type { HomepageImageSlot };

/**
 * Resolve a per-slot image override for the Obsidian homepage. Returns the
 * effective `src` (override URL when set, otherwise the catalog fallback) and an
 * inline `style` for framing (objectPosition + zoom). When the slot has no
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
  const hasPos = slot?.posX !== undefined || slot?.posY !== undefined;
  const hasZoom = slot?.zoom !== undefined && slot.zoom !== 1;
  if (!hasPos && !hasZoom) {
    return { src, style: undefined };
  }
  return {
    src,
    style: {
      objectPosition: `${slot?.posX ?? 50}% ${slot?.posY ?? 50}%`,
      transform: slot?.zoom && slot.zoom !== 1 ? `scale(${slot.zoom})` : undefined,
      transformOrigin: 'center',
    },
  };
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
