import type { CinematicContent } from '@/lib/cinematic-content-types';
import type { CardProduct } from '@/lib/products-data';
import { toCardProduct } from '@/lib/products-data';
import {
  loadCatalogProductsServer,
  loadProductBySlugServer,
} from '@/lib/storefront/server-data';
import {
  CINEMATIC_CHAPTER_PRODUCTS,
  CINEMATIC_FILM_STRIP_PRODUCTS,
} from '@/lib/cinematic-config';

function resolveChapterSlug(
  stages: CinematicContent['chapters']['stages'],
  index: number
): string | undefined {
  const fromDb = stages[index]?.productSlug?.trim();
  if (fromDb) return fromDb;
  return CINEMATIC_CHAPTER_PRODUCTS.find((p) => p.stageIndex === index)?.productSlug;
}

function collectChapterSlugs(content?: Pick<CinematicContent, 'chapters'> | null): Set<string> {
  const slugs = new Set<string>();
  const stages = content?.chapters?.stages ?? [];
  for (let i = 0; i < stages.length; i++) {
    const slug = resolveChapterSlug(stages, i);
    if (slug) slugs.add(slug);
  }
  if (!slugs.size) {
    for (const { productSlug } of CINEMATIC_CHAPTER_PRODUCTS) {
      slugs.add(productSlug);
    }
  }
  return slugs;
}

export async function loadCinematicChapterProducts(
  content?: Pick<CinematicContent, 'chapters'> | null
): Promise<(CardProduct | null)[]> {
  const stages = content?.chapters?.stages ?? [];
  const count = stages.length || CINEMATIC_CHAPTER_PRODUCTS.length;

  return Promise.all(
    Array.from({ length: count }, async (_, index) => {
      const slug = resolveChapterSlug(stages, index);
      if (!slug) return null;
      const catalog = await loadProductBySlugServer(slug);
      return catalog ? toCardProduct(catalog) : null;
    })
  );
}

export async function loadCinematicFilmStripProducts(
  content?: Pick<CinematicContent, 'chapters'> | null
): Promise<ReturnType<typeof toCardProduct>[]> {
  const chapterSlugs = collectChapterSlugs(content);
  const { products } = await loadCatalogProductsServer({ limit: 200, page: 1 });

  const preferred = CINEMATIC_FILM_STRIP_PRODUCTS.map((slug) => {
    const product = products.find((p) => p.slug === slug);
    return product && !chapterSlugs.has(slug) ? toCardProduct(product) : null;
  }).filter((p): p is ReturnType<typeof toCardProduct> => p !== null);

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
