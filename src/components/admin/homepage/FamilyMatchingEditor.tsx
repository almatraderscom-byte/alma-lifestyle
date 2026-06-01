'use client';

import type { FamilyMatchingSectionData } from '@/lib/homepage-config-types';
import { ImageSlotFields } from '@/components/admin/homepage/ImageSlotFields';
import { Input } from '@/components/admin/ui/Input';
import { Textarea } from '@/components/admin/ui/Textarea';
import { ColorSwatchPicker } from '@/components/admin/ui/ColorSwatchPicker';
import { HomepageImageUpload } from '@/components/admin/homepage/HomepageImageUpload';
import { reportHomepageBuilderUploadError } from '@/lib/homepage-upload-error';
import { useAdminToast } from '@/context/AdminToastContext';

interface FamilyMatchingEditorProps {
  data: FamilyMatchingSectionData;
  onChange: (data: FamilyMatchingSectionData) => void;
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="border-t border-neutral-200 pt-4 mt-2">
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
    </div>
  );
}

export function FamilyMatchingEditor({ data, onChange }: FamilyMatchingEditorProps) {
  const { toast } = useAdminToast();

  return (
    <div className="space-y-4">
      <div id="family-matching-editor-top" className="scroll-mt-4 space-y-4">
        <label className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm">
          <span className="font-medium text-neutral-700">Show section on homepage</span>
          <input
            type="checkbox"
            checked={data.show !== false}
            onChange={(e) => onChange({ ...data, show: e.target.checked })}
            className="h-4 w-4 accent-[#C97D5D]"
          />
        </label>

        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Text content</p>

        <Input
          label="Section label"
          placeholder="ফ্যামিলি ম্যাচিং"
          value={data.label}
          onChange={(e) => onChange({ ...data, label: e.target.value })}
        />
        <Input
          label="Main heading"
          placeholder="পরিবার একসাথে সাজুক"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
        />
        <Textarea
          label="Body text (description)"
          rows={4}
          placeholder="বাবা, মা, ছেলে, মেয়ে — সবার জন্য মিলিয়ে ডিজাইন..."
          value={data.body}
          onChange={(e) => onChange({ ...data, body: e.target.value })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="CTA button text"
            placeholder="ফ্যামিলি সেট দেখুন →"
            value={data.ctaText}
            onChange={(e) => onChange({ ...data, ctaText: e.target.value })}
          />
          <Input
            label="CTA button link"
            placeholder="/products?type=family-set"
            value={data.ctaHref}
            onChange={(e) => onChange({ ...data, ctaHref: e.target.value })}
          />
        </div>
      </div>

      <SectionDivider title="Main image (large right in preview)" />
      <ImageSlotFields
        label="Banner image"
        description="Family wearing matching ALMA outfits — outdoor golden hour"
        specKey="familyMatchingMain"
        folder="family-matching/banner"
        slot={data.banner}
        onChange={(banner) => onChange({ ...data, banner })}
      />

      <SectionDivider title="Type cards (4 — Men, Women, Boy, Girl)" />
      {data.cards.map((card, i) => (
        <div key={card.id} className="space-y-3 rounded-lg border border-neutral-200 p-3">
          <p className="text-xs font-semibold text-neutral-700">
            Card {i + 1}: {card.label || 'Untitled'}
          </p>
          <Input
            label="Card label"
            value={card.label}
            onChange={(e) =>
              onChange({
                ...data,
                cards: data.cards.map((c) =>
                  c.id === card.id ? { ...c, label: e.target.value } : c
                ),
              })
            }
          />
          <Input
            label="Card link"
            value={card.href}
            onChange={(e) =>
              onChange({
                ...data,
                cards: data.cards.map((c) =>
                  c.id === card.id ? { ...c, href: e.target.value } : c
                ),
              })
            }
          />
          <HomepageImageUpload
            specKey="familyMatchingCard"
            label="Card image"
            folder={`family-matching/${card.id}`}
            value={card.imageUrl}
            onChange={(url) =>
              onChange({
                ...data,
                cards: data.cards.map((c) => (c.id === card.id ? { ...c, imageUrl: url } : c)),
              })
            }
            onError={(msg) => reportHomepageBuilderUploadError(msg, toast)}
          />
          <Input
            label="Caption"
            value={card.caption}
            onChange={(e) =>
              onChange({
                ...data,
                cards: data.cards.map((c) =>
                  c.id === card.id ? { ...c, caption: e.target.value } : c
                ),
              })
            }
          />
          <Input
            label="Alt text"
            value={card.alt}
            onChange={(e) =>
              onChange({
                ...data,
                cards: data.cards.map((c) =>
                  c.id === card.id ? { ...c, alt: e.target.value } : c
                ),
              })
            }
          />
          <ColorSwatchPicker
            label="Placeholder color"
            value={card.bgClass}
            onChange={(bgClass) =>
              onChange({
                ...data,
                cards: data.cards.map((c) => (c.id === card.id ? { ...c, bgClass } : c)),
              })
            }
          />
        </div>
      ))}
    </div>
  );
}
