import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MurdaMoshariLanding } from '@/components/product/MurdaMoshariLanding';
import { ProductCmsEditProvider } from '@/components/obsidian/ProductCmsEditProvider';
import { getDefaultMurdaMoshariContent } from '@/lib/murda-moshari-default-content';
import { syncMurdaPricingFromProduct } from '@/lib/murda-moshari-pricing';
import { mergeStaticProductOverrides } from '@/lib/products-data';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildProductJsonLd,
  buildProductBreadcrumbJsonLd,
} from '@/lib/seo/product-jsonld';
import { getLandingContent } from '@/server/db/queries/landing-content';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
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
    let content = getDefaultMurdaMoshariContent();
    if (isSupabaseAdminConfigured()) {
      try {
        content = (await getLandingContent(slug)) ?? content;
      } catch {
        // DB unavailable at build/runtime — use static defaults
      }
    }
    content = syncMurdaPricingFromProduct(content, product);
    return <MurdaMoshariLanding product={product} content={content} />;
  }

  return (
    <>
      <JsonLd
        data={[
          buildProductJsonLd(product, slug),
          buildProductBreadcrumbJsonLd(slug, product.title),
        ]}
      />
      <ProductCmsEditProvider product={product} catalogProducts={catalogProducts} />
    </>
  );
}

export async function generateStaticParams() {
  const slugs = await loadAllProductSlugsServer();
  return slugs.map((slug) => ({ slug }));
}
