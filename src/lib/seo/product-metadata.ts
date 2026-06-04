import type { Metadata } from 'next';
import type { CatalogProduct } from '@/lib/products-data';
import { absoluteUrl } from '@/lib/seo/site-url';

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
  const shortDesc =
    product.description?.slice(0, 160) ||
    `${product.title} ALMA Lifestyle থেকে। ${priceText}. ক্যাশ অন ডেলিভারি সারাদেশে।`;
  const imageUrl = productImageUrl(product);

  return {
    title: `${product.title} — ${priceText}`,
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
