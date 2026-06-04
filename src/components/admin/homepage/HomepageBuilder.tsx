'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ensureHomepageConfig,
  getDefaultHomepageConfig,
  saveDraftHomepageConfig,
} from '@/lib/homepage-config';
import { getHomepageConfig, saveHomepageConfig } from '@/lib/admin-store';
import type {
  HomepageConfig,
  HomepageEditorSectionId,
  HomepageSectionConfig,
  HomepageSectionId,
} from '@/lib/homepage-config-types';
import { isConfigSectionId } from '@/lib/homepage-edit-messages';
import { getDefaultHomepageExtras, getDefaultOurProcessSection } from '@/lib/homepage-extras';
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
  FamilyMatchingEditor,
  OurProcessEditor,
  HomepageCtaEditor,
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
import { CinematicContentEditor } from '@/components/admin/homepage/CinematicContentEditor';
import { isHomepageEditMessage } from '@/lib/homepage-edit-messages';
import { buildHomepagePreviewUrl } from '@/lib/storefront-preview-url';
import { isLocalStorageMode } from '@/lib/data-source';

type MobileTab = 'editor' | 'preview';
type BuilderTab = 'sections' | 'cinematic';

export function HomepageBuilder() {
  const { toast } = useAdminToast();
  const [config, setConfig] = useState<HomepageConfig>(() => getDefaultHomepageConfig());
  const [builderTab, setBuilderTab] = useState<BuilderTab>('sections');
  const [openSection, setOpenSection] = useState<HomepageEditorSectionId | null>('hero');
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor');
  const [previewKey, setPreviewKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [resettingProcess, setResettingProcess] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopIframeRef = useRef<HTMLIFrameElement>(null);
  const mobileIframeRef = useRef<HTMLIFrameElement>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cinematicSaveRef = useRef<(() => Promise<void>) | null>(null);

  function postToPreview(data: unknown) {
    desktopIframeRef.current?.contentWindow?.postMessage(data, '*');
    mobileIframeRef.current?.contentWindow?.postMessage(data, '*');
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  useEffect(() => {
    setPreviewKey((k) => k + 1);
  }, [builderTab]);

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
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  const highlightPreviewSection = useCallback((sectionId: string) => {
    postToPreview({ type: 'HIGHLIGHT_SECTION', sectionId });
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isHomepageEditMessage(event.data)) return;

      if (event.data.type === 'EDIT_SECTION') {
        const { sectionId } = event.data;

        if (sectionId === 'bestSelling') {
          toast(
            'Best selling cards use products tagged bestseller in Admin → Products. Featured section controls the grid below.',
            'info'
          );
          openSectionPanel('featured');
          return;
        }

        if (sectionId === 'why-choose-alma' || sectionId === 'homepage-faq') {
          setBuilderTab('cinematic');
          toast('Edit this content in the Cinematic tab.', 'info');
          return;
        }

        if (sectionId === 'homepage-cta') {
          setBuilderTab('sections');
          openSectionPanel('homepage-cta');
          return;
        }

        openSectionPanel(sectionId as HomepageEditorSectionId);
        return;
      }

      if (event.data.type === 'CLEAR_SECTION_EDIT') {
        setOpenSection(null);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [toast, highlightPreviewSection]);

  function openSectionPanel(sectionId: HomepageEditorSectionId) {
    setOpenSection(sectionId);
    if (
      sectionId !== 'why-choose-alma' &&
      sectionId !== 'homepage-faq' &&
      sectionId !== 'bestSelling'
    ) {
      highlightPreviewSection(sectionId);
    }
    requestAnimationFrame(() => {
      const el = document.getElementById(`section-${sectionId}`);
      const editorTop =
        document.getElementById(`${sectionId}-editor-top`) ??
        el?.querySelector('[id$="-editor-top"]');
      editorTop?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (el) {
        el.style.background = 'rgba(201, 125, 93, 0.12)';
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = setTimeout(() => {
          el.style.background = '';
        }, 1000);
      }
    });
  }

  function updateExtras(updater: (extras: NonNullable<HomepageConfig['extras']>) => NonNullable<HomepageConfig['extras']>) {
    updateConfig((c) => ({
      ...c,
      extras: updater(c.extras ?? getDefaultHomepageExtras()),
    }));
  }

  async function handleResetProcessSection() {
    if (
      !window.confirm(
        'Reset Our Process text to the approved defaults? Uploaded step images are kept when possible.'
      )
    ) {
      return;
    }
    setResettingProcess(true);
    try {
      const res = await fetch('/api/v1/admin/reset-process-section', {
        method: 'POST',
        credentials: 'include',
      });
      const json = (await res.json()) as {
        status?: string;
        data?: { ourProcess?: ReturnType<typeof getDefaultOurProcessSection> };
        error?: string;
      };
      if (!res.ok || json.status !== 'success') {
        throw new Error(json.error ?? 'Reset failed');
      }
      const ourProcess = json.data?.ourProcess ?? getDefaultOurProcessSection();
      updateExtras((e) => ({ ...e, ourProcess }));
      const reloaded = await getHomepageConfig();
      setConfig(reloaded);
      saveDraftHomepageConfig(reloaded);
      dispatchDraftUpdated();
      setPreviewKey((k) => k + 1);
      toast('Process section reset to defaults', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Reset failed', 'error');
    } finally {
      setResettingProcess(false);
    }
  }

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
    if (builderTab === 'cinematic') {
      if (!cinematicSaveRef.current) {
        toast('Cinematic editor is still loading — try again', 'error');
        return;
      }
      setSaving(true);
      try {
        await cinematicSaveRef.current();
        setPreviewKey((k) => k + 1);
      } catch {
        /* toast from cinematic editor */
      } finally {
        setSaving(false);
      }
      return;
    }

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
      const savedAt = saved.lastSaved
        ? new Date(saved.lastSaved).toLocaleString('en-GB')
        : 'just now';
      toast(`Saved successfully — last saved ${savedAt}`, 'success');
      setPreviewKey((k) => k + 1);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed — check network and API mode', 'error');
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
            cinematicModeOn={config.cinematicMode ?? true}
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

  const cinematicPreviewOn = config.cinematicMode ?? true;
  /** Cinematic tab always previews cinematic layout; Sections tab follows mode toggle. */
  const previewUsesCinematic = builderTab === 'cinematic' || cinematicPreviewOn;
  const previewSrc = buildHomepagePreviewUrl({
    previewKey,
    edit: true,
    cinematic: previewUsesCinematic,
  });

  return (
    <div className="-m-4 lg:-m-6 flex flex-1 flex-col min-h-0 min-h-[calc(100vh-4rem)]">
      {isLocalStorageMode() && (
        <div className="mx-4 lg:mx-6 mt-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <strong>Not connected to Supabase.</strong> Saves in this browser only — the live site and refresh
          will not show your edits. In Vercel set <code className="text-xs">NEXT_PUBLIC_USE_API=true</code>{' '}
          (or remove <code className="text-xs">false</code>) and redeploy.
        </div>
      )}

      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 lg:px-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Homepage Builder</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Last saved: {formatLastSaved(config.lastSaved)}
          </p>
        </div>

        <div className="flex rounded-lg border border-neutral-200 p-0.5 text-sm">
          <button
            type="button"
            className={cn(
              'rounded-md px-3 py-1.5 font-medium transition-colors',
              builderTab === 'sections'
                ? 'bg-[#C97D5D] text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
            onClick={() => setBuilderTab('sections')}
          >
            Sections
          </button>
          <button
            type="button"
            className={cn(
              'rounded-md px-3 py-1.5 font-medium transition-colors',
              builderTab === 'cinematic'
                ? 'bg-[#C97D5D] text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
            onClick={() => setBuilderTab('cinematic')}
          >
            Cinematic
          </button>
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
            onClick={() => {
              window.open(
                buildHomepagePreviewUrl({
                  previewKey: Date.now(),
                  edit: false,
                  cinematic: previewUsesCinematic,
                }),
                '_blank'
              );
            }}
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
            {builderTab === 'cinematic' ? 'Save cinematic content' : 'Save Changes'}
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
          {builderTab === 'cinematic' ? (
            <CinematicContentEditor
              cinematicModeOn={config.cinematicMode ?? true}
              onSaved={() => setPreviewKey((k) => k + 1)}
              onDraftChange={() => setPreviewKey((k) => k + 1)}
              onRegisterSave={(save) => {
                cinematicSaveRef.current = save;
              }}
            />
          ) : (
            <>
          <div className="rounded-lg border border-[#C97D5D]/30 bg-[#C97D5D]/5 px-3 py-2 text-xs text-neutral-700">
            <span className="font-semibold text-[#C97D5D]">Visual editor:</span> click any block in the
            preview (desktop) or use the panels below.
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
            <h2 className="text-xs font-semibold text-neutral-900 mb-2 uppercase tracking-wide">
              Section order
            </h2>
            <p className="text-[11px] text-neutral-500 mb-2">Drag to reorder · eye toggles visibility</p>
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
            <div
              key={section.id}
              id={`section-${section.id}`}
              className={cn(
                'rounded-lg border bg-white shadow-sm overflow-hidden transition-colors',
                openSection === section.id
                  ? 'border-[#C97D5D] ring-1 ring-[#C97D5D]/30'
                  : 'border-neutral-200'
              )}
            >
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-neutral-50"
                onClick={() => {
                  if (openSection === section.id) {
                    setOpenSection(null);
                  } else if (isConfigSectionId(section.id)) {
                    openSectionPanel(section.id);
                  }
                }}
              >
                <span className="text-sm font-semibold text-neutral-900">
                  {HOMEPAGE_SECTION_LABELS[section.id]}
                </span>
                <span className="text-neutral-400 text-sm">{openSection === section.id ? '▾' : '▸'}</span>
              </button>
              {openSection === section.id && (
                <div className="px-3 pb-3 space-y-3 border-t border-neutral-100 pt-3">
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

          <div
            id="section-family-matching"
            className={cn(
              'rounded-lg border bg-white shadow-sm overflow-hidden transition-colors',
              openSection === 'family-matching'
                ? 'border-[#C97D5D] ring-1 ring-[#C97D5D]/30'
                : 'border-neutral-200'
            )}
          >
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-neutral-50"
              onClick={() =>
                openSection === 'family-matching'
                  ? setOpenSection(null)
                  : openSectionPanel('family-matching')
              }
            >
              <span className="text-sm font-semibold text-neutral-900">Family Matching</span>
              <span className="text-neutral-400 text-sm">{openSection === 'family-matching' ? '▾' : '▸'}</span>
            </button>
            {openSection === 'family-matching' && (
              <div className="px-3 pb-3 border-t border-neutral-100 pt-3">
                <FamilyMatchingEditor
                  data={config.extras?.familyMatching ?? getDefaultHomepageExtras().familyMatching}
                  onChange={(familyMatching) => updateExtras((e) => ({ ...e, familyMatching }))}
                />
              </div>
            )}
          </div>

          <div
            id="section-our-process"
            className={cn(
              'rounded-lg border bg-white shadow-sm overflow-hidden transition-colors',
              openSection === 'our-process'
                ? 'border-[#C97D5D] ring-1 ring-[#C97D5D]/30'
                : 'border-neutral-200'
            )}
          >
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-neutral-50"
              onClick={() =>
                openSection === 'our-process' ? setOpenSection(null) : openSectionPanel('our-process')
              }
            >
              <span className="text-sm font-semibold text-neutral-900">Our Process</span>
              <span className="text-neutral-400 text-sm">{openSection === 'our-process' ? '▾' : '▸'}</span>
            </button>
            {openSection === 'our-process' && (
              <div className="px-3 pb-3 border-t border-neutral-100 pt-3">
                <OurProcessEditor
                  data={config.extras?.ourProcess ?? getDefaultHomepageExtras().ourProcess}
                  onChange={(ourProcess) => updateExtras((e) => ({ ...e, ourProcess }))}
                  onResetToDefaults={() => void handleResetProcessSection()}
                  resetting={resettingProcess}
                />
              </div>
            )}
          </div>

          <div
            id="section-homepage-cta"
            className={cn(
              'rounded-lg border bg-white shadow-sm overflow-hidden transition-colors',
              openSection === 'homepage-cta'
                ? 'border-[#C97D5D] ring-1 ring-[#C97D5D]/30'
                : 'border-neutral-200'
            )}
          >
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-neutral-50"
              onClick={() =>
                openSection === 'homepage-cta'
                  ? setOpenSection(null)
                  : openSectionPanel('homepage-cta')
              }
            >
              <span className="text-sm font-semibold text-neutral-900">Homepage CTA</span>
              <span className="text-neutral-400 text-sm">{openSection === 'homepage-cta' ? '▾' : '▸'}</span>
            </button>
            {openSection === 'homepage-cta' && (
              <div className="px-3 pb-3 border-t border-neutral-100 pt-3">
                <HomepageCtaEditor
                  data={
                    config.extras?.homepageCta ?? getDefaultHomepageExtras().homepageCta!
                  }
                  onChange={(homepageCta) => updateExtras((e) => ({ ...e, homepageCta }))}
                />
              </div>
            )}
          </div>

          <HomepageUploadDiagnostics />
            </>
          )}
        </div>

        <div className="hidden lg:flex flex-1 min-h-0 flex-col w-[60%] bg-neutral-100">
          <div className="flex shrink-0 items-center gap-3 border-b border-[#C97D5D]/40 bg-cream px-4 py-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C97D5D] text-white text-xs">
              💡
            </span>
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {builderTab === 'cinematic' ? 'Cinematic preview' : 'Visual Editor Mode'}
              </p>
              <p className="text-xs text-neutral-600">
                {builderTab === 'cinematic'
                  ? 'Live preview of cinematic homepage · Draft updates as you type'
                  : 'Click any section in the preview to edit · Hover for options'}
              </p>
            </div>
          </div>
          <iframe
            ref={desktopIframeRef}
            key={previewSrc}
            title="Homepage preview"
            src={previewSrc}
            className="min-h-[480px] min-h-0 flex-1 w-full h-full border-0 bg-white"
          />
        </div>

        <div
          className={cn(
            'lg:hidden flex-1 bg-neutral-100',
            mobileTab !== 'preview' && 'hidden'
          )}
        >
          <iframe
            ref={mobileIframeRef}
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
