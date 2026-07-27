/**
 * The redirect has to be a real 308, and only middleware can issue one — a
 * statically generated product page can offer nothing better than a 200 with a
 * meta refresh. These tests pin what middleware asks for and when.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { resolveMovedProductSlug } from '../moved-product';

const OLD_SLUG = 'ইসলামিক ৭টি বইয়ের কম্বো প্যাকেজ Product Code: 7-b';
const NEW_SLUG = 'islamic-7-book-combo-package';

const rows = new Map<string, string>();
let calls: string[] = [];
let failWith: 'network' | 'status' | null = null;

beforeEach(() => {
  rows.clear();
  calls = [];
  failWith = null;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

  vi.stubGlobal('fetch', async (input: string) => {
    calls.push(input);
    if (failWith === 'network') throw new Error('edge fetch failed');
    if (failWith === 'status') return { ok: false, json: async () => [] } as unknown as Response;

    const match = /from_slug=eq\.([^&]+)/.exec(input);
    if (!match) {
      // The fallback scan: hand back the whole (tiny) table.
      return {
        ok: true,
        json: async () => [...rows].map(([from_slug, to_slug]) => ({ from_slug, to_slug })),
      } as unknown as Response;
    }
    const asked = decodeURIComponent(match[1]);
    const to = rows.get(asked);
    return {
      ok: true,
      json: async () => (to ? [{ to_slug: to }] : []),
    } as unknown as Response;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('resolveMovedProductSlug', () => {
  it('never queries for an ordinary slug — every product page stays free', async () => {
    expect(await resolveMovedProductSlug('islamic-7-book-combo-package')).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it('redirects the percent-encoded Bangla URL that started all this', async () => {
    rows.set(OLD_SLUG, NEW_SLUG);
    expect(await resolveMovedProductSlug(encodeURIComponent(OLD_SLUG))).toBe(NEW_SLUG);
  });

  it('follows a chain of renames', async () => {
    rows.set('Old Slug', 'middle-slug');
    rows.set('middle-slug', NEW_SLUG);
    expect(await resolveMovedProductSlug('Old%20Slug')).toBe(NEW_SLUG);
  });

  it('refuses to hang on a loop', async () => {
    rows.set('A B', 'C D');
    rows.set('C D', 'A B');
    expect(await resolveMovedProductSlug('A%20B')).toBeNull();
  });

  it('is silent when the lookup fails — the page answers as it would have', async () => {
    rows.set(OLD_SLUG, NEW_SLUG);
    failWith = 'network';
    expect(await resolveMovedProductSlug(encodeURIComponent(OLD_SLUG))).toBeNull();
    failWith = 'status';
    expect(await resolveMovedProductSlug(encodeURIComponent(OLD_SLUG))).toBeNull();
  });

  // The shape of the live 7-b slug: the stored spelling uses the precomposed
  // nukta letter (U+09DF), which no normalisation of the incoming link rebuilds.
  it('matches a stored slug in a Unicode form the link cannot reproduce', async () => {
    const stored = 'A \u09AC\u0987\u09DF\u09C7\u09B0 slug';
    const incoming = stored.normalize('NFC');
    expect(incoming).not.toBe(stored);
    rows.set(stored, NEW_SLUG);
    expect(await resolveMovedProductSlug(encodeURIComponent(incoming))).toBe(NEW_SLUG);
  });

  it('ignores a blank slug', async () => {
    expect(await resolveMovedProductSlug('%20%20')).toBeNull();
    expect(calls).toHaveLength(0);
  });
});
