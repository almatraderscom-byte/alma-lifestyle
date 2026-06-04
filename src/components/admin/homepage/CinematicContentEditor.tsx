'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CinematicContent } from '@/lib/cinematic-content-types';
import { getDefaultCinematicContent } from '@/lib/cinematic-content-defaults';
import type { CinematicGradientToken } from '@/lib/cinematic-config';
import {
  fetchCinematicContentApi,
  saveCinematicContentApi,
  uploadVideoApi,
} from '@/lib/admin-api';
import { Input } from '@/components/admin/ui/Input';
import { Textarea } from '@/components/admin/ui/Textarea';
import { Select } from '@/components/admin/ui/Select';
import { Button } from '@/components/admin/ui/Button';
import { HomepageImageUpload } from '@/components/admin/homepage/HomepageImageUpload';
import { useAdminToast } from '@/context/AdminToastContext';
import { reportHomepageBuilderUploadError } from '@/lib/homepage-upload-error';
import { getProducts, type AdminProduct } from '@/lib/admin-store';
import { CinematicModeBanner } from '@/components/admin/homepage/CinematicModeBanner';
import {
  clearDraftCinematicContent,
  saveDraftCinematicContent,
} from '@/lib/cinematic-preview-draft';

const GRADIENT_OPTIONS: { value: CinematicGradientToken; label: string }[] = [
  { value: 'maroon', label: 'Maroon' },
  { value: 'terracotta', label: 'Terracotta' },
  { value: 'mustard', label: 'Mustard' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'emerald-deep', label: 'Emerald deep' },
  { value: 'charcoal', label: 'Charcoal' },
];

interface CinematicContentEditorProps {
  cinematicModeOn?: boolean;
  onSaved?: () => void;
  /** Debounced draft sync for admin preview iframe */
  onDraftChange?: () => void;
  /** Wire top-bar save to cinematic PUT */
  onRegisterSave?: (save: () => Promise<void>) => void;
}

