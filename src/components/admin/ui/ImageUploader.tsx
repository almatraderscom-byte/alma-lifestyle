'use client';

import { useCallback, useRef, useState } from 'react';
import type { ProductImage } from '@/lib/admin-store';
import { uid } from '@/lib/admin-store';
import { uploadImageApi } from '@/lib/admin-api';
import { shouldUseApi } from '@/lib/data-source';
import {
  formatCompressionNotice,
  prepareImageForUploadDetailed,
} from '@/lib/prepare-image-upload';
import {
  getImageDimensionWarnings,
  validateImageFileBasics,
} from '@/lib/image-upload-validation';
import { getImageSpec } from '@/lib/image-specs';
import { ImageSpecGuidance } from '@/components/admin/SmartImageUpload';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const primarySpec = getImageSpec('productPrimary');
  const gallerySpec = getImageSpec('productGallery');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setUploading(true);
      setError('');
      setWarning('');

      try {
        const newImages: ProductImage[] = [];
        const warnings: string[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const spec = images.length === 0 && i === 0 ? primarySpec : gallerySpec;
          const basics = validateImageFileBasics(file, spec);
          if (basics.error) {
            setError(basics.error);
            return;
          }
          const dimWarning = await getImageDimensionWarnings(file, spec);
          if (dimWarning) warnings.push(dimWarning);

          let url: string;
          if (!shouldUseApi()) {
            setError(
              'Cloud storage is not configured. Enable Supabase — product images cannot be saved as inline base64.'
            );
            return;
          }
          const { file: prepared, compressed, originalBytes } =
            await prepareImageForUploadDetailed(file, {
              maxSizeMB: spec.maxSizeMB,
              maxWidthOrHeight: Math.max(
                spec.recommended.width,
                spec.recommended.height
              ),
            });
          if (compressed) {
            warnings.push(formatCompressionNotice(originalBytes, prepared.size));
          }
          url = await uploadImageApi(prepared, 'products');

          newImages.push({
            id: uid('img'),
            url,
            isFeatured: images.length === 0 && i === 0,
            sortOrder: images.length + i,
          });
        }

        if (warnings.length) {
          setWarning(warnings[0]);
        }

        const merged = [...images, ...newImages].map((img, idx) => ({
          ...img,
          sortOrder: idx,
          isFeatured: idx === 0 ? true : img.isFeatured && !newImages.some((n) => n.isFeatured),
        }));
        if (!merged.some((m) => m.isFeatured) && merged[0]) {
          merged[0].isFeatured = true;
        }
        onChange(merged);
      } finally {
        setUploading(false);
      }
    },
    [gallerySpec, images, onChange, primarySpec]
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
      <ImageSpecGuidance specKey="productPrimary" />
      <ImageSpecGuidance specKey="productGallery" />

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          ❌ {error}
        </div>
      )}
      {warning && (
        <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          ⚠️ {warning}
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void processFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-10 text-center cursor-pointer transition-colors',
          dragOver ? 'border-[#C97D5D] bg-[#C97D5D]/5' : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50',
          uploading && 'opacity-60 pointer-events-none'
        )}
      >
        {uploading ? (
          <p className="text-sm text-neutral-600 flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#C97D5D] border-t-transparent" />
            Optimizing & uploading…
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-neutral-700">Drop images here or click to upload</p>
            <p className="text-xs text-neutral-500 mt-1">
              {primarySpec.recommended.width}×{primarySpec.recommended.height}px (main) • Larger
              than {primarySpec.maxSizeMB}MB? We compress automatically
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => void processFiles(e.target.files)}
        />
      </div>

      <p className="text-xs text-neutral-500">
        প্রথম ছবিটি মূল ছবি। ৩–৫টি ছবি যোগ করলে পণ্য কার্ডে স্বয়ংক্রিয়ভাবে ঘুরে দেখাবে — ক্রেতাদের
        জন্য ভালো অভিজ্ঞতা।
      </p>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((img) => (
              <div
                key={img.id}
                className="group relative aspect-[4/5] rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100"
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
