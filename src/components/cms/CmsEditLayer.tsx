'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useCmsEdit } from '@/components/cms/CmsEditProvider';

/**
 * The visual editing chrome laid over the live page. Rendered only when
 * `?edit=1` is present. When an admin session is confirmed it lets the user:
 *   - hover any `[data-cms-field]` element to see an outline + label,
 *   - click it to open a side panel and edit the underlying CMS field,
 *   - Save / Discard / Exit from a floating toolbar.
 *
 * When the visitor is not an admin it shows only a small "log in to edit"
 * prompt and never mutates the page.
 */

interface Selection {
  path: string;
  label: string;
  el: HTMLElement;
  /** `data-cms-type` on the element, e.g. "image". Defaults to text/number. */
  fieldType: string;
}

const OUTLINE_COLOR = '#7c5cff';
const Z = 2_147_483_000;

function rectOf(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function CmsEditLayer() {
  const cms = useCmsEdit();
  const [hoverRect, setHoverRect] = useState<ReturnType<typeof rectOf> | null>(null);
  const [hoverLabel, setHoverLabel] = useState('');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [selRect, setSelRect] = useState<ReturnType<typeof rectOf> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const editing = cms?.editing ?? false;

  const labelFor = (el: HTMLElement, path: string) =>
    el.getAttribute('data-cms-label') || path.split('.').slice(-1)[0];

  // Keep the selected element's outline aligned as the page scrolls/resizes.
  const syncSelRect = useCallback(() => {
    setSelection((sel) => {
      if (sel) setSelRect(rectOf(sel.el));
      return sel;
    });
  }, []);

  useLayoutEffect(() => {
    setUploadError(null);
    if (!selection) {
      setSelRect(null);
      return;
    }
    setSelRect(rectOf(selection.el));
  }, [selection]);

  useEffect(() => {
    if (!editing) return;
    const onScroll = () => syncSelRect();
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', onScroll);
    };
  }, [editing, syncSelRect]);

  // Hover + click wiring on tagged elements.
  useEffect(() => {
    if (!editing) return;

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cms-field]');
      if (!el || panelRef.current?.contains(el)) {
        setHoverRect(null);
        return;
      }
      setHoverRect(rectOf(el));
      setHoverLabel(labelFor(el, el.getAttribute('data-cms-field') || ''));
    };

    const onOut = (e: MouseEvent) => {
      const to = e.relatedTarget as HTMLElement | null;
      if (!to?.closest?.('[data-cms-field]')) setHoverRect(null);
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (panelRef.current?.contains(target)) return; // clicks inside the editor UI
      const el = target?.closest<HTMLElement>('[data-cms-field]');
      if (!el) return;
      // Intercept so editable links/buttons don't navigate or submit while editing.
      e.preventDefault();
      e.stopPropagation();
      const path = el.getAttribute('data-cms-field') || '';
      const fieldType = el.getAttribute('data-cms-type') || 'text';
      setSelection({ path, label: labelFor(el, path), el, fieldType });
      setHoverRect(null);
    };

    document.addEventListener('mouseover', onOver, true);
    document.addEventListener('mouseout', onOut, true);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('mouseover', onOver, true);
      document.removeEventListener('mouseout', onOut, true);
      document.removeEventListener('click', onClick, true);
    };
  }, [editing, syncSelRect]);

  // ---- Not an admin: minimal prompt only ----
  if (cms && cms.active && !cms.isAdmin) {
    const next = typeof window !== 'undefined' ? window.location.pathname : '/';
    return (
      <div style={toolbarStyle}>
        <span style={{ fontSize: 13, opacity: 0.85 }}>Edit mode needs an admin login.</span>
        <a href={`/admin/login?next=${encodeURIComponent(next)}`} style={primaryBtnStyle}>
          Log in
        </a>
      </div>
    );
  }

  if (!cms || !editing) return null;

  const rawValue = selection ? cms.getField(selection.path) : undefined;
  const isString = typeof rawValue === 'string';
  const isNumber = typeof rawValue === 'number';
  const editable = isString || isNumber;

  const commit = (raw: string) => {
    if (!selection) return;
    cms.setField(selection.path, isNumber ? Number(raw) : raw);
    requestAnimationFrame(syncSelRect);
  };

  const uploadFile = async (file: File) => {
    if (!selection) return;
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'murda-moshari');
      form.append('bucket', 'product-images');
      form.append('mediaType', 'image');
      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        credentials: 'same-origin',
        body: form,
      });
      const body = (await res.json().catch(() => null)) as
        | { status: 'success'; data: { url: string } }
        | { status: 'error'; error: string }
        | null;
      if (!res.ok || !body || body.status !== 'success') {
        setUploadError(
          body && body.status === 'error' ? body.error : `Upload failed (${res.status})`
        );
        return;
      }
      cms.setField(selection.path, body.data.url);
      requestAnimationFrame(syncSelRect);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* hover outline */}
      {hoverRect && (
        <div style={outlineStyle(hoverRect, false)}>
          <span style={labelChipStyle}>{hoverLabel}</span>
        </div>
      )}

      {/* selected outline */}
      {selRect && <div style={outlineStyle(selRect, true)} />}

      {/* side editor panel */}
      {selection && (
        <div ref={panelRef} style={panelStyle}>
          <div style={panelHeadStyle}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.55 }}>EDITING</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{selection.label}</div>
              <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>{selection.path}</div>
            </div>
            <button style={iconBtnStyle} onClick={() => setSelection(null)} aria-label="Close">
              ×
            </button>
          </div>

          {selection.fieldType === 'image' ? (
            <div>
              {typeof rawValue === 'string' && rawValue ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={rawValue}
                  alt="Current"
                  style={{
                    width: '100%',
                    height: 140,
                    objectFit: 'contain',
                    background: '#0b0a12',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                />
              ) : (
                <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>No image set.</div>
              )}
              <label style={{ ...primaryBtnStyle, display: 'block', textAlign: 'center', marginTop: 10, cursor: uploading ? 'default' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
                {uploading ? 'Uploading…' : 'Upload / replace image'}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadFile(f);
                    e.target.value = '';
                  }}
                />
              </label>
              {uploadError && (
                <p style={{ color: '#ff6b6b', fontSize: 12, margin: '8px 0 0' }}>{uploadError}</p>
              )}
              <input
                type="text"
                value={typeof rawValue === 'string' ? rawValue : ''}
                onChange={(e) => commit(e.target.value)}
                placeholder="or paste an image URL / path"
                style={{ ...textareaStyle, marginTop: 10, resize: 'none' }}
              />
            </div>
          ) : editable ? (
            <textarea
              autoFocus
              value={isNumber ? String(rawValue) : (rawValue as string) ?? ''}
              onChange={(e) => commit(e.target.value)}
              rows={isNumber ? 1 : 5}
              inputMode={isNumber ? 'numeric' : undefined}
              style={textareaStyle}
            />
          ) : (
            <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>
              This element isn&apos;t a simple text/number field yet. Richer editing (lists,
              styles) is coming in the next phase.
            </p>
          )}
        </div>
      )}

      {/* floating toolbar */}
      <div style={toolbarStyle}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: cms.dirty ? '#f5a623' : '#22c55e' }} />
          {cms.saving
            ? 'Saving…'
            : cms.dirty
              ? 'Unsaved changes'
              : cms.savedAt
                ? 'Saved'
                : 'Live edit'}
        </span>
        {cms.error && <span style={{ color: '#ff6b6b', fontSize: 12 }}>{cms.error}</span>}
        <button
          style={{ ...ghostBtnStyle, opacity: cms.dirty ? 1 : 0.4 }}
          disabled={!cms.dirty || cms.saving}
          onClick={cms.discard}
        >
          Discard
        </button>
        <button
          style={{ ...primaryBtnStyle, opacity: cms.dirty && !cms.saving ? 1 : 0.5 }}
          disabled={!cms.dirty || cms.saving}
          onClick={() => void cms.save()}
        >
          Save
        </button>
        <a href={typeof window !== 'undefined' ? window.location.pathname : '/'} style={ghostBtnStyle}>
          Exit
        </a>
      </div>
    </>
  );
}

