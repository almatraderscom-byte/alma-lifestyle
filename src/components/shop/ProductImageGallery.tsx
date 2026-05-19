'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EASE_LUXURY, DURATION } from '@/lib/motion';

interface ProductImageGalleryProps {
  images: string[];
  title: string;
}

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const displayImages = images.length > 0 ? images : [images[0] || ''];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-alma-champagne shadow-[var(--shadow-premium)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.normal, ease: EASE_LUXURY }}
            className="absolute inset-0"
          >
            <Image
              src={displayImages[activeIndex]}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {displayImages.length > 1 && (
        
        <div className="grid grid-cols-4 gap-2.5">
          {displayImages.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative aspect-square overflow-hidden transition-all duration-400',
                activeIndex === i
                  ? 'ring-2 ring-alma-gold ring-offset-2 ring-offset-alma-cream'
                  : 'opacity-70 hover:opacity-100'
              )}
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
