'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ProductViewTracker } from '@/components/analytics/ProductViewTracker';
import { ProductMatchingSetPDP } from '@/components/product/ProductMatchingSetPDP';
import { BREADCRUMB, PDP } from '@/lib/content';
import {
  CATALOG_PRODUCTS,
  toCardProduct,
  type CatalogProduct,
} from '@/lib/products-data';
import { shouldUseStaticDemoCatalog } from '@/lib/storefront/catalog-source';
import { resolveProductImageUrl } from '@/lib/default-images';
import { ObsidianShell } from './ObsidianShell';
import { SplitBadge } from './SplitBadge';
import { FloatingWord } from './FloatingWord';
import { ObProductCard } from './ObProductCard';
import { ObsidianProductGallery } from './ObsidianProductGallery';
import { ObsidianProductDetails } from './ObsidianProductDetails';
import { hexFromBgClass } from './obsidian-theme';

interface ObsidianProductDetailProps {
  product: CatalogProduct;
  catalogProducts?: CatalogProduct[];
}

function pickRelatedAndRecent(product: CatalogProduct, catalog: CatalogProduct[]) {
  const others = catalog.filter((p) => p.slug !== product.slug);
  const related = others.filter((p) => p.categorySlug === product.categorySlug).slice(0, 4);
  const recent = others.slice(0, 4);
  return { related, recent };
}

export function ObsidianProductDetail({ product, catalogProducts = [] }: ObsidianProductDetailProps) {
  const catalog = shouldUseStaticDemoCatalog() ? CATALOG_PRODUCTS : catalogProducts;
  const { related, recent } = pickRelatedAndRecent(product, catalog);

  const isMatchingSet = Boolean(product.designGroupMembers && product.designGroupMembers.length > 1);

  // Page tint: start from the product's own swatch, then follow the gallery's
  // active image (mirrors the hero slider's per-slide theming).
  const initialColor =
    hexFromBgClass(product.images?.[0]?.bgClass) ?? hexFromBgClass(product.bgClass) ?? '#2f7dff';
  const [themeColor, setThemeColor] = useState<string>(initialColor);
  const onActiveColor = useCallback((hex: string | undefined) => {
    if (hex) setThemeColor(hex);
  }, []);

  // Decorative Latin ghost word from the category slug (Anton-friendly).
  const ghostWord = useMemo(
    () => product.categorySlug.replace(/-/g, ' ').toUpperCase(),
    [product.categorySlug]
  );

  const stripImages = useMemo(
    () =>
      catalog
        .slice(0, 12)
        .map((p) => resolveProductImageUrl(p.images?.[0]?.url, p.slug, p.categorySlug)),
    [catalog]
  );

  return (
    <ObsidianShell
      stripImages={stripImages}
      themeColor={themeColor}
      className="ob-pdp"
      marquee={{ cta: { label: PDP.buyNow, href: '/products' } }}
    >
      <ProductViewTracker productId={product.id} price={product.price} title={product.title} />

      <section className="pdp-hero">
        <div className="container">
          <SplitBadge dark="ALMA" light="PRODUCT" />
          <FloatingWord text={ghostWord} tone="light" className="pdp-hero-word" />
        </div>
      </section>

      <section className="pdp-body">
        <div className="container">
          <nav className="ob-crumb" aria-label="Breadcrumb">
            <Link href="/">{BREADCRUMB.home}</Link>
            <span aria-hidden>/</span>
            <Link href={`/products?category=${product.categorySlug}`}>{product.categoryName}</Link>
            <span aria-hidden>/</span>
            <span className="ob-crumb-cur">{product.title}</span>
          </nav>

          {isMatchingSet ? (
            <div className="ob-pdp-set">
              <ProductMatchingSetPDP product={product} />
            </div>
          ) : (
            <div className="ob-pdp-grid">
              <div data-ob-reveal>
                <ObsidianProductGallery
                  images={product.images}
                  title={product.title}
                  aspectRatio={product.aspectRatio}
                  productSlug={product.slug}
                  categorySlug={product.categorySlug}
                  onActiveColor={onActiveColor}
                />
              </div>
              <div data-ob-reveal>
                <ObsidianProductDetails product={product} />
              </div>
            </div>
          )}

          {related.length > 0 && (
            <section className="pdp-rail">
              <div className="products-head" data-ob-reveal>
                <h3>
                  <span className="dot" /> {PDP.relatedTitle}
                </h3>
                <Link href={`/products?category=${product.categorySlug}`} className="see-all bn">
                  সব দেখুন ▶
                </Link>
              </div>
              <div className="ob-shop-grid">
                {related.map((p, idx) => (
                  <ObProductCard key={p.id} product={toCardProduct(p)} index={idx} />
                ))}
              </div>
            </section>
          )}

          <section className="pdp-rail">
            <div className="products-head" data-ob-reveal>
              <h3>
                <span className="dot" /> {PDP.recentTitle}
              </h3>
            </div>
            <div className="ob-shop-grid">
              {recent.map((p, idx) => (
                <ObProductCard key={p.id} product={toCardProduct(p)} index={idx} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </ObsidianShell>
  );
}
