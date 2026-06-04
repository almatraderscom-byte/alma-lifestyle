'use client';

import { useEffect, useState } from 'react';
import { getCategories, getProducts, uid } from '@/lib/admin-store';
import type {
  BrandStorySectionData,
  CategoriesSectionData,
  CategoryCardConfig,
  CategoryColorClass,
  CollectionBannerSectionData,
  CommunitySectionData,
  CommunityTileConfig,
  FeaturedSectionData,
  HeroSectionData,
  HomepageImageSlot,
  HomepageSectionConfig,
  MarqueeSectionData,
  HomepageCtaData,
  OurProcessSectionData,
  ReviewsSectionData,
  TrustSectionData,
} from '@/lib/homepage-config-types';
import { getDefaultHomepageCta } from '@/lib/homepage-extras';
import { patchImageSlot } from '@/lib/homepage-image-slots';
import { normalizeCommunityTiles } from '@/lib/homepage-migrations';
import { ImageSlotFields } from '@/components/admin/homepage/ImageSlotFields';
import { Input } from '@/components/admin/ui/Input';
import { Textarea } from '@/components/admin/ui/Textarea';
import { Select } from '@/components/admin/ui/Select';
import { ColorSwatchPicker } from '@/components/admin/ui/ColorSwatchPicker';
import { HomepageImageUpload } from '@/components/admin/homepage/HomepageImageUpload';
import { reportHomepageBuilderUploadError } from '@/lib/homepage-upload-error';
import { useAdminToast } from '@/context/AdminToastContext';
import { CinematicModeBanner } from '@/components/admin/homepage/CinematicModeBanner';
import { cn } from '@/lib/utils';

type SectionData = HomepageSectionConfig['data'];

interface EditorProps<T extends SectionData> {
  data: T;
  onChange: (data: T) => void;
}

function ToggleRow({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm">
      <span className="font-medium text-neutral-700">Show section on homepage</span>
      <input type="checkbox" checked={enabled} onChange={onToggle} className="h-4 w-4 accent-[#C97D5D]" />
    </label>
  );
}

