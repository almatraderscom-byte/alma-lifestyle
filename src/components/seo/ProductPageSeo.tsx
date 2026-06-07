import { JsonLd } from '@/components/seo/JsonLd';
import { ProductViewTracker } from '@/components/analytics/ProductViewTracker';
import type { CatalogProduct } from '@/lib/products-data';
import {
  buildProductBreadcrumbJsonLd,
  buildProductJsonLd,
} from '@/lib/seo/product-jsonld';

export function ProductPageSeo({
  product,
  slug,
}: {
  product: CatalogProduct;
  slug: string;
}) {
  return (
    <>
      <JsonLd
        data={[buildProductJsonLd(product, slug), buildProductBreadcrumbJsonLd(slug, product.title)]}
      />
      <ProductViewTracker
        productId={product.id}
        price={product.price}
        title={product.title}
      />
    </>
  );
}
