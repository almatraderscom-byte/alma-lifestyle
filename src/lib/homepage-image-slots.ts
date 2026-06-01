import type { CategoryColorClass, HomepageImageSlot } from '@/lib/homepage-config-types';

export type { HomepageImageSlot };

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
