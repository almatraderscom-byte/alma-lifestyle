'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, type ReactNode } from 'react';
import {
  getDraftHomepageConfig,
  getSortedEnabledSections,
  isCinematicPreviewMode,
  isPreviewMode,
  resolveFeaturedProducts,
  shouldShowCinematicHomepage,
} from '@/lib/homepage-config';
import {
  CINEMATIC_DRAFT_EVENT,
  getDraftCinematicContent,
} from '@/lib/cinematic-preview-draft';
import type { HomepageConfig, HomepageSectionConfig, HomepageSectionId } from '@/lib/homepage-config-types';
import type { FeaturedProduct } from '@/lib/content';
import type { CinematicContent } from '@/lib/cinematic-content-types';
import type { CardProduct } from '@/lib/products-data';
import { EditorialHero } from '@/components/home/EditorialHero';
import {
  FloatingCollectionOcean,
  type OceanProduct,
} from '@/components/home/FloatingCollectionOcean';
import { StoryMarquee } from '@/components/home/StoryMarquee';
import { WhyChooseAlma } from '@/components/home/WhyChooseAlma';
import { CinematicWhyAlma } from '@/components/cinematic/CinematicWhyAlma';
import { CinematicProcessTimeline } from '@/components/cinematic/CinematicProcessTimeline';
import { FamilyMatchingShowcase } from '@/components/home/FamilyMatchingShowcase';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { BrandStory } from '@/components/home/BrandStory';
import { OurProcess } from '@/components/home/OurProcess';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { CollectionBannerEditorial } from '@/components/home/CollectionBannerEditorial';
import { CommunityGrid } from '@/components/home/CommunityGrid';
import { HomepageFAQ } from '@/components/home/HomepageFAQ';
import { CinematicFAQ } from '@/components/cinematic/CinematicFAQ';
import { TrustStrip } from '@/components/home/TrustStrip';
import { HomepageCTA } from '@/components/home/HomepageCTA';
import { CustomerErrorBoundary } from '@/components/ui/CustomerErrorBoundary';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { EditableHomeBlock } from '@/components/home/EditableHomeBlock';
import { HomepageEditBanner } from '@/components/home/HomepageEditBanner';
import { HomepageEditModeProvider } from '@/context/HomepageEditModeContext';
import { getDefaultHomepageExtras } from '@/lib/homepage-extras';
import { ColorWashBridge } from '@/components/cinematic/ColorWashBridge';
import { CinematicClosingSection } from '@/components/cinematic/CinematicClosingSection';
import { CinematicAssetPreload } from '@/components/cinematic/CinematicAssetPreload';
import { EditorialQuotePause } from '@/components/cinematic/EditorialQuotePause';
import { HeroFilmStrip } from '@/components/cinematic/HeroFilmStrip';
import { CinematicStoryStrip } from '@/components/cinematic/CinematicStoryStrip';
import { CinematicCategoryReel } from '@/components/cinematic/CinematicCategoryReel';
import { CinematicBrandNarrative } from '@/components/cinematic/CinematicBrandNarrative';
import { CinematicTestimonialPin } from '@/components/cinematic/CinematicTestimonialPin';
import { CinematicCollectionDivider } from '@/components/cinematic/CinematicCollectionDivider';
import { CinematicCommunityMosaic } from '@/components/cinematic/CinematicCommunityMosaic';
import { CinematicTrustPillars } from '@/components/cinematic/CinematicTrustPillars';

const CinematicLoadingOverlay = dynamic(
  () => import('@/components/cinematic/CinematicLoadingOverlay').then((m) => m.CinematicLoadingOverlay),
  { ssr: false }
);
const PinnedChaptersSection = dynamic(
  () => import('@/components/cinematic/PinnedChaptersSection').then((m) => m.PinnedChaptersSection),
  { ssr: true }
);
const CinematicFeaturedScroll = dynamic(
  () => import('@/components/cinematic/CinematicFeaturedScroll').then((m) => m.CinematicFeaturedScroll),
  { ssr: true }
);
const CinematicFamilyShowcase = dynamic(
  () => import('@/components/cinematic/CinematicFamilyShowcase').then((m) => m.CinematicFamilyShowcase),
  { ssr: true }
);
const CinematicHero = dynamic(
  () => import('@/components/cinematic/CinematicHero').then((m) => m.CinematicHero),
  { ssr: true }
);

const MagneticConstellation = dynamic(
  () => import('@/components/cinematic/MagneticConstellation').then((m) => m.MagneticConstellation),
  { ssr: true }
);

interface HomePageRendererProps {
  initialConfig: HomepageConfig;
  featuredProducts?: FeaturedProduct[];
  oceanProducts?: OceanProduct[];
  chapterProducts?: (CardProduct | null)[];
  filmStripProducts?: CardProduct[];
  editMode?: boolean;
  cinematicContent?: CinematicContent;
}

