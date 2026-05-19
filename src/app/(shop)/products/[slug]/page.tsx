import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ProductImageGallery } from '@/components/shop/ProductImageGallery';
import { ProductPurchasePanel } from '@/components/shop/ProductPurchasePanel';
import { RelatedProducts } from '@/components/shop/RelatedProducts';
import { FadeIn } from '@/components/shared/Motion';
import {
  getProductBySlug,
  getFamilyProducts,
  PRODUCTS,
} from '@/lib/shop/mock-data';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const images = [product.imageUrl, product.imageUrl, product.imageUrl];
  const familyProducts = product.familySlug
    ? getFamilyProducts(product.familySlug, product.slug)
    : PRODUCTS.filter(
        (p) => p.category === product.category && p.slug !== product.slug
      ).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/products' },
          { label: product.categoryLabel, href: `/products?category=${product.category}` },
          { label: product.title },
        ]}
        className="mb-8"
      />

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <FadeIn>
          <ProductImageGallery images={images} title={product.title} />
        </FadeIn>
        <ProductPurchasePanel product={product} />
      </div>

      <FadeIn>
        <RelatedProducts
          title={product.familySlug ? 'Complete the look' : 'You may also love'}
          products={familyProducts}
        />
      </FadeIn>
    </div>
  );
}

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}
