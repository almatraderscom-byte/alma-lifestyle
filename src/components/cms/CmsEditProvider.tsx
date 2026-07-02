'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { MurdaPageProvider } from '@/components/product/murda-moshari/MurdaPageContext';
import type { MurdaMoshariContent } from '@/lib/landing-content-types';
import { getByPath, setByPath } from '@/lib/cms/object-path';
import { CmsEditLayer } from '@/components/cms/CmsEditLayer';
import {
  CmsEditContext,
  useCmsEdit,
  type CmsEditContextValue,
} from '@/components/cms/cms-edit-context';

export { useCmsEdit };
export type { CmsEditContextValue };

/**
 * Client-side controller for the Elementor-style visual editor on the murda
 * landing page.
 *
 * It wraps the page in an editable copy of the CMS content (re-provided through
 * the existing `MurdaPageProvider`, so every section re-renders live as fields
 * change), and exposes helpers the {@link CmsEditLayer} uses to highlight
 * `[data-cms-field]` elements and edit them.
 *
 * Edit mode only activates when BOTH:
 *   1. the URL carries `?edit=1`, and
 *   2. `/api/v1/admin/auth/me` confirms an admin session.
 *
 * With `?edit` absent the provider is a transparent pass-through — no layer, no
 * listeners, no visual change — so normal visitors are completely unaffected.
 */

const UPLOAD_CONFIG = { folder: 'murda-moshari', bucket: 'product-images' };

export interface CmsEditProviderProps {
  slug: string;
  initialContent: MurdaMoshariContent;
  children: ReactNode;
}

export function CmsEditProvider({ slug, initialContent, children }: CmsEditProviderProps) {
  const [content, setContent] = useState<MurdaMoshariContent>(initialContent);
  const [active, setActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const baselineRef = useRef(initialContent);

  // Detect the ?edit=1 intent from the URL (read from window to avoid pulling
  // this deep client subtree into a Suspense/CSR bailout via useSearchParams).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const val = params.get('edit');
    setActive(val === '1' || val === 'true');
  }, []);

  // Re-sync the working copy when fresh server content arrives, but never clobber
  // unsaved edits.
  useEffect(() => {
    if (dirty) return;
    baselineRef.current = initialContent;
    setContent(initialContent);
  }, [initialContent, dirty]);

  // Confirm admin session only when edit mode was requested.
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

  const getField = useCallback((path: string) => getByPath(content, path), [content]);

  const setField = useCallback((path: string, value: unknown) => {
    setContent((prev) => setByPath(prev, path, value));
    setDirty(true);
    setSavedAt(null);
    setError(null);
  }, []);

  const discard = useCallback(() => {
    setContent(baselineRef.current);
    setDirty(false);
    setError(null);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/landing/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const body = (await res.json().catch(() => null)) as
        | { status: 'success'; data: MurdaMoshariContent }
        | { status: 'error'; error: string }
        | null;
      if (!res.ok || !body || body.status !== 'success') {
        const msg =
          body && body.status === 'error' ? body.error : `Save failed (${res.status})`;
        setError(msg);
        return;
      }
      baselineRef.current = body.data;
      setContent(body.data);
      setDirty(false);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [slug, content]);

  const value = useMemo<CmsEditContextValue>(
    () => ({
      active,
      isAdmin,
      editing,
      dirty,
      saving,
      savedAt,
      error,
      content,
      uploadConfig: UPLOAD_CONFIG,
      getField,
      setField,
      save,
      discard,
    }),
    [active, isAdmin, editing, dirty, saving, savedAt, error, content, getField, setField, save, discard]
  );

  return (
    <CmsEditContext.Provider value={value}>
      <MurdaPageProvider page={content}>
        {children}
        {active ? <CmsEditLayer /> : null}
      </MurdaPageProvider>
    </CmsEditContext.Provider>
  );
}