export function HeroEditor({
  data,
  onChange,
  cinematicModeOn = true,
}: EditorProps<HeroSectionData> & { cinematicModeOn?: boolean }) {
  const { toast } = useAdminToast();
  return (
    <div className="space-y-4">
      <CinematicModeBanner variant="sections-hero" cinematicOn={cinematicModeOn} />
      <div className={cn(cinematicModeOn && 'opacity-50 pointer-events-none select-none')}>
      <Input label="Caption" value={data.caption} onChange={(e) => onChange({ ...data, caption: e.target.value })} />
      <Input label="Title" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      <Textarea label="Subtitle" rows={3} value={data.subtitle} onChange={(e) => onChange({ ...data, subtitle: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Primary CTA text" value={data.ctaPrimary} onChange={(e) => onChange({ ...data, ctaPrimary: e.target.value })} />
        <Input label="Primary CTA link" value={data.ctaPrimaryHref} onChange={(e) => onChange({ ...data, ctaPrimaryHref: e.target.value })} />
        <Input label="Secondary CTA text" value={data.ctaSecondary} onChange={(e) => onChange({ ...data, ctaSecondary: e.target.value })} />
        <Input label="Secondary CTA link" value={data.ctaSecondaryHref} onChange={(e) => onChange({ ...data, ctaSecondaryHref: e.target.value })} />
      </div>
      <HomepageImageUpload
        specKey="heroImage"
        label="Background image"
        folder="hero"
        value={data.backgroundImageUrl}
        onChange={(url) => {
          console.log('[HomepageBuilder] Hero backgroundImageUrl updated:', url);
          onChange({ ...data, backgroundImageUrl: url });
        }}
        onError={(msg) => reportHomepageBuilderUploadError(msg, toast)}
      />
      <Input label="Image hint (placeholder)" value={data.imageHint} onChange={(e) => onChange({ ...data, imageHint: e.target.value })} />
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-700">Badges</p>
        {data.badges.map((badge, i) => (
          <div key={i} className="flex gap-2">
            <Input value={badge} onChange={(e) => {
              const badges = [...data.badges];
              badges[i] = e.target.value;
              onChange({ ...data, badges });
            }} />
            <button type="button" className="text-red-600 text-sm shrink-0" onClick={() => onChange({ ...data, badges: data.badges.filter((_, j) => j !== i) })}>Remove</button>
          </div>
        ))}
        <button type="button" className="text-sm text-[#C97D5D] font-medium" onClick={() => onChange({ ...data, badges: [...data.badges, 'New badge'] })}>+ Add badge</button>
      </div>
      </div>
    </div>
  );
}

export function MarqueeEditor({ data, onChange }: EditorProps<MarqueeSectionData>) {
  return (
    <Textarea label="Marquee text" rows={3} value={data.text} onChange={(e) => onChange({ ...data, text: e.target.value })} />
  );
}

function CategoryCardEditor({
  label,
  card,
  onChange,
  showSubtitle,
  categories,
}: {
  label: string;
  card: CategoryCardConfig;
  onChange: (card: CategoryCardConfig) => void;
  showSubtitle?: boolean;
  categories: Awaited<ReturnType<typeof getCategories>>;
}) {
  const { toast } = useAdminToast();
  return (
    <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
      <p className="text-sm font-semibold text-neutral-800">{label}</p>
      <Select
        label="Category"
        value={card.categorySlug}
        onChange={(e) => {
          const cat = categories.find((c) => c.slug === e.target.value);
          onChange({
            ...card,
            categorySlug: e.target.value,
            href: cat ? `/categories/${cat.slug}` : card.href,
            displayName: card.displayName || cat?.name || '',
          });
        }}
        options={[
          { value: '', label: 'Select category' },
          ...categories.map((c) => ({ value: c.slug, label: c.name })),
        ]}
      />
      <Input label="Display name override" value={card.displayName} onChange={(e) => onChange({ ...card, displayName: e.target.value })} />
      {showSubtitle && (
        <Input label="Subtitle" value={card.subtitle} onChange={(e) => onChange({ ...card, subtitle: e.target.value })} />
      )}
      <HomepageImageUpload
        specKey="categoryCard"
        label="Background image"
        folder={`categories/${card.categorySlug || 'card'}`}
        value={card.imageUrl}
        onChange={(url) => onChange({ ...card, imageUrl: url })}
        onError={(msg) => reportHomepageBuilderUploadError(msg, toast)}
      />
      <ColorSwatchPicker label="Background color" value={card.bgClass} onChange={(bgClass) => onChange({ ...card, bgClass })} />
      <Input label="Image hint" value={card.imageHint} onChange={(e) => onChange({ ...card, imageHint: e.target.value })} />
    </div>
  );
}

export function CategoriesEditor({ data, onChange }: EditorProps<CategoriesSectionData>) {
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>>([]);

  useEffect(() => {
    void getCategories().then(setCategories);
  }, []);

  return (
    <div className="space-y-4">
      <Input label="Section label" value={data.label} onChange={(e) => onChange({ ...data, label: e.target.value })} />
      <Input label="Section title" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      <CategoryCardEditor label="Featured (large) category" card={data.featured} categories={categories} onChange={(featured) => onChange({ ...data, featured })} showSubtitle />
      {data.stacked.map((card, i) => (
        <CategoryCardEditor
          key={i}
          label={`Stacked category ${i + 1}`}
          card={card}
          categories={categories}
          onChange={(next) => {
            const stacked = [...data.stacked] as CategoriesSectionData['stacked'];
            stacked[i] = next;
            onChange({ ...data, stacked });
          }}
        />
      ))}
    </div>
  );
}

export function FeaturedEditor({ data, onChange }: EditorProps<FeaturedSectionData>) {
  const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof getProducts>>>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void getProducts().then((list) =>
      setCatalog(list.filter((p) => p.status === 'published'))
    );
  }, []);

  const products = catalog;

  return (
    <div className="space-y-4">
      <Input label="Section label" value={data.label} onChange={(e) => onChange({ ...data, label: e.target.value })} />
      <Input label="Section title" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="View all text" value={data.viewAllText} onChange={(e) => onChange({ ...data, viewAllText: e.target.value })} />
        <Input label="View all URL" value={data.viewAllHref} onChange={(e) => onChange({ ...data, viewAllHref: e.target.value })} />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-neutral-700">Product source</legend>
        {(['latest', 'bestsellers', 'manual'] as const).map((src) => (
          <label key={src} className="flex items-center gap-2 text-sm">
            <input type="radio" name="featured-source" checked={data.source === src} onChange={() => onChange({ ...data, source: src })} />
            {src === 'latest' ? 'Latest products' : src === 'bestsellers' ? 'Best sellers' : 'Manual selection'}
          </label>
        ))}
      </fieldset>
      {data.source === 'manual' && (
        <div className="space-y-2 rounded-lg border border-neutral-200 p-3">
          <p className="text-xs text-neutral-600">
            প্রতিটি ম্যাচিং সেট (পুরুষ/মহিলা/ছেলে/মেয়ে) হোমপেজে একটিমাত্র কার্ড হিসেবে দেখাবে। ৪টি
            কার্ডের জন্য ৪টি আলাদা ডিজাইন বা সিম্পল পণ্য বেছে নিন — একই সেটের সব ভ্যারিয়েন্ট নয়।
          </p>
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="max-h-48 overflow-y-auto space-y-1">
            {products
              .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()))
              .map((p) => {
                const checked = data.manualProductIds.includes(p.id);
                return (
                  <label key={p.id} className="flex items-center gap-2 text-sm py-1">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const ids = checked
                          ? data.manualProductIds.filter((id) => id !== p.id)
                          : [...data.manualProductIds, p.id];
                        onChange({ ...data, manualProductIds: ids });
                      }}
                    />
                    {p.title}
                  </label>
                );
              })}
          </div>
        </div>
      )}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-neutral-700">Number of products</legend>
        {([4, 8, 12] as const).map((n) => (
          <label key={n} className="flex items-center gap-2 text-sm">
            <input type="radio" name="product-count" checked={data.productCount === n} onChange={() => onChange({ ...data, productCount: n })} />
            {n}
          </label>
        ))}
      </fieldset>
    </div>
  );
}

