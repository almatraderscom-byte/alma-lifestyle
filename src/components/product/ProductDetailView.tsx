'use client';

import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductDetails } from '@/components/product/ProductDetails';
import { ProductMatchingSetPDP } from '@/components/product/ProductMatchingSetPDP';
import { ProductViewTracker } from '@/components/analytics/ProductViewTracker';
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn';
import { BREADCRUMB, PDP } from '@/lib/content';
import {
  CATALOG_PRODUCTS,
  toCardProduct,
  type CatalogProduct,
} from '@/lib/products-data';
import { shouldUseStaticDemoCatalog } from '@/lib/storefront/catalog-source';

interface ProductDetailViewProps {
  product: CatalogProduct;
  catalogProducts?: CatalogProduct[];
}

function pickRelatedAndRecent(
  product: CatalogProduct,
  catalog: CatalogProduct[]
): { related: CatalogProduct[]; recent: CatalogProduct[] } {
  const others = catalog.filter((p) => p.slug !== product.slug);
  const related = others
    .filter((p) => p.categorySlug === product.categorySlug)
    .slice(0, 4);
  const recent = others.slice(0, 4);
  return { related, recent };
}

export function ProductDetailView({
  product,
  catalogProducts = [],
}: ProductDetailViewProps) {
  const catalog = shouldUseStaticDemoCatalog()
    ? CATALOG_PRODUCTS
    : catalogProducts;
  const { related, recent } = pickRelatedAndRecent(product, catalog);

  return (
    <div className="bg-warm-white">
      <ProductViewTracker
        productId={product.id}
        price={product.price}
        title={product.title}
      />
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
              images={product.images}
              title={product.title}
              aspectRatio={product.aspectRatio}
              productSlug={product.slug}
              categorySlug={product.categorySlug}
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
              {related.map((p, idx) => (
                <ProductCard key={p.id} product={toCardProduct(p)} index={idx} />
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
            {recent.map((p, idx) => (
              <ProductCard key={p.id} product={toCardProduct(p)} index={idx} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
