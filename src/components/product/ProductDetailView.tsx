'use client';

import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductDetails } from '@/components/product/ProductDetails';
import { ProductMatchingSetPDP } from '@/components/product/ProductMatchingSetPDP';
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn';
import { BREADCRUMB, PDP } from '@/lib/content';
import { toCardProduct, type CatalogProduct } from '@/lib/products-data';

interface ProductDetailViewProps {
  product: CatalogProduct;
  relatedProducts?: CatalogProduct[];
  recentProducts?: CatalogProduct[];
}

export function ProductDetailView({
  product,
  relatedProducts = [],
  recentProducts = [],
}: ProductDetailViewProps) {
  const related = relatedProducts;
  const recent = recentProducts;

  return (
    <div className="bg-warm-white">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <Breadcrumb
          items={[
            { label: BREADCRUMB.home, href: '/' },
            { label: product.categoryName, href: `/products?category=${product.categorySlug}` },
            { label: product.title },
          ]}
          className="mb-6"
        />

        {product.designGroupMembers && product.designGroupMembers.length > 1 ? (
          <ProductMatchingSetPDP product={product} />
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <ProductGallery
              images={product.images.map((img) => ({
                ...img,
                url: (img as { url?: string }).url,
              }))}
              title={product.title}
              aspectRatio={product.aspectRatio}
            />
            <ProductDetails product={product} />
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-14 md:mt-20">
            <ScrollFadeIn>
              <h2 className="font-bn-heading text-[1.75rem] md:text-2xl font-bold text-primary mb-6">
                {PDP.relatedTitle}
              </h2>
            </ScrollFadeIn>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={toCardProduct(p)} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-14 md:mt-16 pb-8">
          <ScrollFadeIn>
            <h2 className="font-bn-heading text-[1.75rem] md:text-2xl font-bold text-primary mb-6">
              {PDP.recentTitle}
            </h2>
          </ScrollFadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {recent.map((p) => (
              <ProductCard key={p.id} product={toCardProduct(p)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
