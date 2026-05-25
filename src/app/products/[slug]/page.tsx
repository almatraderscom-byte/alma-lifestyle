import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata-helpers';
import { getSiteUrl, absoluteUrl } from '@/lib/seo/site-url';
import { truncateMetaDescription } from '@/lib/seo/truncate';
import {
  loadAllProductSlugsServer,
  loadProductBySlugServer,
} from '@/lib/storefront/server-data';
import type { CatalogProduct } from '@/lib/products-data';

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

function productDescription(product: CatalogProduct): string {
  return (
    product.description?.trim() ||
    product.imageHint?.replace(/^Image:\s*/i, '').trim() ||
    product.title
  );
}

function productOgImage(product: CatalogProduct): string | undefined {
  const url = product.images.find((img) => img.url)?.url;
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return absoluteUrl(url);
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProductBySlugServer(slug);

  if (!product) {
    return {
      title: `Product not found | ALMA Lifestyle`,
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.title} | ALMA Lifestyle`;
  const description = truncateMetaDescription(productDescription(product));
  const canonicalPath = `/products/${slug}`;
  const ogImage = productOgImage(product);

  return {
    ...pageMetadata({
      title,
      description,
      canonicalPath,
      openGraph: {
        title,
        description,
        url: absoluteUrl(canonicalPath),
        type: 'website',
        images: ogImage ? [{ url: ogImage, alt: product.title }] : undefined,
      },
    }),
    other: {
      'og:type': 'product',
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await loadProductBySlugServer(slug);

  if (!product) {
    notFound();
  }

  const baseUrl = getSiteUrl();
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    ...(product.categoryName
      ? [{ name: product.categoryName, path: `/products?category=${product.categorySlug}` }]
      : []),
    { name: product.title, path: `/products/${slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[productJsonLd(product, baseUrl), breadcrumbJsonLd(breadcrumbItems, baseUrl)]}
      />
      <ProductDetailView product={product} />
    </>
  );
}

export async function generateStaticParams() {
  const slugs = await loadAllProductSlugsServer();
  return slugs.map((slug) => ({ slug }));
}
