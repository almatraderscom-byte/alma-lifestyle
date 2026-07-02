'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { resolveProductImageUrl } from '@/lib/default-images';
import type { StorefrontGalleryImage } from '@/lib/product-gallery';
import { hexFromBgClass } from './obsidian-theme';

interface ObsidianProductGalleryProps {
  images: StorefrontGalleryImage[];
  title: string;
  aspectRatio?: '3/4' | '1/1';
  productSlug?: string;
  categorySlug?: string;
  /** Reports the active image's dominant swatch so the page can tint to it —
   *  the PDP equivalent of the hero's per-slide theming (requirement #1). */
  onActiveColor?: (hex: string | undefined) => void;
}

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

/** Obsidian PDP gallery — large fading main image + thumbnail rail, reusing the
 *  existing image-resolution pipeline. The active image's swatch drives the
 *  page background tint. */
export function ObsidianProductGallery({
  images,
  title,
  aspectRatio = '3/4',
  productSlug,
  categorySlug,
  onActiveColor,
}: ObsidianProductGalleryProps) {
  const displayImages: StorefrontGalleryImage[] = useMemo(() => {
    if (images.length > 0) {
      return images.map((img) => ({
        ...img,
        url: productSlug ? resolveProductImageUrl(img.url, productSlug, categorySlug) : img.url,
      }));
    }
    return productSlug
      ? [
          {
            id: 'default',
            bgClass: 'bg-cream',
            url: resolveProductImageUrl(undefined, productSlug, categorySlug),
          },
        ]
      : [{ id: 'placeholder', bgClass: 'bg-secondary' }];
  }, [images, productSlug, categorySlug]);

  const [activeIndex, setActiveIndex] = useState(0);
  const active = displayImages[activeIndex] ?? displayImages[0];
  const hasMultiple = displayImages.length > 1;

  // Only real product images (index-aligned with the AdminProduct.images the
  // visual editor saves) are click-to-edit. When we fell back to a synthetic
  // default/placeholder there is no DB row to write, so we leave it untagged.
  const editable = images.length > 0;

  // Report active colour up to the shell whenever the visible image changes.
  useEffect(() => {
    onActiveColor?.(hexFromBgClass(active?.bgClass));
  }, [active?.bgClass, onActiveColor]);

  const aspectClass = aspectRatio === '3/4' ? 'ob-ar-34' : 'ob-ar-11';

  return (
    <div className="ob-gallery">
      <div className={`ob-gallery-main ${aspectClass}`}>
        <span className="ob-gallery-glow" aria-hidden />
        <AnimatePresence mode="wait">
          <motion.div
            key={`${active?.id}-${activeIndex}`}
            className="ob-gallery-frame"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.55, ease: EASE }}
            data-cms-field={editable ? `images.${activeIndex}.url` : undefined}
            data-cms-type={editable ? 'image' : undefined}
            data-cms-label={editable ? `Product image ${activeIndex + 1}` : undefined}
          >
            {active?.url ? (
              <Image
                src={active.url}
                alt={`${title} — ALMA Lifestyle`}
                fill
                className="object-cover ob-gallery-img"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={activeIndex === 0}
              />
            ) : null}
            <div className="ob-gallery-veil" aria-hidden />
          </motion.div>
        </AnimatePresence>
        {hasMultiple && (
          <span className="ob-gallery-count" aria-hidden>
            {activeIndex + 1} / {displayImages.length}
          </span>
        )}
      </div>

      {hasMultiple && (
        <div className="ob-gallery-thumbs" role="tablist" aria-label={title}>
          {displayImages.map((img, index) => (
            <button
              key={img.id}
              type="button"
              className={`ob-gallery-thumb${index === activeIndex ? ' on' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`ছবি ${index + 1}`}
              aria-selected={index === activeIndex}
              role="tab"
              data-cms-field={editable ? `images.${index}.url` : undefined}
              data-cms-type={editable ? 'image' : undefined}
              data-cms-label={editable ? `Product image ${index + 1}` : undefined}
            >
              {img.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.url} alt="" />
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
