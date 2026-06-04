import type { CardProduct } from '@/lib/products-data';
import { toCardProduct } from '@/lib/products-data';
import { loadCatalogProductsServer } from '@/lib/storefront/server-data';
import {
  CINEMATIC_CHAPTER_PRODUCTS,
  CINEMATIC_FILM_STRIP_PRODUCTS,
} from '@/lib/cinematic-config';

export async function loadCinematicChapterProducts(): Promise<(CardProduct | null)[]> {
  const { products } = await loadCatalogProductsServer({ limit: 200, page: 1 });
  return CINEMATIC_CHAPTER_PRODUCTS.map(({ productSlug }) => {
    const product = products.find((p) => p.slug === productSlug);
    return product ? toCardProduct(product) : null;
  });
}

export async function loadCinematicFilmStripProducts(): Promise<CardProduct[]> {
  const chapterSlugs = new Set<string>(CINEMATIC_CHAPTER_PRODUCTS.map((p) => p.productSlug));
  const { products } = await loadCatalogProductsServer({ limit: 200, page: 1 });

  const preferred = CINEMATIC_FILM_STRIP_PRODUCTS.map((slug) => {
    const product = products.find((p) => p.slug === slug);
    return product && !chapterSlugs.has(slug) ? toCardProduct(product) : null;
  }).filter((p): p is CardProduct => p !== null);

  if (preferred.length >= 4) return preferred.slice(0, 4);

  const seen = new Set(preferred.map((p) => p.slug));
  for (const product of products) {
    if (preferred.length >= 4) break;
    if (chapterSlugs.has(product.slug) || seen.has(product.slug)) continue;
    preferred.push(toCardProduct(product));
    seen.add(product.slug);
  }

  return preferred.slice(0, 4);
}
