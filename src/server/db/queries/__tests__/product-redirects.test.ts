/**
 * A renamed product must not take its old URL's ranking down with it.
 *
 * Until 2026-07-27 this storefront had no redirect of any kind, so a slug rename
 * meant an instant 404 on the old path. These tests pin the three things that
 * make the new resolver safe to put in front of every product 404: it follows a
 * chain, it survives a loop, and a database failure is silently "no redirect"
 * rather than a broken page.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';

const rows = new Map<string, string>();
let failNext = false;

vi.mock('../../client', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      select: () => ({
        eq: (_col: string, value: string) => ({
          maybeSingle: async () =>
            failNext
              ? { data: null, error: { message: 'relation does not exist' } }
              : { data: rows.has(value) ? { to_slug: rows.get(value) } : null, error: null },
        }),
        // The fallback scan: every row, compared on equal terms.
        limit: async () =>
          failNext
            ? { data: null, error: { message: 'relation does not exist' } }
            : {
                data: [...rows].map(([from_slug, to_slug]) => ({ from_slug, to_slug })),
                error: null,
              },
      }),
    }),
  }),
}));

const { resolveProductRedirect } = await import('../product-redirects');

beforeEach(() => {
  rows.clear();
  failNext = false;
});

describe('resolveProductRedirect', () => {
  it('returns null when nothing was ever renamed — today’s 404 stays a 404', async () => {
    expect(await resolveProductRedirect('some-product')).toBeNull();
  });

  it('resolves a single rename', async () => {
    rows.set('old-slug', 'new-slug');
    expect(await resolveProductRedirect('old-slug')).toBe('new-slug');
  });

  it('follows a chain of renames to the final slug', async () => {
    rows.set('a', 'b');
    rows.set('b', 'c');
    expect(await resolveProductRedirect('a')).toBe('c');
  });

  it('refuses to hang on a loop', async () => {
    rows.set('a', 'b');
    rows.set('b', 'a');
    expect(await resolveProductRedirect('a')).toBeNull();
  });

  it('treats a database failure as no redirect, never as an error', async () => {
    rows.set('old-slug', 'new-slug');
    failNext = true;
    expect(await resolveProductRedirect('old-slug')).toBeNull();
  });

  it('ignores blank input', async () => {
    expect(await resolveProductRedirect('   ')).toBeNull();
  });

  // The live failure of 2026-07-27: the table was right and the resolver still
  // 404ed. "boier" is the word; য় has two spellings that look identical — one
  // codepoint (U+09DF) or য + nukta (U+09AF U+09BC). Written as escapes so no
  // editor can normalise these tests into passing by accident.
  const PRECOMPOSED = '\u09AC\u0987\u09DF\u09C7\u09B0';
  const DECOMPOSED = '\u09AC\u0987\u09AF\u09BC\u09C7\u09B0';

  it('matches a stored slug whose nukta letter is precomposed (U+09DF)', async () => {
    // U+09DF is on Unicode's composition exclusion list: NFC will never rebuild
    // it, so normalising the incoming link cannot reach the stored row.
    expect(PRECOMPOSED).not.toBe(DECOMPOSED);
    expect(PRECOMPOSED.normalize('NFC')).not.toBe(PRECOMPOSED);
    rows.set(PRECOMPOSED, 'islamic-7-book-combo-package');
    expect(await resolveProductRedirect(DECOMPOSED)).toBe('islamic-7-book-combo-package');
  });

  it('matches when the database holds the decomposed spelling instead', async () => {
    rows.set(DECOMPOSED, 'islamic-7-book-combo-package');
    expect(await resolveProductRedirect(PRECOMPOSED)).toBe('islamic-7-book-combo-package');
  });
});
