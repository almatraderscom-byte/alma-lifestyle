import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MurdaMoshariLanding } from '@/components/product/MurdaMoshariLanding';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { mergeStaticProductOverrides } from '@/lib/products-data';
import {
  loadAllProductSlugsServer,
  loadCatalogProductsServer,
  loadProductBySlugServer,
} from '@/lib/storefront/server-data';

export const revalidate = 60;

const MURDA_SLUG = 'smart-murda-moshari';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === MURDA_SLUG) {
    return {
      title: 'স্মার্ট মুর্দা মশারী | ইসলামিক পর্দা মশারী | Alma Lifestyle',
      description:
        'মুসলমানের শেষ গোসলের জন্য পর্দা, পরিচ্ছন্নতা ও সম্মানের সম্পূর্ণ সমাধান। ক্যাশ অন ডেলিভারি, সারাদেশে।',
      openGraph: {
        images: ['/products/murda-moshari/hero-black.jpg'],
      },
    };
  }

  const product = await loadProductBySlugServer(slug);
  if (!product) {
    return { title: 'পণ্য | Alma Lifestyle' };
  }

  return {
    title: `${product.title} | Alma Lifestyle`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [loaded, { products: catalogProducts }] = await Promise.all([
    loadProductBySlugServer(slug),
    loadCatalogProductsServer({ limit: 200 }),
  ]);

  if (!loaded) {
    notFound();
  }

  const product = mergeStaticProductOverrides(loaded);

  if (product.customLayout === 'murda-moshari-landing') {
    return <MurdaMoshariLanding product={product} />;
  }

  return (
    <ProductDetailView product={product} catalogProducts={catalogProducts} />
  );
}

export async function generateStaticParams() {
  const slugs = await loadAllProductSlugsServer();
  const staticMurda = slugs.includes(MURDA_SLUG) ? [] : [{ slug: MURDA_SLUG }];
  return [...slugs.map((slug) => ({ slug })), ...staticMurda];
}