const BRAND_STORY_SLOT_LABELS = [
  { label: 'Image 1 — Main (large left)', description: 'Premium fabric — verified quality' },
  { label: 'Image 2 — Top right (small)', description: 'Fabric close-up — cotton texture' },
  { label: 'Image 3 — Bottom right (small)', description: 'Family in ALMA outfits' },
] as const;

export function BrandStoryEditor({ data, onChange }: EditorProps<BrandStorySectionData>) {
  const images = data.images ?? [];

  function updateImage(index: number, patch: Partial<HomepageImageSlot>) {
    const next = patchImageSlot(images, index, patch);
    onChange({
      ...data,
      images: next,
      imageUrl: next[0]?.url ?? '',
      imageCaption: next[0]?.caption ?? '',
      imageHint: next[0]?.imageHint ?? data.imageHint,
    });
  }

  return (
    <div className="space-y-4">
      <Input label="Section label" value={data.label} onChange={(e) => onChange({ ...data, label: e.target.value })} />
      <Input label="Title" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      <Textarea label="Body" rows={5} value={data.body} onChange={(e) => onChange({ ...data, body: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="CTA text" value={data.cta} onChange={(e) => onChange({ ...data, cta: e.target.value })} />
        <Input label="CTA link" value={data.ctaHref} onChange={(e) => onChange({ ...data, ctaHref: e.target.value })} />
      </div>
      <p className="text-sm font-medium text-neutral-800">Collage images (3 slots — same order as preview)</p>
      {BRAND_STORY_SLOT_LABELS.map((meta, index) => (
        <ImageSlotFields
          key={index}
          label={meta.label}
          description={meta.description}
          specKey={index === 0 ? 'brandStoryMain' : 'brandStorySmall'}
          folder={`brand-story/slot-${index + 1}`}
          slot={images[index] ?? { url: '', caption: '', alt: '', imageHint: meta.description }}
          onChange={(slot) => updateImage(index, slot)}
        />
      ))}
    </div>
  );
}

export function ReviewsEditor({ data, onChange }: EditorProps<ReviewsSectionData>) {
  return (
    <div className="space-y-4">
      <Input label="Section title" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      <Input label="Verified purchase label" value={data.verifiedLabel} onChange={(e) => onChange({ ...data, verifiedLabel: e.target.value })} />
      {data.items.map((item) => (
        <div key={item.id} className="rounded-lg border border-neutral-200 p-4 space-y-3">
          <Select
            label="Star rating"
            value={String(item.rating)}
            onChange={(e) =>
              onChange({
                ...data,
                items: data.items.map((r) => (r.id === item.id ? { ...r, rating: Number(e.target.value) } : r)),
              })
            }
            options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} stars` }))}
          />
          <Textarea label="Review text" rows={3} value={item.text} onChange={(e) => onChange({ ...data, items: data.items.map((r) => (r.id === item.id ? { ...r, text: e.target.value } : r)) })} />
          <Input label="Customer name" value={item.name} onChange={(e) => onChange({ ...data, items: data.items.map((r) => (r.id === item.id ? { ...r, name: e.target.value } : r)) })} />
          <Input label="City" value={item.city} onChange={(e) => onChange({ ...data, items: data.items.map((r) => (r.id === item.id ? { ...r, city: e.target.value } : r)) })} />
          <button type="button" className="text-sm text-red-600" onClick={() => onChange({ ...data, items: data.items.filter((r) => r.id !== item.id) })}>Remove review</button>
        </div>
      ))}
      <button
        type="button"
        className="text-sm text-[#C97D5D] font-medium"
        onClick={() =>
          onChange({
            ...data,
            items: [
              ...data.items,
              { id: uid('rev'), rating: 5, text: '', name: '', city: '' },
            ],
          })
        }
      >
        + Add review
      </button>
    </div>
  );
}

export function CollectionBannerEditor({ data, onChange }: EditorProps<CollectionBannerSectionData>) {
  const { toast } = useAdminToast();
  return (
    <div className="space-y-4">
      <Input label="Label" value={data.label} onChange={(e) => onChange({ ...data, label: e.target.value })} />
      <Input label="Title" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      <Textarea label="Subtitle" rows={2} value={data.subtitle} onChange={(e) => onChange({ ...data, subtitle: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="CTA text" value={data.cta} onChange={(e) => onChange({ ...data, cta: e.target.value })} />
        <Input label="CTA link" value={data.href} onChange={(e) => onChange({ ...data, href: e.target.value })} />
      </div>
      <Input label="Promo text" value={data.promo} onChange={(e) => onChange({ ...data, promo: e.target.value })} />
      <ColorSwatchPicker label="Background color" value={data.bgClass} onChange={(bgClass: CategoryColorClass) => onChange({ ...data, bgClass })} />
      <HomepageImageUpload
        specKey="collectionBanner"
        label="Background image (optional)"
        folder="collection-banner"
        value={data.backgroundImageUrl}
        onChange={(url) => onChange({ ...data, backgroundImageUrl: url })}
        onError={(msg) => reportHomepageBuilderUploadError(msg, toast)}
      />
      <Input label="Image hint" value={data.imageHint} onChange={(e) => onChange({ ...data, imageHint: e.target.value })} />
    </div>
  );
}

export function CommunityEditor({ data, onChange }: EditorProps<CommunitySectionData>) {
  const { toast } = useAdminToast();
  const tiles = normalizeCommunityTiles(data.tiles);

  function setTiles(next: CommunityTileConfig[]) {
    onChange({ ...data, tiles: next });
  }

  function updateTile(id: string, patch: Partial<CommunityTileConfig>) {
    setTiles(tiles.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  return (
    <div className="space-y-4">
      <Input label="Section title" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      <Input label="Subtitle" value={data.subtitle} onChange={(e) => onChange({ ...data, subtitle: e.target.value })} />
      <Input label="Instagram URL" value={data.instagramUrl} onChange={(e) => onChange({ ...data, instagramUrl: e.target.value })} />
      <p className="text-sm font-medium text-neutral-800">
        Community photos ({tiles.length} slots — grid order left-to-right)
      </p>
      {tiles.map((tile, i) => (
        <div key={tile.id} className="space-y-2 rounded-lg border border-neutral-200 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-neutral-700">Photo {i + 1}</p>
            {tiles.length > 1 && (
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() => setTiles(tiles.filter((t) => t.id !== tile.id))}
              >
                × Remove
              </button>
            )}
          </div>
          <HomepageImageUpload
            specKey="communityPhoto"
            folder={`community/${tile.id}`}
            value={tile.imageUrl}
            onChange={(url) => updateTile(tile.id, { imageUrl: url })}
            onError={(msg) => reportHomepageBuilderUploadError(msg, toast)}
          />
          <ColorSwatchPicker
            value={tile.bgClass}
            onChange={(bgClass) => updateTile(tile.id, { bgClass })}
          />
          <Input
            label="Caption"
            value={tile.caption}
            onChange={(e) => updateTile(tile.id, { caption: e.target.value })}
          />
          <Input
            label="Alt text"
            value={tile.alt}
            onChange={(e) => updateTile(tile.id, { alt: e.target.value })}
          />
          <Input
            label="Placeholder hint"
            value={tile.hint}
            onChange={(e) => updateTile(tile.id, { hint: e.target.value })}
          />
        </div>
      ))}
      <button
        type="button"
        className="text-sm font-medium text-[#C97D5D]"
        onClick={() =>
          setTiles([
            ...tiles,
            {
              id: uid('comm'),
              bgClass: 'bg-maroon',
              hint: 'Image: New community photo',
              imageUrl: '',
              caption: '',
              alt: '',
            },
          ])
        }
      >
        + Add photo slot
      </button>
    </div>
  );
}

export { FamilyMatchingEditor } from '@/components/admin/homepage/FamilyMatchingEditor';

export function OurProcessEditor({
  data,
  onChange,
  onResetToDefaults,
  resetting,
}: {
  data: OurProcessSectionData;
  onChange: (data: OurProcessSectionData) => void;
  onResetToDefaults?: () => void;
  resetting?: boolean;
}) {
  const { toast } = useAdminToast();
  return (
    <div className="space-y-4">
      {onResetToDefaults && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-amber-900 max-w-md">
            পুরনো তাঁতি/দর্জি টেক্সট আছে? Approved curation copy তে ফিরে যেতে reset করুন।
          </p>
          <button
            type="button"
            disabled={resetting}
            onClick={onResetToDefaults}
            className="shrink-0 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
          >
            {resetting ? 'Resetting…' : 'Reset process copy'}
          </button>
        </div>
      )}
      <div id="our-process-editor-top" className="scroll-mt-4 space-y-4">
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
        <Input label="Section label" value={data.label} onChange={(e) => onChange({ ...data, label: e.target.value })} />
        <Input label="Main heading" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
        <Textarea label="Subtitle" rows={2} value={data.subtitle} onChange={(e) => onChange({ ...data, subtitle: e.target.value })} />
      </div>
      <div className="border-t border-neutral-200 pt-4">
        <p className="text-sm font-semibold text-neutral-900 mb-3">Process steps (6)</p>
      </div>
      {data.steps.map((step, i) => (
        <div key={step.title} className="space-y-3 rounded-lg border border-neutral-200 p-3">
          <p className="text-sm font-semibold text-neutral-800">
            Step {i + 1}: {step.title}
          </p>
          <Input
            label="Icon (emoji)"
            value={step.icon}
            onChange={(e) =>
              onChange({
                ...data,
                steps: data.steps.map((s, j) => (j === i ? { ...s, icon: e.target.value } : s)),
              })
            }
          />
          <HomepageImageUpload
            specKey="ourProcessStep"
            label="Step image"
            folder={`our-process/step-${i + 1}`}
            value={step.imageUrl}
            onChange={(url) =>
              onChange({
                ...data,
                steps: data.steps.map((s, j) => (j === i ? { ...s, imageUrl: url } : s)),
              })
            }
            onError={(msg) => reportHomepageBuilderUploadError(msg, toast)}
          />
          <Input
            label="Caption"
            value={step.caption}
            onChange={(e) =>
              onChange({
                ...data,
                steps: data.steps.map((s, j) => (j === i ? { ...s, caption: e.target.value } : s)),
              })
            }
          />
          <Input
            label="Alt text"
            value={step.alt}
            onChange={(e) =>
              onChange({
                ...data,
                steps: data.steps.map((s, j) => (j === i ? { ...s, alt: e.target.value } : s)),
              })
            }
          />
          <ColorSwatchPicker
            label="Placeholder color"
            value={step.bgClass}
            onChange={(bgClass) =>
              onChange({
                ...data,
                steps: data.steps.map((s, j) => (j === i ? { ...s, bgClass } : s)),
              })
            }
          />
        </div>
      ))}
    </div>
  );
}


export function HomepageCtaEditor({
  data,
  onChange,
}: {
  data: HomepageCtaData;
  onChange: (data: HomepageCtaData) => void;
}) {
  const cta = { ...getDefaultHomepageCta(), ...data };
  return (
    <div id="homepage-cta-editor-top" className="scroll-mt-4 space-y-4">
      <p className="text-xs text-neutral-600">
        Closing band at the bottom of the homepage (editorial and cinematic layouts).
      </p>
      <Input
        label="Heading"
        value={cta.heading}
        onChange={(e) => onChange({ ...cta, heading: e.target.value })}
      />
      <Textarea
        label="Body"
        rows={2}
        value={cta.body}
        onChange={(e) => onChange({ ...cta, body: e.target.value })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Primary CTA text"
          value={cta.primaryCta}
          onChange={(e) => onChange({ ...cta, primaryCta: e.target.value })}
        />
        <Input
          label="Primary CTA link"
          value={cta.primaryHref}
          onChange={(e) => onChange({ ...cta, primaryHref: e.target.value })}
        />
        <Input
          label="Secondary CTA text"
          value={cta.secondaryCta}
          onChange={(e) => onChange({ ...cta, secondaryCta: e.target.value })}
        />
        <Input
          label="Secondary CTA link (optional — blank uses store WhatsApp)"
          value={cta.secondaryHref}
          onChange={(e) => onChange({ ...cta, secondaryHref: e.target.value })}
        />
      </div>
    </div>
  );
}

export function TrustEditor({ data, onChange }: EditorProps<TrustSectionData>) {
  return (
    <div className="space-y-4">
      {data.items.map((item) => (
        <div key={item.id} className="rounded-lg border border-neutral-200 p-4 space-y-3">
          <Input label="Icon (emoji)" value={item.icon} onChange={(e) => onChange({ ...data, items: data.items.map((t) => (t.id === item.id ? { ...t, icon: e.target.value } : t)) })} />
          <Input label="Title" value={item.title} onChange={(e) => onChange({ ...data, items: data.items.map((t) => (t.id === item.id ? { ...t, title: e.target.value } : t)) })} />
          <Input label="Subtitle" value={item.text} onChange={(e) => onChange({ ...data, items: data.items.map((t) => (t.id === item.id ? { ...t, text: e.target.value } : t)) })} />
          <button type="button" className="text-sm text-red-600" onClick={() => onChange({ ...data, items: data.items.filter((t) => t.id !== item.id) })}>Remove</button>
        </div>
      ))}
      <button
        type="button"
        className="text-sm text-[#C97D5D] font-medium"
        onClick={() =>
          onChange({
            ...data,
            items: [...data.items, { id: uid('trust'), icon: '✓', title: '', text: '' }],
          })
        }
      >
        + Add item
      </button>
    </div>
  );
}

export { ToggleRow };
