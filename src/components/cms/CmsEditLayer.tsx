'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useCmsEdit } from '@/components/cms/cms-edit-context';

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

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

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
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

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

  // The image currently shown on the page for the selected slot — used as the
  // image-adjust preview source when no explicit url override is set. Read once
  // per selection. MUST stay above the early returns below (Rules of Hooks):
  // non-admin renders return early with fewer hooks, and a hook that only
  // executes once editing turns on crashes React with "Rendered more hooks
  // than during the previous render" — taking the whole page down.
  const fallbackSrc = useMemo(() => {
    if (!selection) return '';
    const img =
      selection.el instanceof HTMLImageElement
        ? selection.el
        : selection.el.querySelector('img');
    return img?.currentSrc || img?.src || '';
  }, [selection]);

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
  // A field can declare `data-cms-type="number"` so it stays editable even when
  // its current value is empty/undefined (e.g. an optional compare-at price the
  // owner wants to add). Clearing the box writes `undefined`.
  const isNumberField = selection?.fieldType === 'number';
  const isImageAdjust = selection?.fieldType === 'image-adjust';
  const numericInput = isNumber || isNumberField;
  const editable = isString || isNumber || isNumberField;

  // ---- image-adjust: focal-point / zoom editor for homepage image slots ----
  // Value shape: { url?, posX?, posY?, zoom? } | undefined. posX/posY are
  // objectPosition percentages (0–100, default 50), zoom is a scale (default 1).
  const slot = (typeof rawValue === 'object' && rawValue !== null ? rawValue : {}) as {
    url?: string;
    posX?: number;
    posY?: number;
    zoom?: number;
  };

  const patchSlot = (next: Partial<typeof slot>) => {
    if (!selection) return;
    cms.setField(selection.path, { ...slot, ...next });
    requestAnimationFrame(syncSelRect);
  };

  const previewSrc = slot.url || fallbackSrc;

  const onPreviewPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: slot.posX ?? 50,
      startPosY: slot.posY ?? 50,
    };
    setDragging(true);
  };

  const onPreviewPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const box = previewRef.current;
    if (!d || !box) return;
    const w = box.clientWidth || 1;
    const h = box.clientHeight || 1;
    // Image-follows-mouse: dragging the photo right reveals more of its LEFT
    // side, which means objectPosition X decreases. Same logic vertically.
    const posX = clamp(d.startPosX - ((e.clientX - d.startX) / w) * 100, 0, 100);
    const posY = clamp(d.startPosY - ((e.clientY - d.startY) / h) * 100, 0, 100);
    patchSlot({ posX, posY });
  };

  const onPreviewPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  const commit = (raw: string) => {
    if (!selection) return;
    let next: unknown = raw;
    if (numericInput) {
      const trimmed = raw.trim();
      const n = Number(trimmed);
      next = trimmed === '' || !Number.isFinite(n) ? undefined : n;
    }
    cms.setField(selection.path, next);
    requestAnimationFrame(syncSelRect);
  };

  const uploadFile = async (file: File) => {
    if (!selection) return;
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', cms.uploadConfig.folder);
      form.append('bucket', cms.uploadConfig.bucket);
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
      if (selection.fieldType === 'image-adjust') {
        const cur = cms.getField(selection.path);
        const base = (typeof cur === 'object' && cur !== null ? cur : {}) as Record<string, unknown>;
        cms.setField(selection.path, { ...base, url: body.data.url });
      } else {
        cms.setField(selection.path, body.data.url);
      }
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
          ) : isImageAdjust ? (
            <div>
              <div
                ref={previewRef}
                onPointerDown={onPreviewPointerDown}
                onPointerMove={onPreviewPointerMove}
                onPointerUp={onPreviewPointerUp}
                onPointerCancel={onPreviewPointerUp}
                style={{
                  position: 'relative',
                  width: 288,
                  maxWidth: '100%',
                  aspectRatio: '3 / 4',
                  overflow: 'hidden',
                  borderRadius: 10,
                  background: '#0b0a12',
                  border: '1px solid rgba(255,255,255,0.12)',
                  cursor: dragging ? 'grabbing' : 'grab',
                  touchAction: 'none',
                  userSelect: 'none',
                }}
              >
                {previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSrc}
                    alt="Adjust preview"
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: `${slot.posX ?? 50}% ${slot.posY ?? 50}%`,
                      transform: `scale(${slot.zoom ?? 1})`,
                      pointerEvents: 'none',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      fontSize: 12,
                      opacity: 0.6,
                    }}
                  >
                    No image set.
                  </div>
                )}
              </div>

              <p style={{ fontSize: 12, opacity: 0.7, margin: '8px 0 0' }}>
                ছবিটি টেনে সরান — গুরুত্বপূর্ণ অংশ মাঝে আনুন
              </p>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                  Zoom {(slot.zoom ?? 1).toFixed(1)}×
                </div>
                <input
                  type="range"
                  min={1}
                  max={2.5}
                  step={0.05}
                  value={slot.zoom ?? 1}
                  onChange={(e) => patchSlot({ zoom: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: OUTLINE_COLOR }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  style={ghostBtnStyle}
                  onClick={() =>
                    cms.setField(selection.path, {
                      ...slot,
                      posX: undefined,
                      posY: undefined,
                      zoom: undefined,
                    })
                  }
                >
                  Reset position
                </button>
                <label
                  style={{
                    ...primaryBtnStyle,
                    textAlign: 'center',
                    cursor: uploading ? 'default' : 'pointer',
                    opacity: uploading ? 0.6 : 1,
                  }}
                >
                  {uploading ? 'Uploading…' : 'Upload / replace'}
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
              </div>
              {uploadError && (
                <p style={{ color: '#ff6b6b', fontSize: 12, margin: '8px 0 0' }}>{uploadError}</p>
              )}
              <input
                type="text"
                value={slot.url ?? ''}
                onChange={(e) => patchSlot({ url: e.target.value || undefined })}
                placeholder="or paste an image URL"
                style={{ ...textareaStyle, marginTop: 10, resize: 'none' }}
              />
            </div>
          ) : editable ? (
            <textarea
              autoFocus
              value={
                numericInput
                  ? typeof rawValue === 'number'
                    ? String(rawValue)
                    : ''
                  : (rawValue as string) ?? ''
              }
              onChange={(e) => commit(e.target.value)}
              rows={numericInput ? 1 : 5}
              inputMode={numericInput ? 'numeric' : undefined}
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
