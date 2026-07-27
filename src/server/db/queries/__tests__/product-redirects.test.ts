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
});
