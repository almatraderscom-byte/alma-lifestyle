import type { CinematicContent } from '@/lib/cinematic-content-types';
import { resolveProductImageUrl } from '@/lib/default-images';
import type { CardProduct, CatalogProduct } from '@/lib/products-data';
import { toCardProduct } from '@/lib/products-data';
import {
  loadCatalogProductsServer,
  loadProductBySlugServer,
} from '@/lib/storefront/server-data';
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
  return (
    type === 'men_panjabi' ||
    type === 'boy_panjabi' ||
    type === 'girl_two_piece' ||
    type === 'women_three_piece'
  );
}

/** Listing cards use anchor slugs; admin may pick any family member slug (e.g. *-boy). */
function buildCatalogSlugMap(products: CatalogProduct[]): Map<string, CatalogProduct> {
  const map = new Map<string, CatalogProduct>();
  for (const product of products) {
    map.set(product.slug, product);
    for (const member of product.designGroupMembers ?? []) {
      map.set(member.slug, member);
    }
  }
  return map;
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

async function resolveChapterCatalogProduct(
  configured: string | undefined,
  bySlug: Map<string, CatalogProduct>,
  fallbackPool: CatalogProduct[],
  usedFallbackSlugs: Set<string>
): Promise<CatalogProduct | undefined> {
  if (configured) {
    let catalog = bySlug.get(configured);
    if (!catalog) {
      catalog = (await loadProductBySlugServer(configured)) ?? undefined;
    }
    if (catalog) return catalog;
  }

  return fallbackPool.find((p) => !usedFallbackSlugs.has(p.slug));
}

export async function loadCinematicChapterProducts(
  content?: Pick<CinematicContent, 'chapters'> | null
): Promise<(CardProduct | null)[]> {
  const stages = content?.chapters?.stages ?? [];
  const count = stages.length;
  if (!count) return [];

  const { products } = await loadCatalogProductsServer({ limit: 200, page: 1 });
  const bySlug = buildCatalogSlugMap(products);
  const fallbackPool = buildChapterFallbackPool(products);
  const usedFallbackSlugs = new Set<string>();

  const cards: (CardProduct | null)[] = [];

  for (let index = 0; index < count; index++) {
    if (index >= CHAPTER_IMAGE_STAGE_COUNT) {
      cards.push(null);
      continue;
    }

    const configured = configuredChapterSlug(stages, index);
    const catalog = await resolveChapterCatalogProduct(
      configured,
      bySlug,
      fallbackPool,
      usedFallbackSlugs
    );

    if (catalog && !configured) {
      usedFallbackSlugs.add(catalog.slug);
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
