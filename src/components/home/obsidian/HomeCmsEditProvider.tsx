'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CinematicHeroContent } from '@/lib/cinematic-content-types';
import type {
  CategoriesSectionData,
  HomepageConfig,
  ObsidianHomeCopy,
  ReviewsSectionData,
  TrustSectionData,
} from '@/lib/homepage-config-types';
import { DEFAULT_OBSIDIAN_COPY } from '@/lib/homepage-config-types';
import type { CardProduct } from '@/lib/products-data';
import { getByPath, setByPath } from '@/lib/cms/object-path';
import {
  CmsEditContext,
  type CmsEditContextValue,
  type CmsPickerProduct,
} from '@/components/cms/cms-edit-context';
import { CmsEditLayer } from '@/components/cms/CmsEditLayer';
import { ObsidianHome } from './ObsidianHome';
import { toObsidianCard } from './obsidian-data';

/**
 * Homepage counterpart to the murda {@link CmsEditProvider}. It wraps the live
 * Obsidian homepage in an editable copy of the {@link HomepageConfig}, so every
 * `[data-cms-field]` element re-renders as the owner edits it, and saves the
 * whole config back through `PUT /api/v1/homepage-config`.
 *
 * With `?edit` absent it is a transparent pass-through: it just renders
 * `ObsidianHome` with the server-provided data and mounts no listeners.
 */

const UPLOAD_CONFIG = { folder: 'homepage', bucket: 'homepage-images' };

export interface HomeCmsEditProviderProps {
  initialConfig: HomepageConfig;
  products: CardProduct[];
  hero?: CinematicHeroContent;
}

/**
 * Guarantee `obsidianCopy` is present so every copy field resolves to a real
 * string when the owner clicks it in the editor (an undefined path would render
 * the panel's "not a simple field" fallback instead of a text box).
 */
function withCopy(config: HomepageConfig): HomepageConfig {
  if (config.obsidianCopy) return config;
  return { ...config, obsidianCopy: DEFAULT_OBSIDIAN_COPY };
}

function deriveSections(config: HomepageConfig) {
  const catIndex = config.sections.findIndex((s) => s.id === 'categories');
  const reviewIndex = config.sections.findIndex((s) => s.id === 'reviews');
  const trustIndex = config.sections.findIndex((s) => s.id === 'trust');
  const categoriesSection = catIndex >= 0 ? config.sections[catIndex] : undefined;
  const reviewsSection = reviewIndex >= 0 ? config.sections[reviewIndex] : undefined;
  const trustSection = trustIndex >= 0 ? config.sections[trustIndex] : undefined;
  return {
    categories:
      categoriesSection?.id === 'categories'
        ? (categoriesSection.data as CategoriesSectionData)
        : undefined,
    reviews:
      reviewsSection?.id === 'reviews'
        ? (reviewsSection.data as ReviewsSectionData)
        : undefined,
    trust:
      trustSection?.id === 'trust'
        ? (trustSection.data as TrustSectionData)
        : undefined,
    copy: (config.obsidianCopy ?? DEFAULT_OBSIDIAN_COPY) as ObsidianHomeCopy,
    imageSlots: config.imageSlots,
    heroOverlay: config.heroOverlay,
    heroProductIds: config.heroProductIds,
    // Dot-paths into the live config so the visual editor can tag each field.
    // `undefined` when the section is absent (→ its elements stay untagged).
    categoriesPath: catIndex >= 0 ? `sections.${catIndex}.data` : undefined,
    reviewsPath: reviewIndex >= 0 ? `sections.${reviewIndex}.data` : undefined,
    trustPath: trustIndex >= 0 ? `sections.${trustIndex}.data` : undefined,
  };
}

export function HomeCmsEditProvider({
  initialConfig,
  products,
  hero,
}: HomeCmsEditProviderProps) {
  const [config, setConfig] = useState<HomepageConfig>(() => withCopy(initialConfig));
  const [active, setActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const baselineRef = useRef(withCopy(initialConfig));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const val = params.get('edit');
    setActive(val === '1' || val === 'true');
  }, []);

  // Re-sync with fresh server data unless the owner has unsaved edits.
  useEffect(() => {
    if (dirty) return;
    const next = withCopy(initialConfig);
    baselineRef.current = next;
    setConfig(next);
  }, [initialConfig, dirty]);

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

  // Flattened catalog for the hero product picker: id + the exact name/price/
  // image the coverflow would show, so the list mirrors the live card.
  const pickerProducts = useMemo<CmsPickerProduct[]>(
    () =>
      products.map((p) => {
        const card = toObsidianCard(p);
        return {
          id: card.id,
          title: card.heroTitle,
          imageUrl: card.imageUrl,
          priceText: card.priceText,
        };
      }),
    [products]
  );

  const getField = useCallback((path: string) => getByPath(config, path), [config]);

  const setField = useCallback((path: string, value: unknown) => {
    setConfig((prev) => setByPath(prev, path, value));
    setDirty(true);
    setSavedAt(null);
    setError(null);
  }, []);

  const discard = useCallback(() => {
    setConfig(baselineRef.current);
    setDirty(false);
    setError(null);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/homepage-config', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const body = (await res.json().catch(() => null)) as
        | { status: 'success'; data: HomepageConfig }
        | { status: 'error'; error: string }
        | null;
      if (!res.ok || !body || body.status !== 'success') {
        setError(body && body.status === 'error' ? body.error : `Save failed (${res.status})`);
        return;
      }
      baselineRef.current = body.data;
      setConfig(body.data);
      setDirty(false);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [config]);

  const value = useMemo<CmsEditContextValue>(
    () => ({
      active,
      isAdmin,
      editing,
      dirty,
      saving,
      savedAt,
      error,
      content: config,
      uploadConfig: UPLOAD_CONFIG,
      products: pickerProducts,
      getField,
      setField,
      save,
      discard,
    }),
    [active, isAdmin, editing, dirty, saving, savedAt, error, config, pickerProducts, getField, setField, save, discard]
  );

  const {
    categories,
    reviews,
    trust,
    copy,
    imageSlots,
    heroOverlay,
    heroProductIds,
    categoriesPath,
    reviewsPath,
    trustPath,
  } = deriveSections(config);

  return (
    <CmsEditContext.Provider value={value}>
      <ObsidianHome
        products={products}
        hero={hero}
        categories={categories}
        reviews={reviews}
        trust={trust}
        copy={copy}
        imageSlots={imageSlots}
        heroOverlay={heroOverlay}
        heroProductIds={heroProductIds}
        categoriesPath={categoriesPath}
        reviewsPath={reviewsPath}
        trustPath={trustPath}
      />
      {active ? <CmsEditLayer /> : null}
    </CmsEditContext.Provider>
  );
}
