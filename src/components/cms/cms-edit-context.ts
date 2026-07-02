'use client';

import { createContext, useContext } from 'react';

/**
 * Shared context for the Elementor-style visual editor. Both the murda landing
 * page provider ({@link CmsEditProvider}) and the homepage provider
 * ({@link HomeCmsEditProvider}) publish this same shape, so a single
 * {@link CmsEditLayer} can drive either surface.
 *
 * `content` is intentionally typed as `unknown` — the layer only ever touches it
 * through `getField`/`setField` (dot-path access), so it stays surface-agnostic.
 */
export interface CmsEditContextValue {
  /** URL requested edit mode (`?edit=1`). */
  active: boolean;
  /** Admin session confirmed. */
  isAdmin: boolean;
  /** active && isAdmin — the layer only interacts when this is true. */
  editing: boolean;
  dirty: boolean;
  saving: boolean;
  savedAt: number | null;
  error: string | null;
  content: unknown;
  /** Where uploaded images land (Supabase folder + bucket). */
  uploadConfig: { folder: string; bucket: string };
  getField: (path: string) => unknown;
  setField: (path: string, value: unknown) => void;
  save: () => Promise<void>;
  discard: () => void;
}

export const CmsEditContext = createContext<CmsEditContextValue | null>(null);

export function useCmsEdit(): CmsEditContextValue | null {
  return useContext(CmsEditContext);
}