const sectionLabels: Record<HomepageSectionId, string> = {
  hero: 'হিরো',
  marquee: 'মারকি',
  categories: 'ক্যাটাগরি',
  featured: 'ফিচার্ড পণ্য',
  brandStory: 'ব্র্যান্ড স্টোরি',
  reviews: 'রিভিউ',
  collectionBanner: 'কালেকশন',
  community: 'কমিউনিটি',
  trust: 'ট্রাস্ট স্ট্রিপ',
};

type ExtraBlock = {
  key: string;
  sectionId: string;
  sectionName: string;
  node: ReactNode;
};

function buildInsertAfter(
  extras: NonNullable<HomepageConfig['extras']>,
  cinematic = false,
  cinematicContent?: CinematicContent
): Partial<
  Record<HomepageSectionId, ExtraBlock[]>
> {
  const marqueeExtras: ExtraBlock[] = [
    {
      key: 'why-choose-alma',
      sectionId: 'why-choose-alma',
      sectionName: 'Why Choose ALMA',
      node: cinematic ? <CinematicWhyAlma content={cinematicContent?.whyAlma} /> : <WhyChooseAlma content={cinematicContent?.whyAlma} />,
    },
  ];
  if (extras.familyMatching.show !== false) {
    marqueeExtras.push({
      key: 'family-matching',
      sectionId: 'family-matching',
      sectionName: 'Family Matching',
      node: cinematic ? <CinematicFamilyShowcase data={extras.familyMatching} /> : <FamilyMatchingShowcase data={extras.familyMatching} />,
    });
  }

  const brandStoryExtras: ExtraBlock[] = [];
  if (extras.ourProcess.show !== false) {
    brandStoryExtras.push({
      key: 'our-process',
      sectionId: 'our-process',
      sectionName: 'Our Process',
      node: cinematic ? <CinematicProcessTimeline data={extras.ourProcess} /> : <OurProcess data={extras.ourProcess} />,
    });
  }

  return {
    marquee: marqueeExtras,
    brandStory: brandStoryExtras,
    community: [
      {
        key: 'homepage-faq',
        sectionId: 'homepage-faq',
        sectionName: 'FAQ',
        node: cinematic ? <CinematicFAQ content={cinematicContent?.faq} /> : <HomepageFAQ content={cinematicContent?.faq} />,
      },
    ],
    trust: [
      {
        key: 'homepage-cta',
        sectionId: 'homepage-cta',
        sectionName: 'Final CTA',
        node: <HomepageCTA data={extras.homepageCta} />,
      },
    ],
  };
}

type RenderCtx = {
  editMode: boolean;
  preview: boolean;
  featuredProducts: FeaturedProduct[];
  oceanProducts: OceanProduct[];
};

function renderSectionContent(
  section: HomepageSectionConfig,
  ctx: RenderCtx,
  options?: { skipEditorialHero?: boolean; oceanOnly?: boolean }
): ReactNode | null {
  const { editMode, preview, featuredProducts, oceanProducts } = ctx;

  switch (section.id) {
    case 'hero':
      if (options?.oceanOnly) {
        return (
          <EditableHomeBlock editMode={editMode} sectionId="bestSelling" sectionName="Best Selling">
            <FloatingCollectionOcean products={oceanProducts} />
          </EditableHomeBlock>
        );
      }
      if (options?.skipEditorialHero) return null;
      return (
        <>
          <EditableHomeBlock editMode={editMode} sectionId="hero" sectionName="Hero Section">
            <EditorialHero data={section.data} />
          </EditableHomeBlock>
          <EditableHomeBlock editMode={editMode} sectionId="bestSelling" sectionName="Best Selling">
            <FloatingCollectionOcean products={oceanProducts} />
          </EditableHomeBlock>
        </>
      );
    case 'marquee':
      return (
        <EditableHomeBlock editMode={editMode} sectionId="marquee" sectionName="Story Marquee">
          <StoryMarquee data={section.data} />
        </EditableHomeBlock>
      );
    case 'categories':
      return (
        <EditableHomeBlock editMode={editMode} sectionId="categories" sectionName="Categories">
          <CategoryShowcase data={section.data} />
        </EditableHomeBlock>
      );
    case 'featured':
      return (
        <EditableHomeBlock editMode={editMode} sectionId="featured" sectionName="Featured Products">
          <FeaturedProductsSection
            data={section.data}
            products={preview ? resolveFeaturedProducts(section.data) : featuredProducts}
          />
        </EditableHomeBlock>
      );
    case 'brandStory':
      return (
        <EditableHomeBlock editMode={editMode} sectionId="brandStory" sectionName="Brand Story">
          <BrandStory data={section.data} />
        </EditableHomeBlock>
      );
    case 'reviews':
      return (
        <EditableHomeBlock editMode={editMode} sectionId="reviews" sectionName="Reviews">
          <ReviewsSection data={section.data} />
        </EditableHomeBlock>
      );
    case 'collectionBanner':
      return (
        <EditableHomeBlock
          editMode={editMode}
          sectionId="collectionBanner"
          sectionName="Collection Banner"
        >
          <CollectionBannerEditorial data={section.data} />
        </EditableHomeBlock>
      );
    case 'community':
      return (
        <EditableHomeBlock editMode={editMode} sectionId="community" sectionName="Community Grid">
          <CommunityGrid data={section.data} />
        </EditableHomeBlock>
      );
    case 'trust':
      return (
        <EditableHomeBlock editMode={editMode} sectionId="trust" sectionName="Trust Strip">
          <TrustStrip data={section.data} />
        </EditableHomeBlock>
      );
    default:
      return null;
  }
}


