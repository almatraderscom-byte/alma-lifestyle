'use client';

import type { HomepageImageSlot } from '@/lib/homepage-config-types';
import type { ImageSpecKey } from '@/lib/image-specs';
import { Input } from '@/components/admin/ui/Input';
import { HomepageImageUpload } from '@/components/admin/homepage/HomepageImageUpload';
import { reportHomepageBuilderUploadError } from '@/lib/homepage-upload-error';
import { useAdminToast } from '@/context/AdminToastContext';

interface ImageSlotFieldsProps {
  label: string;
  description?: string;
  folder: string;
  specKey: ImageSpecKey;
  slot: HomepageImageSlot;
  onChange: (slot: HomepageImageSlot) => void;
}

export function ImageSlotFields({
  label,
  description,
  folder,
  specKey,
  slot,
  onChange,
}: ImageSlotFieldsProps) {
  const { toast } = useAdminToast();

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50/80 p-4">
      <div>
        <p className="text-sm font-semibold text-neutral-900">{label}</p>
        {description && <p className="mt-0.5 text-xs text-neutral-500">{description}</p>}
      </div>
      <HomepageImageUpload
        specKey={specKey}
        folder={folder}
        value={slot.url}
        onChange={(url) => onChange({ ...slot, url })}
        onError={(msg) => reportHomepageBuilderUploadError(msg, toast)}
      />
      <Input
        label="Caption (shown below image)"
        value={slot.caption}
        onChange={(e) => onChange({ ...slot, caption: e.target.value })}
        placeholder="e.g. প্রিমিয়াম কাপড় — যাচাইকৃত মান"
      />
      <Input
        label="Alt text (accessibility)"
        value={slot.alt}
        onChange={(e) => onChange({ ...slot, alt: e.target.value })}
        placeholder="Describe the image for screen readers"
      />
      <Input
        label="Placeholder hint (when no image)"
        value={slot.imageHint}
        onChange={(e) => onChange({ ...slot, imageHint: e.target.value })}
      />
    </div>
  );
}
