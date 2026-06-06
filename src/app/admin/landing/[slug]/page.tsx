import { notFound } from 'next/navigation';
import { LandingContentEditor } from '@/components/admin/landing/LandingContentEditor';
import { getDefaultMurdaMoshariContent } from '@/lib/murda-moshari-default-content';
import { MURDA_MOSHARI_SLUG } from '@/lib/landing-content-types';
import { syncMurdaPricingFromProduct } from '@/lib/murda-moshari-pricing';
import { mergeStaticProductOverrides } from '@/lib/products-data';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { loadProductBySlugServer } from '@/lib/storefront/server-data';
import { getLandingContent } from '@/server/db/queries/landing-content';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const TITLES: Record<string, string> = {
  [MURDA_MOSHARI_SLUG]: 'স্মার্ট মুর্দা মশারী',
};

export default async function AdminLandingEditPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug !== MURDA_MOSHARI_SLUG) {
    notFound();
  }

  const rawContent =
    isSupabaseAdminConfigured()
      ? (await getLandingContent(slug)) ?? getDefaultMurdaMoshariContent()
      : getDefaultMurdaMoshariContent();

  const loadedProduct = await loadProductBySlugServer(slug);
  const product = loadedProduct ? mergeStaticProductOverrides(loadedProduct) : null;
  const content = product ? syncMurdaPricingFromProduct(rawContent, product) : rawContent;

  return (
    <LandingContentEditor
      slug={slug}
      productTitle={TITLES[slug] ?? slug}
      initialContent={content}
      catalogOfferPrice={product?.price}
      catalogCompareAtPrice={product?.compareAtPrice}
    />
  );
}
