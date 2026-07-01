'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AdminProduct } from '@/lib/admin-store';
import type { CatalogProduct } from '@/lib/products-data';
import { getByPath, setByPath } from '@/lib/cms/object-path';
import {
  CmsEditContext,
  type CmsEditContextValue,
} from '@/components/cms/cms-edit-context';
import { CmsEditLayer } from '@/components/cms/CmsEditLayer';
import { ObsidianProductDetail } from './ObsidianProductDetail';

/**
 * Elementor-style visual editor for the regular product detail page (PDP).
 *
 * The PDP renders from a {@link CatalogProduct}, but the product write API
 * (`PATCH /api/v1/products/[id]`) round-trips the richer {@link AdminProduct}
 * shape. So this provider keeps two working copies:
 *   - `display`  — the CatalogProduct the PDP renders (updated live as fields
 *     change, so the owner sees edits instantly);
 *   - `admin`    — the full AdminProduct fetched via `GET /api/v1/products/[id]`
 *     when edit mode opens, which is what we PATCH back (so no other product
 *     fields are lost on save).
 *
 * `[data-cms-field]` paths use the AdminProduct field names (`title`,
 * `priceBdt`, `description`); {@link FIELD_TO_DISPLAY} mirrors each edit into the
 * matching CatalogProduct field for the live preview.
 *
 * With `?edit` absent this is a transparent pass-through: it just renders the
 * PDP with the server data and mounts nothing.
 */

const UPLOAD_CONFIG = { folder: 'products', bucket: 'product-images' };

/** AdminProduct field -> CatalogProduct field, for the live display mirror. */
const FIELD_TO_DISPLAY: Record<string, keyof CatalogProduct> = {
  title: 'title',
  description: 'description',
  priceBdt: 'price',
  compareAtPriceBdt: 'compareAtPrice',
};

/**
 * Seed an editable working copy from the display product so the tagged fields
 * are editable immediately, before the full AdminProduct GET resolves.
 */
function seedFromDisplay(display: CatalogProduct): Record<string, unknown> {
  return {
    title: display.title,
    description: display.description,
    priceBdt: display.price,
    compareAtPriceBdt: display.compareAtPrice,
  };
}

/**
 * Scalar fields safe to re-apply over the freshly-fetched AdminProduct after the
 * GET resolves (these can be edited before the full record loads).
 */
const SCALAR_KEYS = Object.keys(FIELD_TO_DISPLAY);

/**
 * Every field the PATCH payload should carry from the working copy. `images`
 * only becomes meaningful after the full AdminProduct GET has populated it, so
 * it is *not* in {@link SCALAR_KEYS} — we never re-apply a half-built images
 * array over the fetched record.
 */
const SAVE_KEYS = [...SCALAR_KEYS, 'images'];

/** Keep only the given keys (that are defined) from a working copy. */
function pick(working: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    if (working[key] !== undefined) out[key] = working[key];
  }
  return out;
}

/** `images.<n>.url` — the dot-path a tagged gallery image edits. */
const IMAGE_URL_PATH = /^images\.(\d+)\.url$/;

export interface ProductCmsEditProviderProps {
  product: CatalogProduct;
  catalogProducts?: CatalogProduct[];
}

