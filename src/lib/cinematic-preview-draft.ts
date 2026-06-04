import type { CinematicContent } from '@/lib/cinematic-content-types';
import { mergeCinematicContent } from '@/lib/cinematic-content-defaults';

export const CINEMATIC_DRAFT_KEY = 'alma-cinematic-draft';
export const CINEMATIC_DRAFT_EVENT = 'alma-cinematic-draft-updated';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function saveDraftCinematicContent(content: CinematicContent): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(CINEMATIC_DRAFT_KEY, JSON.stringify(content));
    window.dispatchEvent(new Event(CINEMATIC_DRAFT_EVENT));
  } catch {
    /* quota */
  }
}

export function getDraftCinematicContent(): CinematicContent | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(CINEMATIC_DRAFT_KEY);
    if (!raw) return null;
    return mergeCinematicContent(JSON.parse(raw) as CinematicContent);
  } catch {
    return null;
  }
}

export function clearDraftCinematicContent(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(CINEMATIC_DRAFT_KEY);
    window.dispatchEvent(new Event(CINEMATIC_DRAFT_EVENT));
  } catch {
    /* ignore */
  }
}
