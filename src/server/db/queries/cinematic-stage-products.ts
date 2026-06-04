import type { CinematicContent } from '@/lib/cinematic-content-types';
import { resolveProductImageUrl } from '@/lib/default-images';
import type { CardProduct, CatalogProduct } from '@/lib/products-data';
import { toCardProduct } from '@/lib/products-data';
import { loadCatalogProductsServer } from '@/lib/storefront/server-data';
import { CINEMATIC_FILM_STRIP_PRODUCTS } from '@/lib/cinematic-config';

const CHAPTER_IMAGE_STAGE_COUNT = 3;

function configuredChapterSlug(
  stages: CinematicContent['chapters']['stages'],
  index: number
): string | undefined {
  return stages[index]?.productSlug?.trim() || undefined;
}

function isPanjabiProduct(product: CatalogProduct): boolean {
  const category = product.categorySlug?.trim().toLowerCase();
  if (category === 'panjabi') return true;
  const type = product.productType;
  return type === 'men_panjabi' || type === 'boy_panjabi';
}

function toChapterCardProduct(product: CatalogProduct): CardProduct {
  const card = toCardProduct(product);
  return {
    ...card,
    galleryImages: card.galleryImages?.map((img) => ({
      ...img,
      url: resolveProductImageUrl(img.url, product.slug, product.categorySlug),
    })),
  };
}

function buildChapterFallbackPool(products: CatalogProduct[]): CatalogProduct[] {
  const panjabi = products.filter(isPanjabiProduct);
  const ordered = panjabi.slice();
  ordered.sort((a, b) => (b.popularScore ?? 0) - (a.popularScore ?? 0));
  return ordered;
}

function collectChapterSlugs(
  stages: CinematicContent['chapters']['stages'],
  resolvedSlugs: string[]
): Set<string> {
  const slugs = new Set<string>();
  for (const slug of resolvedSlugs) {
    if (slug) slugs.add(slug);
  }
  for (let i = 0; i < stages.length; i++) {
    const slug = configuredChapterSlug(stages, i);
    if (slug) slugs.add(slug);
  }
  return slugs;
}

export async function loadCinematicChapterProducts(
  content?: Pick<CinematicContent, 'chapters'> | null
): Promise<(CardProduct | null)[]> {
  const stages = content?.chapters?.stages ?? [];
  const count = stages.length;
  if (!count) return [];

  const { products } = await loadCatalogProductsServer({ limit: 200, page: 1 });
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const fallbackPool = buildChapterFallbackPool(products);
  const usedFallbackSlugs = new Set<string>();

  const cards: (CardProduct | null)[] = [];

  for (let index = 0; index < count; index++) {
    if (index >= CHAPTER_IMAGE_STAGE_COUNT) {
      cards.push(null);
      continue;
    }

    const configured = configuredChapterSlug(stages, index);
    let catalog = configured ? bySlug.get(configured) : undefined;
    if (catalog && !isPanjabiProduct(catalog)) {
      catalog = undefined;
    }

    if (!catalog) {
      catalog = fallbackPool.find((p) => !usedFallbackSlugs.has(p.slug));
      if (catalog) usedFallbackSlugs.add(catalog.slug);
    }

    cards.push(catalog ? toChapterCardProduct(catalog) : null);
  }

  return cards;
}

export async function loadCinematicFilmStripProducts(
  content?: Pick<CinematicContent, 'chapters'> | null
): Promise<ReturnType<typeof toCardProduct>[]> {
  const stages = content?.chapters?.stages ?? [];
  const chapterProducts = await loadCinematicChapterProducts(content);
  const chapterSlugs = collectChapterSlugs(
    stages,
    chapterProducts.map((p) => p?.slug ?? '')
  );

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
