import Image from 'next/image';
import Link from 'next/link';
import type { ShopProduct } from '@/types/shop';
import { formatPrice } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: ShopProduct;
  priority?: boolean;
}

const BADGE_LABELS: Record<NonNullable<ShopProduct['badge']>, string> = {
  new: 'New',
  bestseller: 'Bestseller',
  sale: 'Sale',
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const pricing = formatPrice(product.price, product.compareAtPrice);

  return (
    <article className="group flex flex-col bg-white border border-alma-border rounded-sm overflow-hidden hover:border-alma-ink/25 hover:shadow-sm transition-all">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-alma-cream">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
          priority={priority}
        />
        {product.badge && (
          <span
            className={cn(
              'absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-sm',
              product.badge === 'sale'
                ? 'bg-alma-gold text-alma-ink'
                : 'bg-alma-ink text-alma-cream'
            )}
          >
            {BADGE_LABELS[product.badge]}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-alma-ink/40 text-alma-cream text-sm font-medium">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-3 gap-1.5">
        <Link href={`/products?category=${product.category}`}>
          <span className="text-[10px] uppercase tracking-wider text-alma-muted hover:text-alma-ink">
            {product.categoryLabel}
          </span>
        </Link>
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-alma-ink line-clamp-2 leading-snug group-hover:underline underline-offset-2">
            {product.title}
          </h3>
        </Link>
        <div className="mt-auto flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-semibold text-alma-ink">{pricing.current}</span>
          {pricing.compare && (
            <span className="text-xs text-alma-muted line-through">{pricing.compare}</span>
          )}
          {pricing.discount && (
            <span className="text-[10px] font-medium text-alma-gold">-{pricing.discount}%</span>
          )}
        </div>
        <p className="text-[11px] text-alma-muted">
          {product.colors.length} colors · {product.sizes.join(', ')}
        </p>
      </div>
    </article>
  );
}

