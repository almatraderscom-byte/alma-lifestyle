import { notFound } from 'next/navigation';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { getAllProductSlugs, getProductBySlug } from '@/lib/products-data';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}

export function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({ slug }));
}
