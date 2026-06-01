'use client';

import type { ProductImage } from '@/lib/admin-store';
import { uid } from '@/lib/admin-store';
import { shouldUseApi } from '@/lib/data-source';
import { newDatabaseId } from '@/lib/admin-ids';
import type { ImageSpecKey } from '@/lib/image-specs';
import { SmartImageUpload } from '@/components/admin/SmartImageUpload';
import { cn } from '@/lib/utils';

interface FamilyImageSlotProps {
  label: string;
  borderClass: string;
  value: ProductImage | null;
  onChange: (image: ProductImage | null) => void;
  uploadFolder?: string;
  specKey?: ImageSpecKey;
}

export function FamilyImageSlot({
  label,
  borderClass,
  value,
  onChange,
  uploadFolder = 'family-sets',
  specKey = 'familyMatchingCard',
}: FamilyImageSlotProps) {
  return (
    <div className={cn('space-y-2', borderClass && 'rounded-lg p-1')}>
      <p className="text-sm font-medium text-neutral-800">{label}</p>
      <SmartImageUpload
        specKey={specKey}
        value={value?.url ?? ''}
        onChange={(url) => {
          if (!url) {
            onChange(null);
            return;
          }
          onChange({
            id: value?.id ?? (shouldUseApi() ? newDatabaseId() : uid('img')),
            url,
            isFeatured: true,
            sortOrder: 0,
          });
        }}
        onRemove={() => onChange(null)}
        upload={{ mode: 'api', folder: uploadFolder, bucket: 'product-images' }}
      />
    </div>
  );
}
