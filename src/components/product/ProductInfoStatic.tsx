import { PDP } from '@/lib/content';
import { formatBdtPrice, formatRating, formatReviewCount } from '@/lib/format-bn';
import type { CatalogProduct } from '@/lib/products-data';

interface ProductInfoStaticProps {
  product: CatalogProduct;
}

export function ProductInfoStatic({ product }: ProductInfoStaticProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-bn-body text-sm text-accent font-medium">{product.categoryName}</p>
        <h1 className="font-bn-heading text-[1.75rem] sm:text-[2rem] font-bold text-primary mt-1 leading-relaxed">
          {product.title}
        </h1>
        <p className="font-bn-body text-sm text-text-light mt-2">
          ★★★★★ {formatRating(product.rating)} {formatReviewCount(product.reviewCount)}
        </p>
      </div>

      <p className="font-bn-heading text-2xl font-bold text-primary md:hidden">
        {formatBdtPrice(product.price)}
      </p>

      {product.description ? (
        <div className="prose prose-sm max-w-none">
          <h2 className="font-bn-heading text-base font-semibold text-primary">
            {PDP.accordion.description}
          </h2>
          <p className="font-bn-body text-base text-primary leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      ) : null}
    </div>
  );
}
