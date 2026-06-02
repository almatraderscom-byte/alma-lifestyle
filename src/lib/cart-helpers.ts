import type { AddToCartInput } from '@/context/CartContext';
import type { FeaturedProduct } from '@/lib/content';
import { getDefaultProductImage } from '@/lib/default-images';
import type { CatalogProduct, CategorySlug } from '@/lib/products-data';
import { getProductBySlug } from '@/lib/products-data';
import { shouldUseStaticDemoCatalog } from '@/lib/storefront/catalog-source';

export function getDefaultSize(product: CatalogProduct): string {
  if (product.sizes.length === 0) return '—';
  if (product.sizes.includes('XL')) return 'XL';
  return product.sizes[0] ?? '—';
}

/** Add-to-bag from a listing/featured card when the product lives in Supabase only. */
export function cardDisplayToCartItem(
  product: FeaturedProduct & { slug?: string; galleryImages?: { url?: string }[] },
  slug: string,
  categorySlug: CategorySlug = 'panjabi'
): AddToCartInput | null {
  const catalog = getProductBySlug(slug);
  if (catalog) return catalogToCartItem(catalog);

  if (shouldUseStaticDemoCatalog()) return null;

  return {
    productId: product.id,
    title: product.title,
    priceSnapshot: product.price,
    quantity: 1,
    color: '—',
    size: 'M',
    image:
      product.galleryImages?.[0]?.url ??
      getDefaultProductImage(slug, categorySlug),
    slug,
  };
}

export function catalogToCartItem(
  product: CatalogProduct,
  options?: {
    colorName?: string;
    colorId?: string;
    size?: string;
    quantity?: number;
  }
): AddToCartInput {
  const color =
    options?.colorName ??
    product.colors.find((c) => c.id === options?.colorId)?.name ??
    product.colors[0]?.name ??
    '—';

  return {
    productId: product.id,
    title: product.title,
    priceSnapshot: product.price,
    quantity: options?.quantity ?? 1,
    color,
    size: options?.size ?? getDefaultSize(product),
    image:
      product.images[0]?.url ??
      getDefaultProductImage(product.slug, product.categorySlug),
    slug: product.slug,
  };
}
