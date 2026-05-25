import Link from 'next/link';
import Image from 'next/image';
import { formatBdtPrice, formatBdtRange } from '@/lib/format-bn';
import {
  catalogIsDesignGroupCard,
  catalogListingTypeLabels,
  toCardProduct,
  type CatalogProduct,
} from '@/lib/products-data';
import { cn } from '@/lib/utils';

interface ProductCardStaticProps {
  product: CatalogProduct;
  priority?: boolean;
}

export function ProductCardStatic({ product, priority = false }: ProductCardStaticProps) {
  const card = toCardProduct(product);
  const isDesignGroup = catalogIsDesignGroupCard(product);
  const gallery = card.galleryImages?.length
    ? card.galleryImages
    : [{ id: product.id, bgClass: product.bgClass, url: product.images[0]?.url }];
  const image = gallery[0]!;
  const aspectClass = product.aspectRatio === '1/1' ? 'aspect-square' : 'aspect-[3/4]';

  const priceLabel =
    isDesignGroup && product.priceMin != null && product.priceMax != null
      ? formatBdtRange(product.priceMin, product.priceMax)
      : formatBdtPrice(product.price);

  const typeLabels = isDesignGroup ? catalogListingTypeLabels(product) : [];

  return (
    <article className="group flex flex-col h-full">
      <Link
        href={product.href}
        className={cn(
          'block relative overflow-hidden rounded-sm bg-cream',
          aspectClass
        )}
      >
        {image.url ? (
          <Image
            src={image.url}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={priority}
          />
        ) : (
          <div className={cn('absolute inset-0', image.bgClass)} aria-hidden />
        )}
        {product.isNew && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold uppercase bg-primary text-secondary rounded-sm">
            New
          </span>
        )}
      </Link>
      <div className="flex flex-col flex-1 p-3 gap-1">
        <Link href={`/products?categories=${product.categorySlug}`}>
          <span className="text-[10px] uppercase tracking-wider text-text-light hover:text-primary">
            {product.categoryName}
          </span>
        </Link>
        <Link href={product.href}>
          <h3 className="font-bn-body text-sm font-medium text-primary line-clamp-2 leading-snug">
            {isDesignGroup ? (product.designGroupName ?? product.title) : product.title}
          </h3>
        </Link>
        {typeLabels.length > 0 && (
          <p className="text-[11px] text-text-light">{typeLabels.join(' · ')}</p>
        )}
        <p className="font-bn-heading text-base font-bold text-primary mt-auto">{priceLabel}</p>
      </div>
    </article>
  );
}
