'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { Textarea } from '@/components/admin/ui/Textarea';
import { SingleImageUploader } from '@/components/admin/ui/SingleImageUploader';
import { RepeaterField } from '@/components/admin/landing/RepeaterField';
import { useAdminToast } from '@/context/AdminToastContext';
import { getDefaultMurdaMoshariContent } from '@/lib/murda-moshari-default-content';
import {
  MURDA_MOSHARI_LAYOUT_KEY,
  type MurdaMoshariContent,
} from '@/lib/landing-content-types';

const SECTION_META: { key: keyof MurdaMoshariContent; titleBn: string; titleEn: string }[] = [
  { key: 'overlay', titleBn: 'সিনেমাটিক ওভারলে', titleEn: 'Cinematic Overlay' },
  { key: 'hero', titleBn: 'হিরো', titleEn: 'Hero' },
  { key: 'narrative', titleBn: 'ন্যারেটিভ', titleEn: 'Narrative' },
  { key: 'problem', titleBn: 'সমস্যা', titleEn: 'Problem' },
  { key: 'solution', titleBn: 'সমাধান', titleEn: 'Solution' },
  { key: 'features', titleBn: 'ফিচার', titleEn: 'Features' },
  { key: 'specs', titleBn: 'স্পেসিফিকেশন', titleEn: 'Specs' },
  { key: 'story', titleBn: 'গল্প', titleEn: 'Story' },
  { key: 'donation', titleBn: 'দান', titleEn: 'Donation' },
  { key: 'pricing', titleBn: 'মূল্য', titleEn: 'Pricing' },
  { key: 'reviews', titleBn: 'রিভিউ', titleEn: 'Reviews' },
  { key: 'trustFooter', titleBn: 'ট্রাস্ট ফুটার', titleEn: 'Trust Footer' },
];

function countEmptyRequired(content: MurdaMoshariContent): number {
  let n = 0;
  const req = (v: string) => {
    if (!v.trim()) n += 1;
  };
  req(content.overlay.brand);
  req(content.overlay.tagline);
  req(content.hero.heading);
  req(content.hero.subheading);
  req(content.narrative.eyebrow);
  if (content.narrative.scenes.some((s) => !s.trim())) n += 1;
  req(content.problem.heading);
  req(content.pricing.cta);
  return n;
}

interface LandingContentEditorProps {
  slug: string;
  productTitle: string;
  initialContent: MurdaMoshariContent;
}

