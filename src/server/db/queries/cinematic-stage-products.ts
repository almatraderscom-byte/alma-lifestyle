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

export type CinematicStageProducts = {
  chapterProducts: (CardProduct | null)[];
  filmStripProducts: ReturnType<typeof toCardProduct>[];
};

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
  usedFallbackSlugs: Set<string>,
  slugLoadCache: Map<string, CatalogProduct | null>
): Promise<CatalogProduct | undefined> {
  if (configured) {
    let catalog = bySlug.get(configured);
    if (!catalog) {
      if (!slugLoadCache.has(configured)) {
        slugLoadCache.set(configured, (await loadProductBySlugServer(configured)) ?? null);
      }
      catalog = slugLoadCache.get(configured) ?? undefined;
    }
    if (catalog) return catalog;
  }

  return fallbackPool.find((p) => !usedFallbackSlugs.has(p.slug));
}

async function loadCatalogPool(): Promise<CatalogProduct[]> {
  const { products } = await loadCatalogProductsServer({ limit: 200, page: 1 });
  return products;
}

export async function loadCinematicStageProducts(
  content?: Pick<CinematicContent, 'chapters'> | null,
  catalogProducts?: CatalogProduct[]
): Promise<CinematicStageProducts> {
  const stages = content?.chapters?.stages ?? [];
  const count = stages.length;
  const products = catalogProducts ?? (await loadCatalogPool());
  const bySlug = buildCatalogSlugMap(products);
  const fallbackPool = buildChapterFallbackPool(products);
  const usedFallbackSlugs = new Set<string>();
  const slugLoadCache = new Map<string, CatalogProduct | null>();

  const chapterProducts: (CardProduct | null)[] = [];

  if (count > 0) {
    const imageStageResolutions = await Promise.all(
      Array.from({ length: Math.min(count, CHAPTER_IMAGE_STAGE_COUNT) }, (_, index) =>
        resolveChapterCatalogProduct(
          configuredChapterSlug(stages, index),
          bySlug,
          fallbackPool,
          usedFallbackSlugs,
          slugLoadCache
        )
      )
    );

    for (let index = 0; index < count; index++) {
      if (index >= CHAPTER_IMAGE_STAGE_COUNT) {
        chapterProducts.push(null);
        continue;
      }

      const configured = configuredChapterSlug(stages, index);
      const catalog = imageStageResolutions[index];

      if (catalog && !configured) {
        usedFallbackSlugs.add(catalog.slug);
      }

      chapterProducts.push(catalog ? toChapterCardProduct(catalog) : null);
    }
  }

  const chapterSlugs = collectChapterSlugs(
    stages,
    chapterProducts.map((p) => p?.slug ?? '')
  );

  const preferred = CINEMATIC_FILM_STRIP_PRODUCTS.map((slug) => {
    const product = products.find((p) => p.slug === slug);
    return product && !chapterSlugs.has(slug) ? toCardProduct(product) : null;
  }).filter((p): p is ReturnType<typeof toCardProduct> => p !== null);

  const filmStripProducts = [...preferred];
  const seen = new Set(filmStripProducts.map((p) => p.slug));

  if (filmStripProducts.length < 4) {
    for (const product of products) {
      if (filmStripProducts.length >= 4) break;
      if (chapterSlugs.has(product.slug) || seen.has(product.slug)) continue;
      filmStripProducts.push(toCardProduct(product));
      seen.add(product.slug);
    }
  }

  return {
    chapterProducts,
    filmStripProducts: filmStripProducts.slice(0, 4),
  };
}

/** @deprecated Use loadCinematicStageProducts for a single catalog fetch. */
export async function loadCinematicChapterProducts(
  content?: Pick<CinematicContent, 'chapters'> | null,
  catalogProducts?: CatalogProduct[]
): Promise<(CardProduct | null)[]> {
  const { chapterProducts } = await loadCinematicStageProducts(content, catalogProducts);
  return chapterProducts;
}

/** @deprecated Use loadCinematicStageProducts for a single catalog fetch. */
export async function loadCinematicFilmStripProducts(
  content?: Pick<CinematicContent, 'chapters'> | null,
  catalogProducts?: CatalogProduct[]
): Promise<ReturnType<typeof toCardProduct>[]> {
  const { filmStripProducts } = await loadCinematicStageProducts(content, catalogProducts);
  return filmStripProducts;
}
