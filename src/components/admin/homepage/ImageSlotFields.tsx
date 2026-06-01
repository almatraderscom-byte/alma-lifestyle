'use client';

import type { HomepageImageSlot } from '@/lib/homepage-config-types';
import { Input } from '@/components/admin/ui/Input';
import { HomepageImageUpload } from '@/components/admin/homepage/HomepageImageUpload';
import { reportHomepageBuilderUploadError } from '@/lib/homepage-upload-error';
import { useAdminToast } from '@/context/AdminToastContext';

interface ImageSlotFieldsProps {
  label: string;
  description?: string;
  folder: string;
  slot: HomepageImageSlot;
  onChange: (slot: HomepageImageSlot) => void;
}

export function ImageSlotFields({
  label,
  description,
  folder,
  slot,
  onChange,
}: ImageSlotFieldsProps) {
  const { toast } = useAdminToast();

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-neutral-900">{label}</p>
        {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
      </div>
      <HomepageImageUpload
        label="Image"
        folder={folder}
        value={slot.url}
        onChange={(url) => onChange({ ...slot, url })}
        onError={(msg) => reportHomepageBuilderUploadError(msg, toast)}
      />
      <Input
        label="Caption (shown below image)"
        value={slot.caption}
        onChange={(e) => onChange({ ...slot, caption: e.target.value })}
        placeholder="e.g. তাঁতিদের সাথে — সিরাজগঞ্জ"
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