export function CinematicContentEditor({
  cinematicModeOn = true,
  onSaved,
  onDraftChange,
  onRegisterSave,
}: CinematicContentEditorProps) {
  const { toast } = useAdminToast();
  const [content, setContent] = useState<CinematicContent>(() => getDefaultCinematicContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [publishedProducts, setPublishedProducts] = useState<AdminProduct[]>([]);

  useEffect(() => {
    fetchCinematicContentApi()
      .then((loaded) => {
        setContent(loaded);
        saveDraftCinematicContent(loaded);
      })
      .catch(() => toast('Could not load cinematic content — showing defaults', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    void getProducts().then((list) =>
      setPublishedProducts(
        list
          .filter((p) => p.status === 'published')
          .sort((a, b) => a.title.localeCompare(b.title, 'bn'))
      )
    );
  }, []);

  const updateHero = useCallback(
    (patch: Partial<CinematicContent['hero']>) => {
      setContent((prev) => ({ ...prev, hero: { ...prev.hero, ...patch } }));
    },
    []
  );

  const updateClosing = useCallback(
    (patch: Partial<CinematicContent['closing']>) => {
      setContent((prev) => ({
        ...prev,
        closing: {
          ...prev.closing,
          ...patch,
          cta: { ...prev.closing.cta, ...patch.cta },
        },
      }));
    },
    []
  );

  const updateStage = useCallback(
    (index: number, patch: Partial<CinematicContent['chapters']['stages'][number]>) => {
      setContent((prev) => {
        const stages = [...prev.chapters.stages];
        stages[index] = {
          ...stages[index],
          ...patch,
          cta: patch.cta ? { ...stages[index].cta, ...patch.cta } : stages[index].cta,
        };
        return { ...prev, chapters: { ...prev.chapters, stages } };
      });
    },
    []
  );

  const updatePillar = useCallback(
    (index: number, patch: Partial<CinematicContent['whyAlma']['pillars'][number]>) => {
      setContent((prev) => {
        const pillars = [...prev.whyAlma.pillars];
        pillars[index] = { ...pillars[index], ...patch };
        return { ...prev, whyAlma: { ...prev.whyAlma, pillars } };
      });
    },
    []
  );

  const updateFaqItem = useCallback(
    (index: number, patch: Partial<CinematicContent['faq']['items'][number]>) => {
      setContent((prev) => {
        const items = [...prev.faq.items];
        items[index] = { ...items[index], ...patch };
        return { ...prev, faq: { ...prev.faq, items } };
      });
    },
    []
  );


  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      saveDraftCinematicContent(content);
      onDraftChange?.();
    }, 400);
    return () => clearTimeout(timer);
  }, [content, loading, onDraftChange]);

  async function handleVideoUpload(file: File) {
    setUploadingVideo(true);
    try {
      const url = await uploadVideoApi(file, 'cinematic/hero');
      updateHero({ videoSrc: url });
      toast('Hero video uploaded', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Video upload failed', 'error');
    } finally {
      setUploadingVideo(false);
    }
  }

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const saved = await saveCinematicContentApi(content);
      setContent(saved);
      saveDraftCinematicContent(saved);
      toast('Saved successfully — cinematic content will appear on site within 60s', 'success');
      onSaved?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [content, toast, onSaved]);

  useEffect(() => {
    onRegisterSave?.(handleSave);
    return () => onRegisterSave?.(async () => {});
  }, [handleSave, onRegisterSave]);

  if (loading) {
    return <p className="text-sm text-neutral-500 p-4">Loading cinematic content…</p>;
  }

  return (
    <div className="space-y-6">
      <CinematicModeBanner variant="cinematic-tab" cinematicOn={cinematicModeOn ?? true} />
      <div className="rounded-lg border border-[#C97D5D]/30 bg-[#C97D5D]/5 px-3 py-2 text-xs text-neutral-700">
        Edit cinematic-only copy and media. Changes appear on the live homepage after save (60s
        revalidate).
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">Hero</h2>

<Input
  label="Brand name"
  value={content.hero.brandName}
  onChange={(e) => updateHero({ brandName: e.target.value })}
/>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  <Input
    label="Video object position (desktop)"
    value={content.hero.mediaObjectPosition}
    onChange={(e) => updateHero({ mediaObjectPosition: e.target.value })}
    placeholder="46% 18%"
  />
  <Input
    label="Video object position (mobile)"
    value={content.hero.mediaObjectPositionMobile}
    onChange={(e) => updateHero({ mediaObjectPositionMobile: e.target.value })}
    placeholder="center 22%"
  />
</div>
        <Input
          label="Eyebrow"
          value={content.hero.eyebrow}
          onChange={(e) => updateHero({ eyebrow: e.target.value })}
        />
        <Textarea
          label="Subheading"
          rows={2}
          value={content.hero.subheading}
          onChange={(e) => updateHero({ subheading: e.target.value })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Meta left"
            value={content.hero.metaLeft}
            onChange={(e) => updateHero({ metaLeft: e.target.value })}
          />
          <Input
            label="Meta right"
            value={content.hero.metaRight}
            onChange={(e) => updateHero({ metaRight: e.target.value })}
          />
        </div>
        <Input
          label="Video URL"
          value={content.hero.videoSrc}
          onChange={(e) => updateHero({ videoSrc: e.target.value })}
        />
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-700">Hero video file (MP4)</p>
          <input
            type="file"
            accept="video/mp4"
            disabled={uploadingVideo}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleVideoUpload(file);
              e.target.value = '';
            }}
            className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded file:border-0 file:bg-[#C97D5D] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
          />
          {uploadingVideo && <p className="text-xs text-neutral-500">Uploading video…</p>}
        </div>
        <HomepageImageUpload
          specKey="heroImage"
          label="Poster image"
          folder="cinematic/hero"
          value={content.hero.posterSrc}
          onChange={(url) => updateHero({ posterSrc: url })}
          onError={(msg) => reportHomepageBuilderUploadError(msg, toast)}
        />
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
          Pinned chapters
        </h2>
        <Input
          label="Section number label"
          value={content.chapters.sectionNumber}
          onChange={(e) =>
            setContent((prev) => ({
              ...prev,
              chapters: { ...prev.chapters, sectionNumber: e.target.value },
            }))
          }
        />

<button
  type="button"
  className="text-sm font-medium text-[#C97D5D]"
  onClick={() => {
    const defaults = getDefaultCinematicContent();
    const template = defaults.chapters.stages[0] ?? {
      eyebrow: 'CHAPTER',
      heading: 'New chapter',
      body: '',
      imageLabel: '',
      gradientFrom: 'maroon' as const,
      gradientTo: 'terracotta' as const,
      productSlug: undefined,
    };
    setContent((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        stages: [...prev.chapters.stages, { ...template }],
      },
    }));
  }}
