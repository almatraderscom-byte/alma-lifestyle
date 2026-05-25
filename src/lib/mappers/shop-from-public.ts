import type { PublicApiProduct } from '@/lib/mappers/public-product';
import type { ShopCollection, ShopProduct } from '@/types/shop';
import type { StorefrontCollectionSummary } from '@/lib/storefront/collections-types';

const PRODUCT_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1595777457583-95e059ee5811?w=600&h=800&fit=crop';

const COLLECTION_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1583391733981-5a958b142a7c?w=600&h=400&fit=crop';

export function mapPublicProductToShopProduct(
  product: PublicApiProduct,
  options?: { collectionSlug?: string }
): ShopProduct {
  const featured = product.images.find((img) => img.isFeatured) ?? product.images[0];
  const imageUrl = featured?.url?.trim() || PRODUCT_PLACEHOLDER_IMAGE;
  const totalStock =
    product.variants?.reduce((sum, variant) => sum + variant.stock, 0) ??
    (product.sizes.length > 0 ? 1 : 0);

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    category: product.categorySlug ?? 'panjabi',
    categoryLabel: product.categoryName ?? product.categorySlug ?? 'Products',
    collectionSlugs: options?.collectionSlug ? [options.collectionSlug] : [],
    price: product.priceBdt,
    compareAtPrice: product.compareAtPriceBdt,
    currency: 'BDT',
    colors: product.variants?.map((v) => v.color) ?? [],
    sizes: product.sizes.length > 0 ? product.sizes : ['M'],
    imageUrl,
    inStock: totalStock > 0,
  };
}

export function mapStorefrontCollectionToShop(
  collection: StorefrontCollectionSummary
): ShopCollection {
  return {
    slug: collection.slug,
    name: collection.title,
    description: collection.description,
    imageUrl: collection.heroImageUrl?.trim() || COLLECTION_PLACEHOLDER_IMAGE,
    productCount: collection.productCount,
  };
}
