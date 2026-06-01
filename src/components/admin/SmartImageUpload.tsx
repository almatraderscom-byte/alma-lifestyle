'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getImageSpec, getAspectRatioDecimal, type ImageSpecKey } from '@/lib/image-specs';
import {
  getImageDimensionWarnings,
  validateImageFileBasics,
} from '@/lib/image-upload-validation';
import { uploadPreparedHomepageImage } from '@/lib/homepage-upload';
import { uploadImageApi } from '@/lib/admin-api';
import { prepareImageForUpload } from '@/lib/prepare-image-upload';
import { shouldUseApi } from '@/lib/data-source';
import { isDataImageUrl } from '@/lib/image-url-display';
import { cn } from '@/lib/utils';

export type SmartImageUploadTarget =
  | { mode: 'homepage'; folder: string }
  | {
      mode: 'api';
      folder: string;
      bucket?: 'product-images' | 'homepage-images';
    };

interface SmartImageUploadProps {
  specKey: ImageSpecKey;
  value?: string;
  currentUrl?: string;
  onUpload?: (url: string) => void;
  onChange?: (url: string) => void;
  onRemove?: () => void;
  upload: SmartImageUploadTarget;
  onError?: (message: string) => void;
  showFaviconCacheHint?: boolean;
  className?: string;
}

export function ImageSpecGuidance({ specKey }: { specKey: ImageSpecKey }) {
  const spec = getImageSpec(specKey);
  const aspectRatioDecimal = getAspectRatioDecimal(spec);
  const previewHeight = Math.min(80, 60 / aspectRatioDecimal);

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
      <div className="flex items-start gap-2">
        <span className="shrink-0 text-blue-600" aria-hidden>
          ℹ️
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-800">{spec.label}</p>
          <p className="mt-1 text-gray-600">{spec.description}</p>
          <p className="mt-1 text-gray-600">
            <strong>Recommended:</strong> {spec.recommended.width}×{spec.recommended.height}px (
            {spec.aspectRatio})
          </p>
          <p className="text-gray-600">
            <strong>Max size:</strong> {spec.maxSizeMB}MB • <strong>Formats:</strong>{' '}
            {spec.acceptedFormats.join(', ').toUpperCase()}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">Aspect ratio:</span>
            <div
              className="border-2 border-blue-400 bg-blue-100"
              style={{ width: 60, height: previewHeight }}
              aria-hidden
            />
          </div>
          {spec.tips.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-blue-700 hover:text-blue-900">
                💡 Tips for best results
              </summary>
              <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-gray-700">
                {spec.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function FaviconCacheHint() {
  return (
    <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
      <p>
        💡 <strong>Browser cache:</strong> Favicons are heavily cached. To see the new icon right
        away:
      </p>
      <ul className="mt-1 list-inside list-disc">
        <li>
          Hard refresh: <kbd className="rounded bg-yellow-100 px-1">Ctrl+Shift+R</kbd> (
          <kbd className="rounded bg-yellow-100 px-1">Cmd+Shift+R</kbd> on Mac)
        </li>
        <li>Open the storefront in a private/incognito window</li>
        <li>Other visitors may take up to 24–48 hours to see the updated icon</li>
      </ul>
    </div>
  );
}

function DataUrlStoredWarning({ onClear }: { onClear?: () => void }) {
  return (
    <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      <p className="font-medium">Legacy inline image detected</p>
      <p className="mt-1">
        This image was saved as embedded data instead of a storage URL. Upload the file again to
        store it in cloud storage. Preview still works below.
      </p>
      {onClear && (
        <button
          type="button"
          className="mt-2 text-sm font-medium text-amber-800 underline hover:text-amber-950"
          onClick={onClear}
        >
          Clear and re-upload
        </button>
      )}
    </div>
  );
}

export function SmartImageUpload({
  specKey,
  value,
  currentUrl,
  onUpload,
  onChange,
  onRemove,
  upload,
  onError,
  showFaviconCacheHint,
  className,
}: SmartImageUploadProps) {
  const spec = getImageSpec(specKey);
  const displayUrl = value ?? currentUrl ?? '';
  const isDataUrl = isDataImageUrl(displayUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (isDataUrl) {
      console.warn(
        '[SmartImageUpload] Base64/data URL in settings — upload to storage instead of saving inline data.'
      );
    }
  }, [isDataUrl]);

  const reportError = useCallback(
    (message: string) => {
      setError(message);
      onError?.(message);
    },
    [onError]
  );

  const emitUrl = useCallback(
    (url: string) => {
      if (isDataImageUrl(url)) {
        reportError(
          'Image must be uploaded to storage (Supabase). Configure Supabase env vars, then upload again.'
        );
        return;
      }
      onUpload?.(url);
      onChange?.(url);
    },
    [onChange, onUpload, reportError]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (ext === 'svg' || file.type === 'image/svg+xml') {
        throw new Error('SVG uploads are not supported yet. Please use PNG.');
      }
      if (ext === 'ico' || file.type === 'image/x-icon') {
        throw new Error('ICO uploads are not supported. Please use a 512×512 PNG favicon.');
      }

      if (upload.mode === 'homepage') {
        const prepared = await prepareImageForUpload(file);
        return uploadPreparedHomepageImage(prepared, upload.folder);
      }

      if (!shouldUseApi()) {
        throw new Error(
          'Cloud storage is not configured. Set Supabase env vars and enable API mode — images cannot be saved as inline base64.'
        );
      }

      const prepared = await prepareImageForUpload(file);
      return uploadImageApi(prepared, upload.folder, upload.bucket ?? 'homepage-images');
    },
    [upload]
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError('');
      setWarning('');

      const basics = validateImageFileBasics(file, spec);
      if (basics.error) {
        reportError(basics.error);
        return;
      }

      const dimWarning = await getImageDimensionWarnings(file, spec);
      if (dimWarning) {
        setWarning(dimWarning);
      }

      setUploading(true);
      try {
        const url = await uploadFile(file);
        emitUrl(url);
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [emitUrl, reportError, spec, uploadFile]
  );

  const acceptList = spec.acceptedFormats.map((f) => `.${f}`).join(',');

  const handleClearDataUrl = useCallback(() => {
    emitUrl('');
    onRemove?.();
  }, [emitUrl, onRemove]);

  return (
    <div className={cn('space-y-2', className)}>
      <ImageSpecGuidance specKey={specKey} />
      {showFaviconCacheHint || specKey === 'favicon' ? <FaviconCacheHint /> : null}
      {isDataUrl ? <DataUrlStoredWarning onClear={handleClearDataUrl} /> : null}

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && fileInputRef.current?.click()}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) void handleFileSelect(file);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          dragOver && 'border-[#C97D5D] bg-[#C97D5D]/5'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptList}
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFileSelect(file);
            e.target.value = '';
          }}
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-sm text-blue-600">Uploading…</p>
          </div>
        ) : displayUrl ? (
          <div className="space-y-3">
            <div
              className="relative mx-auto max-w-[220px] overflow-hidden rounded border border-gray-200"
              style={{
                aspectRatio: `${spec.recommended.width} / ${spec.recommended.height}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <p className="text-sm text-gray-600">Click to replace image</p>
            {(onRemove || isDataUrl) && (
              <button
                type="button"
                className="text-sm text-red-600 hover:text-red-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearDataUrl();
                }}
              >
                Remove image
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl" aria-hidden>
              📤
            </div>
            <p className="text-sm font-medium text-gray-700">Drop image here or click to browse</p>
            <p className="text-xs text-gray-500">
              {spec.recommended.width}×{spec.recommended.height}px • Max {spec.maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

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
    </div>
  );
}
