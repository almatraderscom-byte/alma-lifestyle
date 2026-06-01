'use client';

import { SmartImageUpload, type SmartImageUploadTarget } from '@/components/admin/SmartImageUpload';
import type { ImageSpecKey } from '@/lib/image-specs';

interface SingleImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  specKey?: ImageSpecKey;
  uploadFolder?: string;
  bucket?: 'product-images' | 'homepage-images';
  onError?: (message: string) => void;
}

/** @deprecated Prefer SmartImageUpload with an explicit specKey */
export function SingleImageUploader({
  label,
  value,
  onChange,
  specKey = 'categoryCard',
  uploadFolder = 'homepage',
  bucket = 'homepage-images',
  onError,
}: SingleImageUploaderProps) {
  const upload: SmartImageUploadTarget = {
    mode: 'api',
    folder: uploadFolder,
    bucket,
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-neutral-700">{label}</p>}
      <SmartImageUpload
        specKey={specKey}
        value={value}
        onChange={onChange}
        upload={upload}
        onError={onError}
        onRemove={() => onChange('')}
      />
    </div>
  );
}