/* ---------- inline styles (self-contained; no obsidian.css dependency) ---------- */

function outlineStyle(
  r: { top: number; left: number; width: number; height: number },
  solid: boolean
): React.CSSProperties {
  return {
    position: 'fixed',
    top: r.top - 2,
    left: r.left - 2,
    width: r.width + 4,
    height: r.height + 4,
    border: `2px ${solid ? 'solid' : 'dashed'} ${OUTLINE_COLOR}`,
    borderRadius: 6,
    boxShadow: solid ? `0 0 0 4px ${OUTLINE_COLOR}22` : 'none',
    pointerEvents: 'none',
    zIndex: Z,
  };
}

const labelChipStyle: React.CSSProperties = {
  position: 'absolute',
  top: -22,
  left: -2,
  background: OUTLINE_COLOR,
  color: '#fff',
  fontSize: 11,
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 5,
  whiteSpace: 'nowrap',
};

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  top: 16,
  right: 16,
  width: 320,
  maxWidth: 'calc(100vw - 32px)',
  background: '#14131c',
  color: '#eef',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 14,
  padding: 16,
  boxShadow: '0 24px 60px -20px rgba(0,0,0,0.8)',
  zIndex: Z + 2,
  fontFamily: 'system-ui, sans-serif',
};

const panelHeadStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 12,
  gap: 8,
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  background: '#0b0a12',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 14,
  lineHeight: 1.5,
  resize: 'vertical',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const toolbarStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  background: '#14131c',
  color: '#eef',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 999,
  padding: '10px 16px',
  boxShadow: '0 24px 60px -20px rgba(0,0,0,0.8)',
  zIndex: Z + 2,
  fontFamily: 'system-ui, sans-serif',
};

const primaryBtnStyle: React.CSSProperties = {
  background: OUTLINE_COLOR,
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  padding: '7px 16px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  textDecoration: 'none',
};

const ghostBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#eef',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 999,
  padding: '7px 14px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
};

const iconBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#eef',
  border: 'none',
  fontSize: 22,
  lineHeight: 1,
  cursor: 'pointer',
  padding: 0,
};
