'use client';

import { useCallback, useRef, useState } from 'react';
import { uploadImageApi } from '@/lib/admin-api';
import { shouldUseApi } from '@/lib/data-source';
import { prepareImageForUpload } from '@/lib/prepare-image-upload';
import { cn } from '@/lib/utils';

interface SingleImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  uploadFolder?: string;
  bucket?: 'product-images' | 'homepage-images';
  onError?: (message: string) => void;
}

export function SingleImageUploader({
  label,
  value,
  onChange,
  hint,
  uploadFolder = 'homepage',
  bucket = 'homepage-images',
  onError,
}: SingleImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const processFile = useCallback(
    async (file: File | undefined) => {
      if (!file?.type.startsWith('image/')) {
        onError?.('Please choose a JPEG, PNG, or WebP image');
        return;
      }
      setUploading(true);
      try {
        if (shouldUseApi()) {
          const prepared = await prepareImageForUpload(file);
          const url = await uploadImageApi(prepared, uploadFolder, bucket);
          onChange(url);
        } else {
          const reader = new FileReader();
          reader.onload = () => onChange(reader.result as string);
          reader.readAsDataURL(file);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        onError?.(message);
      } finally {
        setUploading(false);
      }
    },
    [bucket, onChange, onError, uploadFolder]
  );

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-neutral-700">{label}</p>}
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
          void processFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors',
          dragOver ? 'border-[#C97D5D] bg-[#C97D5D]/5' : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50',
          uploading && 'pointer-events-none opacity-70'
        )}
      >
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#C97D5D] border-t-transparent" />
          </span>
        )}
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="max-h-32 rounded object-cover" />
        ) : (
          <>
            <p className="text-sm text-neutral-600">Drop image or click to upload</p>
            {hint && <p className="text-xs text-neutral-400 mt-1">{hint}</p>}
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            void processFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {value && (
        <button
          type="button"
          className="text-xs text-red-600 hover:underline"
          onClick={() => onChange('')}
        >
          Remove image
        </button>
      )}
    </div>
  );
}
