'use client';

import { SmartImageUpload } from '@/components/admin/SmartImageUpload';
import type { ImageSpecKey } from '@/lib/image-specs';

interface HomepageImageUploadProps {
  specKey: ImageSpecKey;
  label?: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
  onError?: (message: string) => void;
}

export function HomepageImageUpload({
  specKey,
  label,
  value,
  onChange,
  folder,
  onError,
}: HomepageImageUploadProps) {
  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-neutral-700">{label}</p>}
      <SmartImageUpload
        specKey={specKey}
        value={value}
        onChange={onChange}
        upload={{ mode: 'homepage', folder }}
        onError={onError}
        onRemove={() => onChange('')}
      />
    </div>
  );
}
