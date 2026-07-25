import type { Metadata } from 'next';
import type { CatalogProduct } from '@/lib/products-data';
import { absoluteUrl } from '@/lib/seo/site-url';

/**
 * Google truncates a title around 60 characters and a description around 160.
 * Live audit 2026-07-25 found product titles at 88-136 characters and one meta
 * description at 583 — everything past the cut is invisible to a searcher, and a
 * description that long reads as boilerplate to the ranker.
 *
 * Cutting at a WORD boundary matters here: these strings are Bangla, and a hard
 * slice can land inside a conjunct and render as a broken glyph.
 */
export function truncateAtWord(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

/** Title budget once the root layout appends " | ALMA Lifestyle" (17 chars). */
const TITLE_MAX = 45;
const DESCRIPTION_MAX = 155;

function productImageUrl(product: CatalogProduct): string {
  const raw = product.galleryImages?.[0]?.url ?? product.images?.[0]?.url;
  if (!raw) return '/og-image-default.jpg';
  return raw.startsWith('http') ? raw : raw;
}

export function buildProductPageMetadata(
  product: CatalogProduct,
  slug: string
): Metadata {
  const priceText = `৳ ${product.price.toLocaleString('bn-BD')}`;
  const shortDesc = truncateAtWord(
    product.description?.trim()
      || `${product.title} ALMA Lifestyle থেকে। ${priceText}. ক্যাশ অন ডেলিভারি সারাদেশে।`,
    DESCRIPTION_MAX
  );
  const imageUrl = productImageUrl(product);

  // No store name here — the root layout's title template appends it. Adding it
  // again is what produced "… | Alma Lifestyle | ALMA Lifestyle" on every
  // product page.
  return {
    title: truncateAtWord(`${product.title} — ${priceText}`, TITLE_MAX),
    description: shortDesc,
    openGraph: {
      title: product.title,
      description: shortDesc,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: product.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: shortDesc,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/products/${slug}`,
    },
  };
}

export function buildProductNotFoundMetadata(): Metadata {
  return { title: 'পণ্য খুঁজে পাওয়া যায়নি | ALMA Lifestyle' };
}

export { absoluteUrl };
