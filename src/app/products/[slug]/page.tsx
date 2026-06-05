import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MurdaMoshariLanding } from '@/components/product/MurdaMoshariLanding';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { ProductPageSeo } from '@/components/seo/ProductPageSeo';
import { getDefaultMurdaMoshariContent } from '@/lib/murda-moshari-default-content';
import { mergeStaticProductOverrides } from '@/lib/products-data';
import {
  buildProductNotFoundMetadata,
  buildProductPageMetadata,
} from '@/lib/seo/product-metadata';
import { getLandingContent } from '@/server/db/queries/landing-content';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import {
  loadAllProductSlugsServer,
  loadCatalogProductsServer,
  loadProductBySlugServer,
} from '@/lib/storefront/server-data';

export const revalidate = 300;

const MURDA_SLUG = 'smart-murda-moshari';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === MURDA_SLUG) {
    return {
      title: 'স্মার্ট মুর্দা মশারী | ইসলামিক পর্দা মশারী | ALMA Lifestyle',
      description:
        'মুসলমানের শেষ গোসলের জন্য পর্দা, পরিচ্ছন্নতা ও সম্মানের সম্পূর্ণ সমাধান। ক্যাশ অন ডেলিভারি, সারাদেশে।',
      openGraph: {
        images: ['/products/murda-moshari/hero-black.jpg'],
      },
      alternates: { canonical: `/products/${slug}` },
    };
  }

  const product = await loadProductBySlugServer(slug);
  if (!product) {
    return buildProductNotFoundMetadata();
  }

  return buildProductPageMetadata(product, slug);
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
    let content = getDefaultMurdaMoshariContent();
    if (isSupabaseAdminConfigured()) {
      try {
        content = (await getLandingContent(slug)) ?? content;
      } catch {
        // DB unavailable at build/runtime — use static defaults
      }
    }
    return <MurdaMoshariLanding product={product} content={content} />;
  }

  return (
    <>
      <ProductPageSeo product={product} slug={slug} />
      <ProductDetailView product={product} catalogProducts={catalogProducts} />
    </>
  );
}

export async function generateStaticParams() {
  const slugs = await loadAllProductSlugsServer();
  return slugs.map((slug) => ({ slug }));
}
