/**
 * Immutable get/set by dot-path into a plain JSON-ish object tree.
 *
 * Paths use dot segments; numeric segments index into arrays, e.g.
 *   "hero.heading"        -> obj.hero.heading
 *   "hero.trustItems.0"   -> obj.hero.trustItems[0]
 *
 * These power the visual (Elementor-style) editor: each editable element on
 * the page is tagged with a `data-cms-field` path, and edits are applied to a
 * working copy of the CMS content object via `setByPath` before being saved
 * through the existing landing/cinematic PUT APIs.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

function parsePath(path: string): Array<string> {
  return path
    .split('.')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Read the value at `path`. Returns `undefined` if any segment is missing. */
export function getByPath(obj: unknown, path: string): unknown {
  const segments = parsePath(path);
  let cursor: unknown = obj;
  for (const seg of segments) {
    if (cursor == null || typeof cursor !== 'object') return undefined;
    cursor = (cursor as Record<string, unknown>)[seg];
  }
  return cursor;
}

/**
 * Return a NEW object with `value` written at `path`. The original is never
 * mutated — every object/array along the path is shallow-cloned so React state
 * updates are detected. Missing intermediate containers are created (as arrays
 * when the next segment is a numeric index, otherwise as objects).
 */
export function setByPath<T>(obj: T, path: string, value: unknown): T {
  const segments = parsePath(path);
  if (segments.length === 0) return obj;

  const clone = (node: unknown, nextSeg: string): unknown => {
    const nextIsIndex = /^\d+$/.test(nextSeg);
    if (Array.isArray(node)) return node.slice();
    if (node && typeof node === 'object') return { ...(node as object) };
    // No existing container — create the right shape for the next segment.
    return nextIsIndex ? [] : {};
  };

  const root = clone(obj, segments[0]) as Record<string, unknown> | unknown[];
  let cursor: Record<string, unknown> | unknown[] = root;

  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    const nextSeg = segments[i + 1];
    const existing = (cursor as Record<string, unknown>)[seg];
    const cloned = clone(existing, nextSeg);
    (cursor as Record<string, unknown>)[seg] = cloned;
    cursor = cloned as Record<string, unknown> | unknown[];
  }

  (cursor as Record<string, unknown>)[segments[segments.length - 1]] = value;
  return root as T;
}
