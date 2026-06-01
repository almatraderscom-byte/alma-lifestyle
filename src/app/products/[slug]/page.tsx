import { notFound } from 'next/navigation';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { JsonLd } from '@/lib/seo/jsonld';
import type { CatalogProduct } from '@/lib/products-data';
import {
  loadAllProductSlugsServer,
  loadProductBySlugServer,
} from '@/lib/storefront/server-data';

function siteOrigin(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return base.replace(/\/$/, '');
}

function productStructuredData(product: CatalogProduct) {
  const origin = siteOrigin();
  const imageUrl = product.images.find((img) => img.url)?.url;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    sku: product.slug,
    image: imageUrl ? [imageUrl] : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: product.price,
      availability: 'https://schema.org/InStock',
      url: `${origin}/products/${product.slug}`,
    },
  };
}

function breadcrumbStructuredData(product: CatalogProduct) {
  const origin = siteOrigin();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${origin}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${origin}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `${origin}/products/${product.slug}`,
      },
    ],
  };
}

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await loadProductBySlugServer(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <JsonLd data={productStructuredData(product)} />
      <JsonLd data={breadcrumbStructuredData(product)} />
      <ProductDetailView product={product} />
    </>
  );
}

export async function generateStaticParams() {
  const slugs = await loadAllProductSlugsServer();
  return slugs.map((slug) => ({ slug }));
}
