'use client';

import { useCallback, useRef, useState } from 'react';
import { uploadHomepageImage } from '@/lib/homepage-upload';
import { cn } from '@/lib/utils';

interface HomepageImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  /** Folder under homepage-images bucket, e.g. hero, categories */
  folder: string;
  onError?: (message: string) => void;
}

export function HomepageImageUpload({
  label,
  value,
  onChange,
  folder,
  onError,
}: HomepageImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const processFile = useCallback(
    async (file: File | undefined) => {
      if (!file?.type.match(/^image\/(jpeg|png|webp)$/)) {
        onError?.('Please choose a JPEG, PNG, or WebP image');
        return;
      }
      setUploading(true);
      try {
        const url = await uploadHomepageImage(file, folder);
        console.log('[HomepageBuilder] Image set in section state:', url);
        onChange(url);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        console.error('[HomepageBuilder] Upload failed:', message);
        onError?.(message);
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange, onError]
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
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors min-h-[120px]',
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
          <img src={value} alt="" className="max-h-40 rounded object-contain" />
        ) : (
          <p className="text-sm text-neutral-600">
            Drop image or click — auto-compressed, max 4MB upload
          </p>
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
        <>
          <p className="text-xs text-neutral-500 break-all">{value}</p>
          <button
            type="button"
            className="text-xs text-red-600 hover:underline"
            onClick={() => onChange('')}
          >
            Remove image
          </button>
        </>
      )}
    </div>
  );
}
