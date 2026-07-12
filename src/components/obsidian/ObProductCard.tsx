'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  getProductBySlug,
  CATEGORY_LABELS,
  type CardProduct,
  type CategorySlug,
} from '@/lib/products-data';
import { formatBdtPrice, formatBdtRange } from '@/lib/format-bn';
import { FEATURED_SECTION, PDP } from '@/lib/content';
import { UI } from '@/lib/ui-terms';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/components/ui/Toast';
import { resolveProductImageUrl } from '@/lib/default-images';
import { cardDisplayToCartItem } from '@/lib/cart-helpers';
import { trackAddToCartLine } from '@/lib/pixel';
import { AutoRotateProductImage } from '@/components/product/AutoRotateProductImage';

interface ObProductCardProps {
  product: CardProduct;
  /** Stagger auto-rotation start across the grid. */
  index?: number;
  /**
   * Render already-revealed (no scroll-reveal wait). Needed in the paginated
   * products grid: the global ObsidianFX reveal observer only scans for
   * [data-ob-reveal] once on mount, so cards added on a later page would
   * otherwise stay at opacity:0. Home sections keep the default scroll reveal.
   */
  eagerReveal?: boolean;
}

/**
 * Obsidian storefront product card — the homepage `.pcard` aesthetic (rounded
 * media, dark veil, overlaid category + title, 3D-tilt via ObsidianFX) reused as
 * an interactive listing card with wishlist + add-to-cart. All content is mapped
 * from the existing `CardProduct` — no data/text/image is altered (requirement:
 * "map them correctly using props").
 */
export function ObProductCard({ product, index = 0, eagerReveal = false }: ObProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { has: isWished, toggle: toggleWishlist } = useWishlist();
  const wished = isWished(product.id);

  const productSlug = product.slug ?? product.href.replace('/products/', '');

  const catalogProduct = useMemo(() => getProductBySlug(productSlug), [productSlug]);
  const categorySlug = (product.categorySlug ?? catalogProduct?.categorySlug) as CategorySlug | undefined;
  const categoryLabel = categorySlug ? CATEGORY_LABELS[categorySlug] : undefined;

  const gallery = useMemo(() => {
    const imgs = product.galleryImages;
    const base = imgs && imgs.length > 0 ? imgs : [{ id: product.id, bgClass: product.bgClass }];
    return base.map((img) => ({
      ...img,
      url: resolveProductImageUrl(img.url, productSlug, categorySlug),
    }));
  }, [product.galleryImages, product.id, product.bgClass, productSlug, categorySlug]);

  const isDesignGroup = Boolean(product.isDesignGroup && product.priceRange);
  const staggerOffset = (index * 350) % 2500;

  function addProductToCart() {
    const slug = product.slug ?? product.href.replace('/products/', '').replace(/\/$/, '');
    const payload = cardDisplayToCartItem(product, slug, catalogProduct?.categorySlug);
    if (!payload) return null;
    addItem(payload);
    trackAddToCartLine({
      productId: payload.productId,
      quantity: payload.quantity ?? 1,
      unitPriceBdt: payload.priceSnapshot ?? product.price,
    });
    return payload;
  }

  function handleAddToBag(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (addProductToCart()) showToast(PDP.toastAdded);
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (addProductToCart()) router.push('/cart');
  }

  return (
    <article className={`ob-pcard${eagerReveal ? ' in' : ''}`} data-ob-reveal>
      <div className="ob-pcard-media pcard">
        <Link href={product.href} className="ob-pcard-link" aria-label={product.title}>
          <AutoRotateProductImage
            images={gallery}
            alt={product.title}
            className="h-full w-full"
            rotationInterval={3000}
            staggerOffset={staggerOffset}
            priority={index < 4}
            productSlug={productSlug}
            categorySlug={categorySlug}
          />
          <div className="pc-veil" />
        </Link>

        {categoryLabel && <span className="pc-cat">{categoryLabel}</span>}

        <button
          type="button"
          className={`ob-pcard-wish${wished ? ' on' : ''}`}
          aria-label={wished ? UI.removeFromWishlist : UI.addToWishlist}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
        >
          <HeartIcon filled={wished} />
        </button>

        <button type="button" className="ob-pcard-quick" onClick={handleAddToBag}>
          {FEATURED_SECTION.addToBag}
        </button>
      </div>

      <div className="ob-pcard-info">
        <Link href={product.href} className="ob-pcard-title">
          <h4 className="bn-serif">{product.title}</h4>
        </Link>
        <div className="ob-pcard-price price">
          <span>
            {isDesignGroup && product.priceRange
              ? formatBdtRange(product.priceRange.min, product.priceRange.max)
              : formatBdtPrice(product.price)}
          </span>
          {!isDesignGroup && product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="was">{formatBdtPrice(product.compareAtPrice)}</span>
          )}
        </div>

        {isDesignGroup && product.typeLabels && product.typeLabels.length > 0 && (
          <div className="ob-pcard-tags">
            {product.typeLabels.map((label) => (
              <span key={label} className="ob-mini-tag">
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="ob-pcard-actions">
          <button type="button" className="ob-btn dark" onClick={handleAddToBag}>
            {FEATURED_SECTION.addToBag}
          </button>
          <button type="button" className="ob-btn dark solid" onClick={handleBuyNow}>
            {PDP.buyNow}
          </button>
        </div>
      </div>
    </article>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}
