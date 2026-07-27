/**
 * The bug these pin: on 2026-07-27 a product was renamed away from a Bangla
 * slug, the redirect row was written correctly — and the old URL still served a
 * 404, because `params.slug` arrives percent-encoded and every lookup compared
 * that against plain text.
 */
import { describe, expect, it } from 'vitest';
import { decodeSlugParam, slugMatchCandidates } from '../slug-param';

const OLD_SLUG = 'ইসলামিক ৭টি বইয়ের কম্বো প্যাকেজ Product Code: 7-b';

describe('decodeSlugParam', () => {
  it('leaves an ordinary slug alone', () => {
    expect(decodeSlugParam('islamic-7-book-combo-package')).toBe(
      'islamic-7-book-combo-package'
    );
  });

  it('decodes the percent-encoded form the router actually hands over', () => {
    expect(decodeSlugParam(encodeURIComponent(OLD_SLUG))).toBe(OLD_SLUG);
  });

  it('returns a malformed escape unchanged instead of throwing', () => {
    expect(decodeSlugParam('%E0%')).toBe('%E0%');
  });
});

describe('slugMatchCandidates', () => {
  it('offers one candidate when the forms are identical', () => {
    expect(slugMatchCandidates('islamic-7-book-combo-package')).toEqual([
      'islamic-7-book-combo-package',
    ]);
  });

  it('offers both Unicode forms of the same Bangla text', () => {
    const composed = OLD_SLUG.normalize('NFC');
    const candidates = slugMatchCandidates(composed);
    expect(candidates[0]).toBe(composed);
    expect(candidates).toContain(composed.normalize('NFD'));
  });
});
