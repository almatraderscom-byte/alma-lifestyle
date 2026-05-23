'use client';

import { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toBanglaNumber } from '@/lib/format-bn';

export interface GalleryImage {
  id: string;
  bgClass: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  title: string;
  aspectRatio?: '3/4' | '1/1';
}

export function ProductGallery({
  images,
  title,
  aspectRatio = '3/4',
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zooming, setZooming] = useState(false);

  const displayImages = images.length > 0 ? images : [{ id: '1', bgClass: 'bg-secondary' }];
  const active = displayImages[activeIndex] ?? displayImages[0];

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -50 && activeIndex < displayImages.length - 1) {
      setActiveIndex((i) => i + 1);
    } else if (info.offset.x > 50 && activeIndex > 0) {
      setActiveIndex((i) => i - 1);
    }
  }

  return (
    <div className="space-y-3">
      <motion.div
        className={cn(
          'relative overflow-hidden rounded-xl bg-secondary',
          aspectRatio === '3/4' ? 'aspect-[3/4]' : 'aspect-square'
        )}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        onHoverStart={() => setZooming(true)}
        onHoverEnd={() => setZooming(false)}
      >
        <motion.div
          key={active.id}
          className={cn('absolute inset-0', active.bgClass)}
          initial={{ opacity: 0.6 }}
          animate={{
            opacity: 1,
            scale: zooming ? 1.05 : 1,
          }}
          transition={{ duration: 0.35 }}
          role="img"
          aria-label={title}
        />
        <span className="absolute bottom-3 right-3 rounded-md bg-primary/70 text-secondary font-bn-body text-xs px-2 py-1 md:hidden">
          {toBanglaNumber(activeIndex + 1)} / {toBanglaNumber(displayImages.length)}
        </span>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {displayImages.map((img, index) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              'relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors',
              index === activeIndex ? 'border-accent' : 'border-border-subtle'
            )}
            aria-label={`ছবি ${toBanglaNumber(index + 1)}`}
          >
            <div className={cn('absolute inset-0', img.bgClass)} />
          </button>
        ))}
      </div>
    </div>
  );
}
