import type { AddToCartInput } from '@/context/CartContext';
import type { CatalogProduct } from '@/lib/products-data';

export function getDefaultSize(product: CatalogProduct): string {
  if (product.sizes.length === 0) return '—';
  if (product.sizes.includes('XL')) return 'XL';
  return product.sizes[0] ?? '—';
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
    image: product.bgClass,
    slug: product.slug,
  };
}