export function ProductCmsEditProvider({
  product,
  catalogProducts = [],
}: ProductCmsEditProviderProps) {
  const [display, setDisplay] = useState<CatalogProduct>(product);
  const [working, setWorking] = useState<Record<string, unknown>>(() => seedFromDisplay(product));
  const [fullAdmin, setFullAdmin] = useState<AdminProduct | null>(null);
  const [active, setActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const baselineDisplayRef = useRef<CatalogProduct>(product);
  const baselineWorkingRef = useRef<Record<string, unknown>>(seedFromDisplay(product));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const val = params.get('edit');
    setActive(val === '1' || val === 'true');
  }, []);

  // Re-sync with fresh server data unless the owner has unsaved edits.
  useEffect(() => {
    if (dirty) return;
    setDisplay(product);
    const seed = seedFromDisplay(product);
    setWorking(seed);
    baselineDisplayRef.current = product;
    baselineWorkingRef.current = seed;
  }, [product, dirty]);

  useEffect(() => {
    if (!active) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    fetch('/api/v1/admin/auth/me', { credentials: 'same-origin' })
      .then((res) => {
        if (!cancelled) setIsAdmin(res.ok);
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  const editing = active && isAdmin;

  // Load the full AdminProduct once editing is confirmed, so PATCH preserves
  // every field. Edited values (if any) are re-applied over the fetched record.
  useEffect(() => {
    if (!editing || fullAdmin) return;
    let cancelled = false;
    fetch(`/api/v1/products/${encodeURIComponent(product.id)}`, {
      credentials: 'same-origin',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { status?: string; data?: AdminProduct } | null) => {
        if (cancelled || !body || body.status !== 'success' || !body.data) {
          if (!cancelled)
            setError('Could not load full product for editing — save is disabled.');
          return;
        }
        setFullAdmin(body.data);
        setWorking((prev) => {
          const merged = { ...(body.data as unknown as Record<string, unknown>), ...pick(prev, SCALAR_KEYS) };
          baselineWorkingRef.current = { ...(body.data as unknown as Record<string, unknown>) };
          return merged;
        });
      })
      .catch(() => {
        if (!cancelled) setError('Could not load full product for editing — save is disabled.');
      });
    return () => {
      cancelled = true;
    };
  }, [editing, fullAdmin, product.id]);

  const getField = useCallback((path: string) => getByPath(working, path), [working]);

  const setField = useCallback((path: string, value: unknown) => {
    setWorking((prev) => setByPath(prev, path, value));
    const displayKey = FIELD_TO_DISPLAY[path];
    if (displayKey) {
      setDisplay((prev) => ({ ...prev, [displayKey]: value }) as CatalogProduct);
    }
    // Mirror an image URL edit into the matching display gallery slot so the
    // owner sees the new photo instantly (working uses AdminProduct.images,
    // display uses CatalogProduct.images — same order, matched by index).
    const imageMatch = IMAGE_URL_PATH.exec(path);
    if (imageMatch && typeof value === 'string') {
      const idx = Number(imageMatch[1]);
      setDisplay((prev) => {
        if (!prev.images?.[idx]) return prev;
        const images = prev.images.map((img, i) =>
          i === idx ? { ...img, url: value } : img
        );
        return { ...prev, images } as CatalogProduct;
      });
    }
    setDirty(true);
    setSavedAt(null);
    setError(null);
  }, []);

  const discard = useCallback(() => {
    setDisplay(baselineDisplayRef.current);
    setWorking(baselineWorkingRef.current);
    setDirty(false);
    setError(null);
  }, []);

  const save = useCallback(async () => {
    if (!fullAdmin) {
      setError('Product is still loading — please try again in a moment.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: AdminProduct = { ...fullAdmin, ...pick(working, SAVE_KEYS) } as AdminProduct;
      const res = await fetch(`/api/v1/products/${encodeURIComponent(product.id)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => null)) as
        | { status: 'success'; data: AdminProduct }
        | { status: 'error'; error: string }
        | null;
      if (!res.ok || !body || body.status !== 'success') {
        setError(body && body.status === 'error' ? body.error : `Save failed (${res.status})`);
        return;
      }
      setFullAdmin(body.data);
      const saved = body.data as unknown as Record<string, unknown>;
      setWorking(saved);
      baselineWorkingRef.current = { ...saved };
      baselineDisplayRef.current = display;
      setDirty(false);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [fullAdmin, working, product.id, display]);

  const value = useMemo<CmsEditContextValue>(
    () => ({
      active,
      isAdmin,
      editing,
      dirty,
      saving,
      savedAt,
      error,
      content: working,
      uploadConfig: UPLOAD_CONFIG,
      getField,
      setField,
      save,
      discard,
    }),
    [active, isAdmin, editing, dirty, saving, savedAt, error, working, getField, setField, save, discard]
  );

  return (
    <CmsEditContext.Provider value={value}>
      <ObsidianProductDetail product={display} catalogProducts={catalogProducts} />
      {active ? <CmsEditLayer /> : null}
    </CmsEditContext.Provider>
  );
}
