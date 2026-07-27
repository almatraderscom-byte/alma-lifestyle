import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { MurdaMoshariLanding } from '@/components/product/MurdaMoshariLanding';
import { ProductCmsEditProvider } from '@/components/obsidian/ProductCmsEditProvider';
import { getDefaultMurdaMoshariContent } from '@/lib/murda-moshari-default-content';
import { syncMurdaPricingFromProduct } from '@/lib/murda-moshari-pricing';
import { mergeStaticProductOverrides } from '@/lib/products-data';
import { resolveProductRedirect } from '@/server/db/queries/product-redirects';
import { decodeSlugParam } from '@/lib/storefront/slug-param';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildProductJsonLd,
  buildProductBreadcrumbJsonLd,
} from '@/lib/seo/product-jsonld';
import {
  buildProductPageMetadata,
  buildProductNotFoundMetadata,
} from '@/lib/seo/product-metadata';
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
  const { slug: rawSlug } = await params;
  const slug = decodeSlugParam(rawSlug);

  if (slug === MURDA_SLUG) {
    return {
      // The root layout's template appends the store name — naming it here too
      // is what produced "… | Alma Lifestyle | ALMA Lifestyle" in search results.
      title: 'স্মার্ট মুর্দা মশারী — ইসলামিক পর্দা মশারী',
      description:
        'মুসলমানের শেষ গোসলের জন্য পর্দা, পরিচ্ছন্নতা ও সম্মানের সম্পূর্ণ সমাধান। ক্যাশ অন ডেলিভারি, সারাদেশে।',
      openGraph: {
        images: ['/products/murda-moshari/hero-black.jpg'],
      },
      alternates: { canonical: `/products/${MURDA_SLUG}` },
    };
  }

  const product = await loadProductBySlugServer(slug);
  if (!product) {
    // Resolve a moved URL HERE, not in the page body. A redirect thrown while
    // the page renders arrives after the response has started streaming, so Next
    // can only finish it as a 200 carrying a client-side hop: a person lands on
    // the new page, while Google is told the old URL answered fine. Thrown from
    // metadata — before a byte is sent — it is a real 308.
    const movedTo = await resolveProductRedirect(slug);
    if (movedTo) permanentRedirect(`/products/${encodeURIComponent(movedTo)}`);
    return buildProductNotFoundMetadata();
  }

  // Use the shared builder instead of hand-rolling two fields here. It is the
  // module that sets alternates.canonical, the OG/Twitter image and the length
  // limits — bypassing it left EVERY product page without a canonical tag (live
  // audit 2026-07-25) while this well-tested helper sat unused.
  return buildProductPageMetadata(product, slug);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug: rawSlug } = await params;
  // Anything outside ASCII arrives percent-encoded — decode before it is used as
  // a database key. See decodeSlugParam.
  const slug = decodeSlugParam(rawSlug);
  const [loaded, { products: catalogProducts }] = await Promise.all([
    loadProductBySlugServer(slug),
    loadCatalogProductsServer({ limit: 200 }),
  ]);

  if (!loaded) {
    // The slug is unknown NOW — but it may be a URL this product used to live at.
    // Renaming a slug used to mean losing the old page's ranking outright, because
    // nothing in this app had ever issued a redirect; that is why one product is
    // still called "ইসলামিক ৭টি বইয়ের কম্বো প্যাকেজ Product Code: 7-b". Look the old
    // path up before giving Google a 404.
    // Backstop only — generateMetadata already redirected a moved URL with a real
    // status code. Keeping it means a moved link still works if this page is ever
    // reached without metadata running.
    const movedTo = await resolveProductRedirect(slug);
    if (movedTo) permanentRedirect(`/products/${encodeURIComponent(movedTo)}`);
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
