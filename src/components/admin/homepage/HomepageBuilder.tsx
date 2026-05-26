'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ensureHomepageConfig,
  getDefaultHomepageConfig,
  saveDraftHomepageConfig,
} from '@/lib/homepage-config';
import { getHomepageConfig, saveHomepageConfig } from '@/lib/admin-store';
import type { HomepageConfig, HomepageSectionConfig, HomepageSectionId } from '@/lib/homepage-config-types';
import { HOMEPAGE_SECTION_LABELS } from '@/lib/homepage-config-types';
import { Button } from '@/components/admin/ui/Button';
import { useAdminToast } from '@/context/AdminToastContext';
import { cn } from '@/lib/utils';
import {
  BrandStoryEditor,
  CategoriesEditor,
  CollectionBannerEditor,
  CommunityEditor,
  FeaturedEditor,
  HeroEditor,
  MarqueeEditor,
  ReviewsEditor,
  TrustEditor,
  ToggleRow,
} from '@/components/admin/homepage/HomepageSectionEditors';
import {
  dispatchDraftUpdated,
  formatLastSaved,
  reorderSections,
  sectionLabel,
  toggleSectionEnabled,
  updateSection,
} from '@/components/admin/homepage/homepage-builder-utils';
import { HomepageSectionErrorBoundary } from '@/components/admin/homepage/HomepageSectionErrorBoundary';
import { HomepageUploadDiagnostics } from '@/components/admin/homepage/HomepageUploadDiagnostics';

type MobileTab = 'editor' | 'preview';

