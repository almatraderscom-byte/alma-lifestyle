/**
 * SEO metadata regressions found by a live audit of production on 2026-07-25:
 * no canonical anywhere, the store name printed twice in every product title,
 * and meta descriptions of 300-583 characters.
 */
import { describe, it, expect } from 'vitest';
import { truncateAtWord, buildProductPageMetadata } from '@/lib/seo/product-metadata';
import { collapseRepeatedStoreName } from '@/lib/seo/default-metadata';
import type { CatalogProduct } from '@/lib/products-data';

const product = (over: Partial<CatalogProduct> = {}): CatalogProduct =>
  ({
    id: 'p1',
    slug: 'royal-navy-men',
    title: 'Royal Navy Premium Cotton Panjabi for Men — Eid Special Collection 2026',
    price: 3450,
    description: 'অসাধারণ মানের প্রিমিয়াম কটন পাঞ্জাবি। '.repeat(20),
    images: [{ url: 'https://cdn.example/x.jpg' }],
    galleryImages: [],
    createdAt: '2026-01-01',
    ...over,
  } as unknown as CatalogProduct);

describe('truncateAtWord', () => {
  it('leaves short text alone', () => {
    expect(truncateAtWord('ছোট টাইটেল', 60)).toBe('ছোট টাইটেল');
  });

  it('cuts at a word boundary, never mid-word', () => {
    const source = 'one two three four five six seven';
    const out = truncateAtWord(source, 20);
    expect(out.length).toBeLessThanOrEqual(21); // + the ellipsis
    expect(out.endsWith('…')).toBe(true);
    // Every word that survived is a WHOLE word of the original.
    const kept = out.slice(0, -1).trim().split(' ');
    const words = source.split(' ');
    expect(kept.every((w, i) => w === words[i])).toBe(true);
  });

  it('collapses runaway whitespace so a description cannot smuggle length in', () => {
    expect(truncateAtWord('a   \n  b', 40)).toBe('a b');
  });
});

describe('buildProductPageMetadata', () => {
  it('emits a canonical for the product — the tag production was missing entirely', () => {
    const meta = buildProductPageMetadata(product(), 'royal-navy-men');
    expect(meta.alternates?.canonical).toBe('/products/royal-navy-men');
  });

  it('does NOT repeat the store name (the root layout template appends it)', () => {
    const meta = buildProductPageMetadata(product(), 'royal-navy-men');
    expect(String(meta.title)).not.toMatch(/alma/i);
  });

  it('keeps the title inside what a search result actually shows', () => {
    const meta = buildProductPageMetadata(product(), 'royal-navy-men');
    // 45 + the " | ALMA Lifestyle" the template appends ≈ 62 visible characters.
    expect(String(meta.title).length).toBeLessThanOrEqual(46);
  });

  it('caps the meta description (production served one at 583 characters)', () => {
    const meta = buildProductPageMetadata(product(), 'royal-navy-men');
    expect(String(meta.description).length).toBeLessThanOrEqual(156);
  });

  it('falls back to a written description when the product has none', () => {
    const meta = buildProductPageMetadata(
      product({ description: '', title: 'নেভি পাঞ্জাবি' }),
      'x'
    );
    expect(String(meta.description)).toContain('ক্যাশ অন ডেলিভারি');
    expect(String(meta.description)).toContain('নেভি পাঞ্জাবি');
  });
});

describe('collapseRepeatedStoreName', () => {
  it('fixes the homepage title production actually served', () => {
    expect(collapseRepeatedStoreName('ALMA Lifestyle | ALMA Lifestyle', 'ALMA Lifestyle'))
      .toBe('ALMA Lifestyle');
  });

  it('is case-insensitive about the repeat', () => {
    expect(collapseRepeatedStoreName('Alma Lifestyle | ALMA LIFESTYLE', 'ALMA Lifestyle'))
      .toBe('Alma Lifestyle');
  });

  it('leaves a genuinely two-part title alone', () => {
    expect(collapseRepeatedStoreName('প্রিমিয়াম পাঞ্জাবি | ALMA Lifestyle', 'ALMA Lifestyle'))
      .toBe('প্রিমিয়াম পাঞ্জাবি | ALMA Lifestyle');
  });
});