>
  + Add chapter stage
</button>

        {content.chapters.stages.map((stage, index) => (
          <div key={index} className="rounded-lg border border-neutral-100 p-4 space-y-3">
            <p className="text-xs font-semibold text-[#C97D5D]">Stage {index + 1}</p>
            <Input
              label="Eyebrow"
              value={stage.eyebrow}
              onChange={(e) => updateStage(index, { eyebrow: e.target.value })}
            />
            <Input
              label="Heading"
              value={stage.heading}
              onChange={(e) => updateStage(index, { heading: e.target.value })}
            />

<Input
  label="Image label"
  value={stage.imageLabel}
  onChange={(e) => updateStage(index, { imageLabel: e.target.value })}
/>

            {!stage.cta && (
              <Select
                label={`Stage ${index + 1} product (image source)`}
                value={stage.productSlug ?? ''}
                onChange={(e) =>
                  updateStage(index, { productSlug: e.target.value || undefined })
                }
                options={[
                  { value: '', label: '— No product (gradient only) —' },
                  ...publishedProducts.map((prod) => ({
                    value: prod.slug,
                    label: `${prod.title} (${prod.slug})`,
                  })),
                ]}
              />
            )}
            {stage.cta && (
              <p className="text-xs text-neutral-500">
                CTA stage — product image is not used (gradient + button only).
              </p>
            )}

<div className="flex flex-wrap gap-2">
  <button
    type="button"
    className="text-xs font-medium text-neutral-600 disabled:opacity-40"
    disabled={index === 0}
    onClick={() => {
      setContent((prev) => {
        const stages = [...prev.chapters.stages];
        [stages[index - 1], stages[index]] = [stages[index], stages[index - 1]];
        return { ...prev, chapters: { ...prev.chapters, stages } };
      });
    }}
  >
    Move up
  </button>
  <button
    type="button"
    className="text-xs font-medium text-neutral-600 disabled:opacity-40"
    disabled={index >= content.chapters.stages.length - 1}
    onClick={() => {
      setContent((prev) => {
        const stages = [...prev.chapters.stages];
        [stages[index], stages[index + 1]] = [stages[index + 1], stages[index]];
        return { ...prev, chapters: { ...prev.chapters, stages } };
      });
    }}
  >
    Move down
  </button>
  {content.chapters.stages.length > 1 && (
    <button
      type="button"
      className="text-xs font-medium text-red-600"
      onClick={() => {
        setContent((prev) => ({
          ...prev,
          chapters: {
            ...prev.chapters,
            stages: prev.chapters.stages.filter((_, i) => i !== index),
          },
        }));
      }}
    >
      Remove stage
    </button>
  )}
</div>
            <Textarea
              label="Body"
              rows={2}
              value={stage.body}
              onChange={(e) => updateStage(index, { body: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Gradient from"
                value={stage.gradientFrom}
                onChange={(e) =>
                  updateStage(index, { gradientFrom: e.target.value as CinematicGradientToken })
                }
                options={GRADIENT_OPTIONS}
              />
              <Select
                label="Gradient to"
                value={stage.gradientTo}
                onChange={(e) =>
                  updateStage(index, { gradientTo: e.target.value as CinematicGradientToken })
                }
                options={GRADIENT_OPTIONS}
              />
            </div>
            {stage.cta && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="CTA label"
                  value={stage.cta.label}
                  onChange={(e) => updateStage(index, { cta: { ...stage.cta!, label: e.target.value } })}
                />
                <Input
                  label="CTA href"
                  value={stage.cta.href}
                  onChange={(e) => updateStage(index, { cta: { ...stage.cta!, href: e.target.value } })}
                />
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
          Closing CTA
        </h2>
        <Input
          label="Eyebrow"
          value={content.closing.eyebrow}
          onChange={(e) => updateClosing({ eyebrow: e.target.value })}
        />
        <Textarea
          label="Heading (use newline for line break)"
          rows={2}
          value={content.closing.heading}
          onChange={(e) => updateClosing({ heading: e.target.value })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="CTA label"
            value={content.closing.cta.label}
            onChange={(e) => updateClosing({ cta: { ...content.closing.cta, label: e.target.value } })}
          />
          <Input
            label="CTA href"
            value={content.closing.cta.href}
            onChange={(e) => updateClosing({ cta: { ...content.closing.cta, href: e.target.value } })}
          />
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
          Why ALMA
        </h2>
        <Input
          label="Section title"
          value={content.whyAlma.sectionTitle}
          onChange={(e) =>
            setContent((prev) => ({
              ...prev,
              whyAlma: { ...prev.whyAlma, sectionTitle: e.target.value },
            }))
          }
        />
        <Textarea
          label="Section subtitle"
          rows={2}
          value={content.whyAlma.sectionSubtitle}
          onChange={(e) =>
            setContent((prev) => ({
              ...prev,
              whyAlma: { ...prev.whyAlma, sectionSubtitle: e.target.value },
            }))
          }
        />
        {content.whyAlma.pillars.map((pillar, index) => (
          <div key={pillar.id} className="rounded-lg border border-neutral-100 p-4 space-y-3">
            <p className="text-xs font-semibold text-neutral-500">Pillar {index + 1}</p>
            <Input
              label="Title"
              value={pillar.title}
              onChange={(e) => updatePillar(index, { title: e.target.value })}
            />
            <Textarea
              label="Description"
              rows={2}
              value={pillar.description}
              onChange={(e) => updatePillar(index, { description: e.target.value })}
            />
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">FAQ</h2>
        <Input
          label="Section title"
          value={content.faq.sectionTitle}
          onChange={(e) =>
            setContent((prev) => ({ ...prev, faq: { ...prev.faq, sectionTitle: e.target.value } }))
          }
        />
        {content.faq.items.map((item, index) => (
          <div key={index} className="rounded-lg border border-neutral-100 p-4 space-y-3">
            <p className="text-xs font-semibold text-neutral-500">Item {index + 1}</p>
            <Input
              label="Question"
              value={item.q}
              onChange={(e) => updateFaqItem(index, { q: e.target.value })}
            />
            <Textarea
              label="Answer"
              rows={2}
              value={item.a}
              onChange={(e) => updateFaqItem(index, { a: e.target.value })}
            />
          </div>
        ))}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setContent((prev) => ({
                ...prev,
                faq: {
                  ...prev.faq,
                  items: [...prev.faq.items, { q: 'New question', a: 'Answer' }],
                },
              }))
            }
          >
            + Add FAQ
          </Button>
          {content.faq.items.length > 1 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setContent((prev) => ({
                  ...prev,
                  faq: { ...prev.faq, items: prev.faq.items.slice(0, -1) },
                }))
              }
            >
              Remove last
            </Button>
          )}
        </div>
      </section>

      <Button onClick={() => void handleSave()} loading={saving}>
        Save cinematic content
      </Button>
    </div>
  );
}
