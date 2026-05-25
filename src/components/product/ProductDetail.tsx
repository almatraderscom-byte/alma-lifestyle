import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ProductGalleryClient } from '@/components/product/ProductGalleryClient';
import { ProductInfoStatic } from '@/components/product/ProductInfoStatic';
import { ProductListingGrid } from '@/components/product/ProductListingGrid';
import { ProductMatchingSetPanel } from '@/components/product/ProductMatchingSetPanel';
import { ProductPurchasePanel } from '@/components/product/ProductPurchasePanel';
import { RecentlyViewedSection } from '@/components/product/RecentlyViewedSection';
import { BREADCRUMB, PDP } from '@/lib/content';
import type { CatalogProduct } from '@/lib/products-data';

interface ProductDetailProps {
  product: CatalogProduct;
  relatedProducts?: CatalogProduct[];
  recentProducts?: CatalogProduct[];
  /** Used to resolve recently-viewed slugs client-side. */
  catalogForRecent?: CatalogProduct[];
}

function isMatchingSet(product: CatalogProduct): boolean {
  return Boolean(product.designGroupMembers && product.designGroupMembers.length > 1);
}

export function ProductDetail({
  product,
  relatedProducts = [],
  recentProducts = [],
  catalogForRecent = [],
}: ProductDetailProps) {
  const related = relatedProducts.filter((p) => p.slug !== product.slug).slice(0, 4);
  const catalog = catalogForRecent.length > 0 ? catalogForRecent : recentProducts;

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

        {isMatchingSet(product) ? (
          <div>
            <div className="sr-only">
              <p>ম্যাচিং সেট</p>
              <h1>{product.designGroupName ?? product.title}</h1>
              {product.description ? <p>{product.description}</p> : null}
            </div>
            <ProductMatchingSetPanel product={product} />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <ProductGalleryClient
              images={product.images.map((img) => ({
                ...img,
                url: img.url,
              }))}
              title={product.title}
              aspectRatio={product.aspectRatio}
            />
            <div className="space-y-6">
              <ProductInfoStatic product={product} />
              <ProductPurchasePanel product={product} />
            </div>
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-14 md:mt-20">
            <h2 className="font-bn-heading text-[1.75rem] md:text-2xl font-bold text-primary mb-6">
              {PDP.relatedTitle}
            </h2>
            <ProductListingGrid products={related} />
          </section>
        )}

        <RecentlyViewedSection
          currentSlug={product.slug}
          initialProducts={recentProducts}
          catalog={catalog}
        />
      </div>
    </div>
  );
}
