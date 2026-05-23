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
  FeaturedSectionData,
  HeroSectionData,
  HomepageSectionConfig,
  MarqueeSectionData,
  ReviewsSectionData,
  TrustSectionData,
} from '@/lib/homepage-config-types';
import { Input } from '@/components/admin/ui/Input';
import { Textarea } from '@/components/admin/ui/Textarea';
import { Select } from '@/components/admin/ui/Select';
import { SingleImageUploader } from '@/components/admin/ui/SingleImageUploader';
import { ColorSwatchPicker } from '@/components/admin/ui/ColorSwatchPicker';

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

export function HeroEditor({ data, onChange }: EditorProps<HeroSectionData>) {
  return (
    <div className="space-y-4">
      <Input label="Caption" value={data.caption} onChange={(e) => onChange({ ...data, caption: e.target.value })} />
      <Input label="Title" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      <Textarea label="Subtitle" rows={3} value={data.subtitle} onChange={(e) => onChange({ ...data, subtitle: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Primary CTA text" value={data.ctaPrimary} onChange={(e) => onChange({ ...data, ctaPrimary: e.target.value })} />
        <Input label="Primary CTA link" value={data.ctaPrimaryHref} onChange={(e) => onChange({ ...data, ctaPrimaryHref: e.target.value })} />
        <Input label="Secondary CTA text" value={data.ctaSecondary} onChange={(e) => onChange({ ...data, ctaSecondary: e.target.value })} />
        <Input label="Secondary CTA link" value={data.ctaSecondaryHref} onChange={(e) => onChange({ ...data, ctaSecondaryHref: e.target.value })} />
      </div>
      <SingleImageUploader label="Background image" value={data.backgroundImageUrl} onChange={(url) => onChange({ ...data, backgroundImageUrl: url })} />
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
      <SingleImageUploader label="Background image" value={card.imageUrl} onChange={(url) => onChange({ ...card, imageUrl: url })} />
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

export function BrandStoryEditor({ data, onChange }: EditorProps<BrandStorySectionData>) {
  return (
    <div className="space-y-4">
      <Input label="Section label" value={data.label} onChange={(e) => onChange({ ...data, label: e.target.value })} />
      <Input label="Title" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      <Textarea label="Body" rows={5} value={data.body} onChange={(e) => onChange({ ...data, body: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="CTA text" value={data.cta} onChange={(e) => onChange({ ...data, cta: e.target.value })} />
        <Input label="CTA link" value={data.ctaHref} onChange={(e) => onChange({ ...data, ctaHref: e.target.value })} />
      </div>
      <SingleImageUploader label="Image" value={data.imageUrl} onChange={(url) => onChange({ ...data, imageUrl: url })} />
      <Input label="Image caption" value={data.imageCaption} onChange={(e) => onChange({ ...data, imageCaption: e.target.value })} />
      <Input label="Image hint" value={data.imageHint} onChange={(e) => onChange({ ...data, imageHint: e.target.value })} />
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
      <SingleImageUploader label="Background image (optional)" value={data.backgroundImageUrl} onChange={(url) => onChange({ ...data, backgroundImageUrl: url })} />
      <Input label="Image hint" value={data.imageHint} onChange={(e) => onChange({ ...data, imageHint: e.target.value })} />
    </div>
  );
}

export function CommunityEditor({ data, onChange }: EditorProps<CommunitySectionData>) {
  return (
    <div className="space-y-4">
      <Input label="Section title" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      <Input label="Subtitle" value={data.subtitle} onChange={(e) => onChange({ ...data, subtitle: e.target.value })} />
      <Input label="Instagram URL" value={data.instagramUrl} onChange={(e) => onChange({ ...data, instagramUrl: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.tiles.map((tile, i) => (
          <div key={tile.id} className="space-y-2 rounded-lg border border-neutral-200 p-3">
            <p className="text-xs font-medium text-neutral-500">Tile {i + 1}</p>
            <SingleImageUploader value={tile.imageUrl} onChange={(url) => onChange({ ...data, tiles: data.tiles.map((t) => (t.id === tile.id ? { ...t, imageUrl: url } : t)) })} />
            <ColorSwatchPicker value={tile.bgClass} onChange={(bgClass) => onChange({ ...data, tiles: data.tiles.map((t) => (t.id === tile.id ? { ...t, bgClass } : t)) })} />
            <Input label="Hint" value={tile.hint} onChange={(e) => onChange({ ...data, tiles: data.tiles.map((t) => (t.id === tile.id ? { ...t, hint: e.target.value } : t)) })} />
          </div>
        ))}
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
