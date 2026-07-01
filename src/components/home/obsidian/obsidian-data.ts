import type { CardProduct, CategorySlug } from '@/lib/products-data';
import { CATEGORY_LABELS } from '@/lib/products-data';
import { resolveProductImageUrl } from '@/lib/default-images';
import { formatBdtPrice } from '@/lib/format-bn';

/** A product flattened to exactly what the Obsidian visuals need. */
export interface ObsidianCard {
  id: string;
  slug: string;
  href: string;
  title: string;
  categoryLabel: string;
  categorySlug: CategorySlug | undefined;
  imageUrl: string;
  price: number;
  priceText: string;
  compareAtText: string | null;
}

export function toObsidianCard(p: CardProduct): ObsidianCard {
  const primary = p.galleryImages?.[0];
  const slug = p.slug ?? p.id;
  const imageUrl = resolveProductImageUrl(primary?.url, slug, p.categorySlug);
  const price = p.priceRange ? p.priceRange.min : p.price;
  return {
    id: p.id,
    slug,
    href: p.href,
    title: p.title,
    categoryLabel: p.categorySlug ? CATEGORY_LABELS[p.categorySlug] : 'কালেকশন',
    categorySlug: p.categorySlug,
    imageUrl,
    price,
    priceText: formatBdtPrice(price),
    compareAtText:
      p.compareAtPrice && p.compareAtPrice > price ? formatBdtPrice(p.compareAtPrice) : null,
  };
}

/**
 * Split the catalog into the slots the homepage needs. Everything is derived
 * from live CMS/catalog data — no hardcoded products.
 */
export function buildObsidianSlots(products: CardProduct[]) {
  const cards = products.map(toObsidianCard);

  // Prefer panjabi hero cards (the brand's signature), fall back to anything.
  const panjabi = cards.filter((c) => c.categorySlug === 'panjabi');
  const heroPool = (panjabi.length >= 4 ? panjabi : cards).slice(0, 6);

  const spotlight = panjabi[1] ?? panjabi[0] ?? cards[0] ?? null;

  // Grid: 8 varied cards, skipping the spotlight pick to avoid duplication.
  const grid = cards.filter((c) => c.id !== spotlight?.id).slice(0, 8);

  // Shine strip: a distinct horizontal-scroll set (wrap to cover the marquee).
  const shine = cards.slice(0, 8);

  // Footer strip images.
  const strip = cards.slice(0, 12).map((c) => c.imageUrl);

  return { cards, heroPool, spotlight, grid, shine, strip };
}