export function LandingContentEditor({
  slug,
  productTitle,
  initialContent,
}: LandingContentEditorProps) {
  const { toast } = useAdminToast();
  const [content, setContent] = useState<MurdaMoshariContent>(initialContent);
  const [baseline] = useState(() => JSON.stringify(initialContent));
  const [openKey, setOpenKey] = useState<keyof MurdaMoshariContent>('hero');
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(content) !== baseline;
  const emptyCount = countEmptyRequired(content);
  const priceWarning = content.pricing.offerPrice > content.pricing.originalPrice;

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const sectionDirty = useCallback(
    (key: keyof MurdaMoshariContent) =>
      JSON.stringify(content[key]) !== JSON.stringify(initialContent[key]),
    [initialContent, content]
  );

  const resetSection = (key: keyof MurdaMoshariContent) => {
    const defaults = getDefaultMurdaMoshariContent();
    setContent((c) => ({ ...c, [key]: defaults[key] }));
  };

  const save = async () => {
    if (emptyCount > 0) {
      toast(`${emptyCount}টি ক্ষেত্র পূরণ করতে হবে`, 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/landing/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, layoutKey: MURDA_MOSHARI_LAYOUT_KEY }),
      });
      const json = (await res.json()) as { status: string; error?: string };
      if (!res.ok || json.status !== 'success') {
        throw new Error(json.error ?? 'Save failed');
      }
      toast('Landing content saved', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = `/products/${slug}`;

  const panels = useMemo(
    () => ({
      overlay: (
        <div className="space-y-4">
          <Input label="Brand" value={content.overlay.brand} onChange={(e) => setContent((c) => ({ ...c, overlay: { ...c.overlay, brand: e.target.value } }))} />
          <Input label="Tagline" value={content.overlay.tagline} onChange={(e) => setContent((c) => ({ ...c, overlay: { ...c.overlay, tagline: e.target.value } }))} />
        </div>
      ),
      hero: (
        <div className="space-y-4">
          <Input label="Eyebrow" value={content.hero.eyebrow} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, eyebrow: e.target.value } }))} />
          <Textarea label="Heading" value={content.hero.heading} rows={2} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, heading: e.target.value } }))} />
          <Textarea label="Subheading" value={content.hero.subheading} rows={3} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, subheading: e.target.value } }))} />
          <Input label="Primary CTA" value={content.hero.primaryCta} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, primaryCta: e.target.value } }))} />
          <Input label="WhatsApp CTA" value={content.hero.whatsappCta} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, whatsappCta: e.target.value } }))} />
          <Input label="WhatsApp number" value={content.hero.whatsappNumber} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, whatsappNumber: e.target.value } }))} />
          <Textarea label="WhatsApp prefill" value={content.hero.whatsappPrefill} rows={2} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, whatsappPrefill: e.target.value } }))} />
          <RepeaterField label="Trust items" values={content.hero.trustItems} onChange={(trustItems) => setContent((c) => ({ ...c, hero: { ...c.hero, trustItems } }))} min={1} />
          <SingleImageUploader
            label="Hero image"
            value={content.hero.heroImage ?? ''}
            onChange={(heroImage) => setContent((c) => ({ ...c, hero: { ...c.hero, heroImage } }))}
            specKey="productPrimary"
            uploadFolder="murda-moshari"
            bucket="product-images"
          />
        </div>
      ),
      narrative: (
        <div className="space-y-4">
          <Input label="Eyebrow" value={content.narrative.eyebrow} onChange={(e) => setContent((c) => ({ ...c, narrative: { ...c.narrative, eyebrow: e.target.value } }))} />
          <RepeaterField label="Scenes" values={content.narrative.scenes} onChange={(scenes) => setContent((c) => ({ ...c, narrative: { ...c.narrative, scenes } }))} min={2} max={6} />
        </div>
      ),
      problem: (
        <div className="space-y-4">
          <Input label="Heading" value={content.problem.heading} onChange={(e) => setContent((c) => ({ ...c, problem: { ...c.problem, heading: e.target.value } }))} />
          <Textarea label="Intro" value={content.problem.intro} rows={3} onChange={(e) => setContent((c) => ({ ...c, problem: { ...c.problem, intro: e.target.value } }))} />
          <RepeaterField label="Points" values={content.problem.points} onChange={(points) => setContent((c) => ({ ...c, problem: { ...c.problem, points } }))} min={1} />
          <Textarea label="Outro" value={content.problem.outro} rows={2} onChange={(e) => setContent((c) => ({ ...c, problem: { ...c.problem, outro: e.target.value } }))} />
        </div>
      ),
      solution: (
        <div className="space-y-4">
          <Input label="Eyebrow" value={content.solution.eyebrow} onChange={(e) => setContent((c) => ({ ...c, solution: { ...c.solution, eyebrow: e.target.value } }))} />
          <Input label="Heading" value={content.solution.heading} onChange={(e) => setContent((c) => ({ ...c, solution: { ...c.solution, heading: e.target.value } }))} />
          <Textarea label="Body" value={content.solution.body} rows={4} onChange={(e) => setContent((c) => ({ ...c, solution: { ...c.solution, body: e.target.value } }))} />
          <RepeaterField label="Tags" values={content.solution.tags} onChange={(tags) => setContent((c) => ({ ...c, solution: { ...c.solution, tags } }))} min={1} max={6} />
          <SingleImageUploader
            label="Solution image"
            value={content.solution.image ?? ''}
            onChange={(image) => setContent((c) => ({ ...c, solution: { ...c.solution, image } }))}
            specKey="productPrimary"
            uploadFolder="murda-moshari"
            bucket="product-images"
          />
        </div>
      ),
      features: (
        <div className="space-y-4">
          <Input label="Heading" value={content.features.heading} onChange={(e) => setContent((c) => ({ ...c, features: { ...c.features, heading: e.target.value } }))} />
          <Input label="Subheading" value={content.features.subheading} onChange={(e) => setContent((c) => ({ ...c, features: { ...c.features, subheading: e.target.value } }))} />
          {content.features.items.length !== 8 && (
            <p className="text-sm text-amber-700">Recommended: 8 feature cards (currently {content.features.items.length})</p>
          )}
          {content.features.items.map((item, i) => (
            <div key={`feature-${i}`} className="rounded-lg border border-neutral-200 p-4 space-y-2">
              <p className="text-xs font-medium text-neutral-500">Feature {i + 1}</p>
              <Input
                label="Title"
                value={item.title}
                onChange={(e) => {
                  const items = [...content.features.items];
                  items[i] = { ...items[i], title: e.target.value };
                  setContent((c) => ({ ...c, features: { ...c.features, items } }));
                }}
              />
              <Input
                label="Description"
                value={item.desc}
                onChange={(e) => {
                  const items = [...content.features.items];
                  items[i] = { ...items[i], desc: e.target.value };
                  setContent((c) => ({ ...c, features: { ...c.features, items } }));
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              setContent((c) => ({
                ...c,
                features: { ...c.features, items: [...c.features.items, { title: '', desc: '' }] },
              }))
            }
          >
            + Add feature
          </Button>
        </div>
      ),
      specs: (
        <div className="grid gap-4 md:grid-cols-3">
          {(['length', 'width', 'height'] as const).map((dim) => (
            <div key={dim} className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium capitalize">{dim}</p>
              <Input
                label="Value"
                value={content.specs[dim].value}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    specs: { ...c.specs, [dim]: { ...c.specs[dim], value: e.target.value } },
                  }))
                }
              />
              <Input
                label="Unit"
                value={content.specs[dim].unit}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    specs: { ...c.specs, [dim]: { ...c.specs[dim], unit: e.target.value } },
                  }))
                }
              />
              <Input
                label="Label"
                value={content.specs[dim].label}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    specs: { ...c.specs, [dim]: { ...c.specs[dim], label: e.target.value } },
                  }))
                }
              />
            </div>
          ))}
        </div>
      ),
      story: (
        <div className="space-y-4">
          <Input label="Eyebrow" value={content.story.eyebrow} onChange={(e) => setContent((c) => ({ ...c, story: { ...c.story, eyebrow: e.target.value } }))} />
          <Input label="Heading" value={content.story.heading} onChange={(e) => setContent((c) => ({ ...c, story: { ...c.story, heading: e.target.value } }))} />
          <Textarea label="Body" value={content.story.body} rows={8} onChange={(e) => setContent((c) => ({ ...c, story: { ...c.story, body: e.target.value } }))} />
          <Input label="Attribution" value={content.story.attribution} onChange={(e) => setContent((c) => ({ ...c, story: { ...c.story, attribution: e.target.value } }))} />
        </div>
      ),
      donation: (
        <div className="space-y-4">
          <Input label="Eyebrow" value={content.donation.eyebrow} onChange={(e) => setContent((c) => ({ ...c, donation: { ...c.donation, eyebrow: e.target.value } }))} />
          <Input label="Heading" value={content.donation.heading} onChange={(e) => setContent((c) => ({ ...c, donation: { ...c.donation, heading: e.target.value } }))} />
          <Textarea label="Body" value={content.donation.body} rows={4} onChange={(e) => setContent((c) => ({ ...c, donation: { ...c.donation, body: e.target.value } }))} />
          <Input label="CTA" value={content.donation.cta} onChange={(e) => setContent((c) => ({ ...c, donation: { ...c.donation, cta: e.target.value } }))} />
        </div>
      ),
      pricing: (
        <div className="space-y-4">
          <Input label="Lead line" value={content.pricing.leadLine} onChange={(e) => setContent((c) => ({ ...c, pricing: { ...c.pricing, leadLine: e.target.value } }))} />
          <Input label="Original label" value={content.pricing.originalLabel} onChange={(e) => setContent((c) => ({ ...c, pricing: { ...c.pricing, originalLabel: e.target.value } }))} />
          <Input type="number" label="Original price (BDT)" value={content.pricing.originalPrice} onChange={(e) => setContent((c) => ({ ...c, pricing: { ...c.pricing, originalPrice: Number(e.target.value) || 0 } }))} />
          <Input label="Offer label" value={content.pricing.offerLabel} onChange={(e) => setContent((c) => ({ ...c, pricing: { ...c.pricing, offerLabel: e.target.value } }))} />
          <Input type="number" label="Offer price (BDT)" value={content.pricing.offerPrice} onChange={(e) => setContent((c) => ({ ...c, pricing: { ...c.pricing, offerPrice: Number(e.target.value) || 0 } }))} />
          {priceWarning && <p className="text-sm text-amber-700">Offer price is higher than original price.</p>}
          <Input label="Savings label" value={content.pricing.savingsLabel} onChange={(e) => setContent((c) => ({ ...c, pricing: { ...c.pricing, savingsLabel: e.target.value } }))} />
          <Input label="Urgency" value={content.pricing.urgency} onChange={(e) => setContent((c) => ({ ...c, pricing: { ...c.pricing, urgency: e.target.value } }))} />
          <Input label="CTA" value={content.pricing.cta} onChange={(e) => setContent((c) => ({ ...c, pricing: { ...c.pricing, cta: e.target.value } }))} />
          <Input label="Toast (cart added)" value={content.pricing.toastAdded} onChange={(e) => setContent((c) => ({ ...c, pricing: { ...c.pricing, toastAdded: e.target.value } }))} />
          <Input label="Reassurance" value={content.pricing.reassurance} onChange={(e) => setContent((c) => ({ ...c, pricing: { ...c.pricing, reassurance: e.target.value } }))} />
        </div>
      ),
      reviews: (
        <div className="space-y-4">
          <Input label="Heading" value={content.reviews.heading} onChange={(e) => setContent((c) => ({ ...c, reviews: { ...c.reviews, heading: e.target.value } }))} />
          <Input label="Subheading" value={content.reviews.subheading} onChange={(e) => setContent((c) => ({ ...c, reviews: { ...c.reviews, subheading: e.target.value } }))} />
          <Input label="Verified label" value={content.reviews.verifiedLabel} onChange={(e) => setContent((c) => ({ ...c, reviews: { ...c.reviews, verifiedLabel: e.target.value } }))} />
          {content.reviews.images.map((url, i) => (
            <SingleImageUploader
              key={`review-${i}`}
              label={`Review image ${i + 1}`}
              value={url}
              onChange={(next) => {
                const images = [...content.reviews.images];
                images[i] = next;
                setContent((c) => ({ ...c, reviews: { ...c.reviews, images } }));
              }}
              specKey="productGallery"
              uploadFolder="murda-moshari/reviews"
              bucket="product-images"
            />
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              setContent((c) => ({
                ...c,
                reviews: { ...c.reviews, images: [...c.reviews.images, ''] },
              }))
            }
          >
            + Add review image
          </Button>
        </div>
      ),
      trustFooter: (
        <div className="space-y-4">
          <Input label="WhatsApp eyebrow" value={content.trustFooter.whatsappEyebrow} onChange={(e) => setContent((c) => ({ ...c, trustFooter: { ...c.trustFooter, whatsappEyebrow: e.target.value } }))} />
          <Input label="WhatsApp title" value={content.trustFooter.whatsappTitle} onChange={(e) => setContent((c) => ({ ...c, trustFooter: { ...c.trustFooter, whatsappTitle: e.target.value } }))} />
          <Input label="WhatsApp subtitle" value={content.trustFooter.whatsappSubtitle} onChange={(e) => setContent((c) => ({ ...c, trustFooter: { ...c.trustFooter, whatsappSubtitle: e.target.value } }))} />
          <Input label="WhatsApp CTA" value={content.trustFooter.whatsappCta} onChange={(e) => setContent((c) => ({ ...c, trustFooter: { ...c.trustFooter, whatsappCta: e.target.value } }))} />
          <Input label="WhatsApp number" value={content.trustFooter.whatsappNumber} onChange={(e) => setContent((c) => ({ ...c, trustFooter: { ...c.trustFooter, whatsappNumber: e.target.value } }))} />
          <Textarea label="Closing" value={content.trustFooter.closing} rows={3} onChange={(e) => setContent((c) => ({ ...c, trustFooter: { ...c.trustFooter, closing: e.target.value } }))} />
        </div>
      ),
    }),
    [content, priceWarning]
  );

  return (
    <div className="pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">{productTitle}</h1>
        <p className="text-sm text-neutral-500 mt-1">Landing editor · /products/{slug}</p>
        {emptyCount > 0 && (
          <p className="mt-2 text-sm text-red-600">{emptyCount}টি ক্ষেত্র পূরণ করতে হবে</p>
        )}
      </div>

      <div className="space-y-2">
        {SECTION_META.map(({ key, titleBn, titleEn }) => (
          <div key={key} className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50"
              onClick={() => setOpenKey((k) => (k === key ? 'hero' : key))}
            >
              <span className="font-medium text-neutral-900">{titleBn}</span>
              <span className="text-xs text-neutral-500">{titleEn}</span>
              {sectionDirty(key) && (
                <span className="ml-auto h-2 w-2 rounded-full bg-[#C97D5D]" title="Edited" />
              )}
            </button>
            {openKey === key && (
              <div className="border-t border-neutral-100 px-4 py-4">
                <div className="mb-3 flex justify-end">
                  <Button type="button" variant="secondary" size="sm" onClick={() => resetSection(key)}>
                    Reset to default
                  </Button>
                </div>
                {panels[key]}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-30 border-t bg-white/95 backdrop-blur px-6 py-4 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => window.open(previewUrl, '_blank')}>
          Preview
        </Button>
        <Button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
