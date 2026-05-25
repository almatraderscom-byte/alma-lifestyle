'use client';

import { useCallback, useRef, useState } from 'react';
import { prepareImageForUpload } from '@/lib/prepare-image-upload';
import { uploadPreparedHomepageImage } from '@/lib/homepage-upload';
import { cn } from '@/lib/utils';

interface HomepageImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  /** Folder under homepage-images bucket, e.g. hero, categories */
  folder: string;
  onError?: (message: string) => void;
}

function reportUploadError(message: string, onError?: (message: string) => void) {
  console.error('[HomepageUpload] FAILED:', message);
  if (onError) {
    onError(message);
  } else {
    window.alert(`Image upload failed: ${message}`);
  }
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
  const [lastError, setLastError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;

      console.log('[HomepageUpload] File selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        const msg = 'Please choose a JPEG, PNG, or WebP image';
        setLastError(msg);
        reportUploadError(msg, onError);
        return;
      }

      setUploading(true);
      setLastError(null);

      try {
        console.log('[HomepageUpload] Step 1: Preparing/compressing image...');
        const prepared = await prepareImageForUpload(file);
        console.log('[HomepageUpload] Compressed to:', prepared.size, 'bytes');

        console.log('[HomepageUpload] Step 2: Uploading to Supabase...');
        const url = await uploadPreparedHomepageImage(prepared, folder);
        console.log('[HomepageUpload] Step 3: Got URL:', url);

        onChange(url);
        console.log('[HomepageUpload] Step 4: Parent state updated');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        console.error('[HomepageUpload] Error details:', err);
        setLastError(message);
        reportUploadError(message, onError);
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange, onError]
  );

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-neutral-700">{label}</p>}
      {lastError && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {lastError}
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
          void processFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors min-h-[120px]',
          dragOver ? 'border-[#C97D5D] bg-[#C97D5D]/5' : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50',
          uploading && 'pointer-events-none opacity-70',
          lastError && 'border-red-400'
        )}
      >
        {uploading && (
          <span className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 gap-2">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#C97D5D] border-t-transparent" />
            <span className="text-xs text-neutral-600">Compressing & uploading…</span>
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
            onClick={() => {
              setLastError(null);
              onChange('');
            }}
          >
            Remove image
          </button>
        </>
      )}
    </div>
  );
}