function renderCinematicSectionContent(
  section: HomepageSectionConfig,
  ctx: RenderCtx
): ReactNode | null {
  const { preview, featuredProducts, oceanProducts } = ctx;

  switch (section.id) {
    case 'marquee':
      return <CinematicStoryStrip data={section.data} />;
    case 'categories':
      return <CinematicCategoryReel data={section.data} />;
    case 'featured':
      return (
        <CinematicFeaturedScroll
          data={section.data}
          products={preview ? resolveFeaturedProducts(section.data) : featuredProducts}
        />
      );
    case 'brandStory':
      return <CinematicBrandNarrative data={section.data} />;
    case 'reviews':
      return <CinematicTestimonialPin data={section.data} />;
    case 'collectionBanner':
      return <CinematicCollectionDivider data={section.data} />;
    case 'community':
      return <CinematicCommunityMosaic data={section.data} />;
    case 'trust':
      return <CinematicTrustPillars data={section.data} />;
    default:
      return null;
  }
}

function sectionMap(sections: HomepageSectionConfig[]) {
  return Object.fromEntries(sections.map((s) => [s.id, s])) as Partial<
    Record<HomepageSectionId, HomepageSectionConfig>
  >;
}

export function HomePageRenderer({
  initialConfig,
  featuredProducts = [],
  oceanProducts = [],
  chapterProducts = [],
  filmStripProducts = [],
  editMode = false,
  cinematicContent,
}: HomePageRendererProps) {
  const [config, setConfig] = useState<HomepageConfig>(initialConfig);
  const [liveCinematicContent, setLiveCinematicContent] = useState(cinematicContent);
  const [activeEditMode, setActiveEditMode] = useState(editMode);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setActiveEditMode(params.get('preview') === 'true' && params.get('edit') === 'true');
  }, []);

  useEffect(() => {
    setLiveCinematicContent(cinematicContent);
  }, [cinematicContent]);

  useEffect(() => {
    if (!isPreviewMode()) return;

    function refreshFromDraft() {
      const draft = getDraftHomepageConfig();
      if (draft) setConfig(draft);
      else setConfig(initialConfig);
    }

    refreshFromDraft();
    window.addEventListener('alma-homepage-draft-updated', refreshFromDraft);
    window.addEventListener('storage', (e) => {
      if (e.key === 'alma-homepage-draft') refreshFromDraft();
    });
    return () => {
      window.removeEventListener('alma-homepage-draft-updated', refreshFromDraft);
    };
  }, [initialConfig]);

  useEffect(() => {
    if (!isCinematicPreviewMode()) return;

    function refreshCinematicDraft() {
      const draft = getDraftCinematicContent();
      setLiveCinematicContent(draft ?? cinematicContent);
    }

    refreshCinematicDraft();
    window.addEventListener(CINEMATIC_DRAFT_EVENT, refreshCinematicDraft);
    window.addEventListener('storage', (e) => {
      if (e.key === 'alma-cinematic-draft') refreshCinematicDraft();
    });
    return () => {
      window.removeEventListener(CINEMATIC_DRAFT_EVENT, refreshCinematicDraft);
    };
  }, [cinematicContent]);

  const sections = getSortedEnabledSections(config);
  const preview = isPreviewMode();
  const extras = config.extras ?? getDefaultHomepageExtras();
  const showCinematic = shouldShowCinematicHomepage(config, { editMode, preview });
  const insertAfter = buildInsertAfter(extras, showCinematic, liveCinematicContent);
  const byId = sectionMap(sections);
  const ctx: RenderCtx = { editMode: activeEditMode, preview, featuredProducts, oceanProducts };

  function pushBlock(blocks: ReactNode[], key: string, label: string, content: ReactNode) {
    blocks.push(
      <CustomerErrorBoundary key={key} sectionLabel={label}>
        {content}
      </CustomerErrorBoundary>
    );
  }

  function appendExtras(blocks: ReactNode[], sectionId: HomepageSectionId) {
    const extrasBlocks = insertAfter[sectionId];
    if (!extrasBlocks?.length) return;
    for (const extra of extrasBlocks) {
      pushBlock(
        blocks,
        extra.key,
        extra.sectionName,
        <EditableHomeBlock editMode={editMode} sectionId={extra.sectionId} sectionName={extra.sectionName}>
          {extra.node}
        </EditableHomeBlock>
      );
    }
  }


  function renderCinematicEnabledSection(blocks: ReactNode[], sectionId: HomepageSectionId) {
    const section = byId[sectionId];
    if (!section) return;
    const content = renderCinematicSectionContent(section, ctx);
    if (!content) return;
    pushBlock(blocks, sectionId, sectionLabels[sectionId] ?? sectionId, content);
    appendExtras(blocks, sectionId);
  }

  function renderEnabledSection(blocks: ReactNode[], sectionId: HomepageSectionId, options?: Parameters<typeof renderSectionContent>[2]) {
    const section = byId[sectionId];
    if (!section) return;
    const content = renderSectionContent(section, ctx, options);
    if (!content) return;
    pushBlock(blocks, sectionId, sectionLabels[sectionId] ?? sectionId, content);
    appendExtras(blocks, sectionId);
  }

  if (showCinematic) {
    const cinematicBlocks: ReactNode[] = [];

    cinematicBlocks.push(
      <CinematicAssetPreload key="cinematic-preload" />,
      <CinematicLoadingOverlay key="cinematic-overlay" />,
      <CinematicHero key="cinematic-hero" content={liveCinematicContent?.hero} />
    );
    cinematicBlocks.push(<ColorWashBridge key="wash-hero-marquee" from="charcoal" to="cream" />);

    renderCinematicEnabledSection(cinematicBlocks, 'marquee');
    renderCinematicEnabledSection(cinematicBlocks, 'categories');
    cinematicBlocks.push(<ColorWashBridge key="wash-categories-constellation" from="cream" to="warm-white" />);
    pushBlock(
      cinematicBlocks,
      'constellation',
      'Best Selling',
      <MagneticConstellation products={oceanProducts} />
    );
    renderCinematicEnabledSection(cinematicBlocks, 'featured');

    cinematicBlocks.push(<ColorWashBridge key="wash-ocean-chapters" from="warm-white" to="warm-white" />);
    cinematicBlocks.push(
      <PinnedChaptersSection
        key="pinned-chapters"
        chapterProducts={chapterProducts}
        content={liveCinematicContent?.chapters}
      />
    );
    cinematicBlocks.push(<ColorWashBridge key="wash-chapters-brand" from="warm-white" to="cream" />);

    renderCinematicEnabledSection(cinematicBlocks, 'brandStory');
    cinematicBlocks.push(<EditorialQuotePause key="editorial-quote" />);
    renderCinematicEnabledSection(cinematicBlocks, 'community');
    renderCinematicEnabledSection(cinematicBlocks, 'reviews');

    if (filmStripProducts.length > 0) {
      cinematicBlocks.push(
        <HeroFilmStrip key="hero-film-strip" products={filmStripProducts} />
      );
    }

    renderCinematicEnabledSection(cinematicBlocks, 'collectionBanner');
    renderCinematicEnabledSection(cinematicBlocks, 'trust');

    cinematicBlocks.push(<ColorWashBridge key="wash-trust-closing" from="cream" to="charcoal" />);
    cinematicBlocks.push(<CinematicClosingSection key="cinematic-closing" content={liveCinematicContent?.closing} />);

    return (
      <HomepageEditModeProvider editMode={isCinematicPreviewMode() ? editMode : false}>
        {isCinematicPreviewMode() && editMode && <HomepageEditBanner />}
        {cinematicBlocks}
      </HomepageEditModeProvider>
    );
  }

  const blocks: ReactNode[] = [];

  function maybeDivider(beforeId: HomepageSectionId, afterId?: HomepageSectionId) {
    if (!afterId || beforeId === 'marquee' || afterId === 'marquee') return;
    blocks.push(<SectionDivider key={`divider-${beforeId}-${afterId}`} />);
  }

  sections.forEach((section, index) => {
    const label = sectionLabels[section.id] ?? 'সেকশন';
    const next = sections[index + 1];
    const content = renderSectionContent(section, ctx);
    if (!content) return;

    pushBlock(blocks, section.id, label, content);
    appendExtras(blocks, section.id);

    if (next) {
      maybeDivider(section.id, next.id);
    }
  });

  return (
    <HomepageEditModeProvider editMode={activeEditMode}>
      {activeEditMode && <HomepageEditBanner />}
      {blocks}
    </HomepageEditModeProvider>
  );
}