export function HomepageBuilder() {
  const { toast } = useAdminToast();
  const [config, setConfig] = useState<HomepageConfig>(() => getDefaultHomepageConfig());
  const [openSection, setOpenSection] = useState<HomepageSectionId | null>('hero');
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor');
  const [previewKey, setPreviewKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getHomepageConfig()
      .then((loaded) => {
        const next = ensureHomepageConfig(loaded);
        setConfig(next);
        saveDraftHomepageConfig(next);
      })
      .catch(() => {
        const fallback = getDefaultHomepageConfig();
        setConfig(fallback);
        saveDraftHomepageConfig(fallback);
        toast('Could not load saved config — showing defaults', 'error');
      });
     
  }, []);

  const sortedSections = useMemo(
    () => [...config.sections].sort((a, b) => a.order - b.order),
    [config.sections]
  );

  const persistDraft = useCallback((next: HomepageConfig) => {
    saveDraftHomepageConfig(next);
    dispatchDraftUpdated();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewKey((k) => k + 1);
    }, 500);
  }, []);

  const updateConfig = useCallback(
    (updater: (c: HomepageConfig) => HomepageConfig) => {
      setConfig((prev) => {
        const next = updater(prev);
        persistDraft(next);
        return next;
      });
    },
    [persistDraft]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  async function handleResetToDefaults() {
    if (
      !window.confirm(
        'Reset the homepage to default content? This replaces your saved configuration in the database.'
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      const defaults = getDefaultHomepageConfig();
      const saved = await saveHomepageConfig(defaults);
      setConfig(saved);
      saveDraftHomepageConfig(saved);
      dispatchDraftUpdated();
      setPreviewKey((k) => k + 1);
      toast('Homepage reset to defaults', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Reset failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const hero = config.sections.find((s) => s.id === 'hero');
      if (hero?.id === 'hero') {
        console.log('[Save] Draft hero data:', JSON.stringify(hero.data));
      }
      console.log('[Save] Payload sections count:', config.sections.length);
      const saved = await saveHomepageConfig(config);
      setConfig(saved);
      saveDraftHomepageConfig(saved);
      dispatchDraftUpdated();
      toast('Homepage saved successfully', 'success');
      setPreviewKey((k) => k + 1);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  function renderSectionEditor(section: HomepageSectionConfig) {
    switch (section.id) {
      case 'hero':
        return (
          <HeroEditor
            data={section.data}
            onChange={(data) => updateConfig((c) => updateSection(c, 'hero', { data }))}
          />
        );
      case 'marquee':
        return (
          <MarqueeEditor
            data={section.data}
            onChange={(data) => updateConfig((c) => updateSection(c, 'marquee', { data }))}
          />
        );
      case 'categories':
        return (
          <CategoriesEditor
            data={section.data}
            onChange={(data) => updateConfig((c) => updateSection(c, 'categories', { data }))}
          />
        );
      case 'featured':
        return (
          <FeaturedEditor
            data={section.data}
            onChange={(data) => updateConfig((c) => updateSection(c, 'featured', { data }))}
          />
        );
      case 'brandStory':
        return (
          <BrandStoryEditor
            data={section.data}
            onChange={(data) => updateConfig((c) => updateSection(c, 'brandStory', { data }))}
          />
        );
      case 'reviews':
        return (
          <ReviewsEditor
            data={section.data}
            onChange={(data) => updateConfig((c) => updateSection(c, 'reviews', { data }))}
          />
        );
      case 'collectionBanner':
        return (
          <CollectionBannerEditor
            data={section.data}
            onChange={(data) => updateConfig((c) => updateSection(c, 'collectionBanner', { data }))}
          />
        );
      case 'community':
        return (
          <CommunityEditor
            data={section.data}
            onChange={(data) => updateConfig((c) => updateSection(c, 'community', { data }))}
          />
        );
      case 'trust':
        return (
          <TrustEditor
            data={section.data}
            onChange={(data) => updateConfig((c) => updateSection(c, 'trust', { data }))}
          />
        );
      default:
        return null;
    }
  }

  const previewSrc = `/?preview=true&_=${previewKey}`;

  return (
    <div className="-m-4 lg:-m-6 flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 lg:px-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Homepage Builder</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Last saved: {formatLastSaved(config.lastSaved)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void handleResetToDefaults()}
            disabled={saving}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open('/?preview=true', '_blank')}
          >
            Preview in New Tab
          </Button>
          <Button
            className="lg:hidden"
            variant="secondary"
            size="sm"
            onClick={() => setMobileTab((t) => (t === 'preview' ? 'editor' : 'preview'))}
          >
            {mobileTab === 'preview' ? 'Editor' : 'Preview'}
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex lg:hidden border-b border-neutral-200 bg-neutral-50">
        {(['editor', 'preview'] as MobileTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={cn(
              'flex-1 py-3 text-sm font-medium capitalize',
              mobileTab === tab ? 'text-[#C97D5D] border-b-2 border-[#C97D5D]' : 'text-neutral-500'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-h-0">
        <div
          className={cn(
            'w-full lg:w-[40%] overflow-y-auto border-r border-neutral-200 bg-[#FAFAFA] p-4 space-y-4',
            mobileTab === 'preview' && 'hidden lg:block'
          )}
        >
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-900 mb-3">Section Order</h2>
            <p className="text-xs text-neutral-500 mb-3">Drag rows to reorder. Use the eye to show or hide.</p>
            <ul className="space-y-1">
              {sortedSections.map((section, index) => (
                <li
                  key={section.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex === null || dragIndex === index) return;
                    updateConfig((c) => reorderSections(c, dragIndex, index));
                    setDragIndex(null);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm',
                    dragIndex === index && 'opacity-50'
                  )}
                >
                  <span className="cursor-grab text-neutral-400 select-none" aria-hidden>
                    ⋮⋮
                  </span>
                  <span className="flex-1 font-medium text-neutral-800">{sectionLabel(section.id)}</span>
                  <button
                    type="button"
                    className="p-1 text-neutral-500 hover:text-[#C97D5D]"
                    title={section.enabled ? 'Hide section' : 'Show section'}
                    onClick={() => updateConfig((c) => toggleSectionEnabled(c, section.id))}
                  >
                    {section.enabled ? '👁' : '👁‍🗨'}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {sortedSections.map((section) => (
            <div key={section.id} className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-50"
                onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              >
                <span className="font-semibold text-neutral-900">{HOMEPAGE_SECTION_LABELS[section.id]}</span>
                <span className="text-neutral-400">{openSection === section.id ? '▾' : '▸'}</span>
              </button>
              {openSection === section.id && (
                <div className="px-4 pb-4 space-y-4 border-t border-neutral-100 pt-4">
                  <ToggleRow
                    enabled={section.enabled}
                    onToggle={() => updateConfig((c) => toggleSectionEnabled(c, section.id))}
                  />
                  <HomepageSectionErrorBoundary sectionLabel={HOMEPAGE_SECTION_LABELS[section.id]}>
                    {renderSectionEditor(section)}
                  </HomepageSectionErrorBoundary>
                </div>
              )}
            </div>
          ))}

          <HomepageUploadDiagnostics />
        </div>

        <div className="hidden lg:flex flex-col w-[60%] bg-neutral-100">
          <div className="px-4 py-2 text-xs text-neutral-500 border-b border-neutral-200 bg-white">
            Live preview
          </div>
          <iframe
            key={previewSrc}
            title="Homepage preview"
            src={previewSrc}
            className="flex-1 w-full border-0 bg-white"
          />
        </div>

        <div
          className={cn(
            'lg:hidden flex-1 bg-neutral-100',
            mobileTab !== 'preview' && 'hidden'
          )}
        >
          <iframe
            key={`m-${previewSrc}`}
            title="Homepage preview"
            src={previewSrc}
            className="w-full h-[calc(100vh-12rem)] border-0"
          />
        </div>
      </div>
    </div>
  );
}
