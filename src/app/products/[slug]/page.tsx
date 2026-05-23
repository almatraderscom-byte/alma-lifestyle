import { notFound } from 'next/navigation';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import {
  loadAllProductSlugsServer,
  loadProductBySlugServer,
} from '@/lib/storefront/server-data';

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

  return <ProductDetailView product={product} />;
}

export async function generateStaticParams() {
  const slugs = await loadAllProductSlugsServer();
  return slugs.map((slug) => ({ slug }));
}
