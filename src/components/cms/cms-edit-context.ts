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
/**
 * A product the visual editor can pin to a slot (e.g. a hero coverflow card).
 * Kept deliberately small — just what the picker list needs to render + save.
 */
export interface CmsPickerProduct {
  id: string;
  title: string;
  imageUrl: string;
  priceText: string;
}

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
  /** Catalog products offered by `data-cms-type="product"` pickers. Optional —
   *  surfaces that have no product pickers (e.g. the murda landing) omit it. */
  products?: CmsPickerProduct[];
  getField: (path: string) => unknown;
  setField: (path: string, value: unknown) => void;
  save: () => Promise<void>;
  discard: () => void;
}

export const CmsEditContext = createContext<CmsEditContextValue | null>(null);

export function useCmsEdit(): CmsEditContextValue | null {
  return useContext(CmsEditContext);
}
