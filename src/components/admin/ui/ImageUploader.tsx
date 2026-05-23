'use client';

import { useCallback, useRef, useState } from 'react';
import type { ProductImage } from '@/lib/admin-store';
import { uid } from '@/lib/admin-store';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const readers = Array.from(files).map(
        (file) =>
          new Promise<ProductImage>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: uid('img'),
                url: reader.result as string,
                isFeatured: images.length === 0,
                sortOrder: images.length,
              });
            };
            reader.readAsDataURL(file);
          })
      );
      Promise.all(readers).then((newImages) => {
        const merged = [...images, ...newImages].map((img, i) => ({
          ...img,
          sortOrder: i,
          isFeatured: i === 0 ? true : img.isFeatured && !newImages.some((n) => n.isFeatured),
        }));
        if (!merged.some((m) => m.isFeatured) && merged[0]) {
          merged[0].isFeatured = true;
        }
        onChange(merged);
      });
    },
    [images, onChange]
  );

  function setFeatured(id: string) {
    onChange(
      images.map((img) => ({
        ...img,
        isFeatured: img.id === id,
      }))
    );
  }

  function removeImage(id: string) {
    const next = images.filter((i) => i.id !== id);
    if (next.length && !next.some((i) => i.isFeatured)) {
      next[0].isFeatured = true;
    }
    onChange(next.map((img, i) => ({ ...img, sortOrder: i })));
  }

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          processFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-10 text-center cursor-pointer transition-colors',
          dragOver ? 'border-[#C97D5D] bg-[#C97D5D]/5' : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50'
        )}
      >
        <p className="text-sm font-medium text-neutral-700">Drop images here or click to upload</p>
        <p className="text-xs text-neutral-500 mt-1">PNG, JPG up to 5MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100"
              >
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-neutral-200" />
                )}
                {img.isFeatured && (
                  <span className="absolute top-2 left-2 rounded bg-[#C97D5D] px-2 py-0.5 text-[10px] font-semibold text-white uppercase">
                    Featured
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.isFeatured && (
                    <button
                      type="button"
                      className="text-xs text-white underline"
                      onClick={() => setFeatured(img.id)}
                    >
                      Set featured
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-full bg-white/90 p-1.5 text-red-600"
                    onClick={() => removeImage(img.id)}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
