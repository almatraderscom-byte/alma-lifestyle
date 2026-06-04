'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  getDraftHomepageConfig,
  getSortedEnabledSections,
  isPreviewMode,
  resolveFeaturedProducts,
} from '@/lib/homepage-config';
import type { HomepageConfig, HomepageSectionConfig, HomepageSectionId } from '@/lib/homepage-config-types';
import type { FeaturedProduct } from '@/lib/content';
import type { CardProduct } from '@/lib/products-data';
import { EditorialHero } from '@/components/home/EditorialHero';
import {
  FloatingCollectionOcean,
  type OceanProduct,
} from '@/components/home/FloatingCollectionOcean';
import { StoryMarquee } from '@/components/home/StoryMarquee';
import { WhyChooseAlma } from '@/components/home/WhyChooseAlma';
import { FamilyMatchingShowcase } from '@/components/home/FamilyMatchingShowcase';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { BrandStory } from '@/components/home/BrandStory';
import { OurProcess } from '@/components/home/OurProcess';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { CollectionBannerEditorial } from '@/components/home/CollectionBannerEditorial';
import { CommunityGrid } from '@/components/home/CommunityGrid';
import { HomepageFAQ } from '@/components/home/HomepageFAQ';
import { TrustStrip } from '@/components/home/TrustStrip';
import { HomepageCTA } from '@/components/home/HomepageCTA';
import { CustomerErrorBoundary } from '@/components/ui/CustomerErrorBoundary';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { EditableHomeBlock } from '@/components/home/EditableHomeBlock';
import { HomepageEditBanner } from '@/components/home/HomepageEditBanner';
import { HomepageEditModeProvider } from '@/context/HomepageEditModeContext';
import { getDefaultHomepageExtras } from '@/lib/homepage-extras';
import { CinematicLoadingOverlay } from '@/components/cinematic/CinematicLoadingOverlay';
import { CinematicHero } from '@/components/cinematic/CinematicHero';
import { ColorWashBridge } from '@/components/cinematic/ColorWashBridge';
import { PinnedChaptersSection } from '@/components/cinematic/PinnedChaptersSection';
import { CinematicClosingSection } from '@/components/cinematic/CinematicClosingSection';
import { CinematicAssetPreload } from '@/components/cinematic/CinematicAssetPreload';
import { EditorialQuotePause } from '@/components/cinematic/EditorialQuotePause';
import { HeroFilmStrip } from '@/components/cinematic/HeroFilmStrip';

interface HomePageRendererProps {
  initialConfig: HomepageConfig;
  featuredProducts?: FeaturedProduct[];
  oceanProducts?: OceanProduct[];
  chapterProducts?: (CardProduct | null)[];
  filmStripProducts?: CardProduct[];
  editMode?: boolean;
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

function buildInsertAfter(extras: NonNullable<HomepageConfig['extras']>): Partial<
  Record<HomepageSectionId, ExtraBlock[]>
> {
  const marqueeExtras: ExtraBlock[] = [
    {
      key: 'why-choose-alma',
      sectionId: 'why-choose-alma',
      sectionName: 'Why Choose ALMA',
      node: <WhyChooseAlma />,
    },
  ];
  if (extras.familyMatching.show !== false) {
    marqueeExtras.push({
      key: 'family-matching',
      sectionId: 'family-matching',
      sectionName: 'Family Matching',
      node: <FamilyMatchingShowcase data={extras.familyMatching} />,
    });
  }

  const brandStoryExtras: ExtraBlock[] = [];
  if (extras.ourProcess.show !== false) {
    brandStoryExtras.push({
      key: 'our-process',
      sectionId: 'our-process',
      sectionName: 'Our Process',
      node: <OurProcess data={extras.ourProcess} />,
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
        node: <HomepageFAQ />,
      },
    ],
    trust: [
      {
        key: 'homepage-cta',
        sectionId: 'homepage-cta',
        sectionName: 'Final CTA',
        node: <HomepageCTA />,
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
}: HomePageRendererProps) {
  const [config, setConfig] = useState<HomepageConfig>(initialConfig);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

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

  const sections = getSortedEnabledSections(config);
  const preview = isPreviewMode();
  const extras = config.extras ?? getDefaultHomepageExtras();
  const insertAfter = buildInsertAfter(extras);
  const byId = sectionMap(sections);
  const ctx: RenderCtx = { editMode, preview, featuredProducts, oceanProducts };

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

  function renderEnabledSection(blocks: ReactNode[], sectionId: HomepageSectionId, options?: Parameters<typeof renderSectionContent>[2]) {
    const section = byId[sectionId];
    if (!section) return;
    const content = renderSectionContent(section, ctx, options);
    if (!content) return;
    pushBlock(blocks, sectionId, sectionLabels[sectionId] ?? sectionId, content);
    appendExtras(blocks, sectionId);
  }

  if ((config.cinematicMode ?? true) && !editMode && !preview) {
    const cinematicBlocks: ReactNode[] = [];

    cinematicBlocks.push(
      <CinematicAssetPreload key="cinematic-preload" />,
      <CinematicLoadingOverlay key="cinematic-overlay" />,
      <CinematicHero key="cinematic-hero" />
    );
    cinematicBlocks.push(<ColorWashBridge key="wash-hero-marquee" from="charcoal" to="cream" />);

    renderEnabledSection(cinematicBlocks, 'marquee');
    renderEnabledSection(cinematicBlocks, 'categories');
    renderEnabledSection(cinematicBlocks, 'featured');

    const heroSection = byId.hero;
    if (heroSection) {
      const ocean = renderSectionContent(heroSection, ctx, { oceanOnly: true });
      if (ocean) {
        pushBlock(cinematicBlocks, 'bestSelling', 'Best Selling', ocean);
      }
    }

    cinematicBlocks.push(<ColorWashBridge key="wash-ocean-chapters" from="cream" to="warm-white" />);
    cinematicBlocks.push(
      <PinnedChaptersSection key="pinned-chapters" chapterProducts={chapterProducts} />
    );
    cinematicBlocks.push(<ColorWashBridge key="wash-chapters-brand" from="warm-white" to="cream" />);

    renderEnabledSection(cinematicBlocks, 'brandStory');
    cinematicBlocks.push(<EditorialQuotePause key="editorial-quote" />);
    renderEnabledSection(cinematicBlocks, 'community');
    renderEnabledSection(cinematicBlocks, 'reviews');

    if (filmStripProducts.length > 0) {
      cinematicBlocks.push(
        <HeroFilmStrip key="hero-film-strip" products={filmStripProducts} />
      );
    }

    renderEnabledSection(cinematicBlocks, 'collectionBanner');
    renderEnabledSection(cinematicBlocks, 'trust');

    cinematicBlocks.push(<ColorWashBridge key="wash-trust-closing" from="cream" to="charcoal" />);
    cinematicBlocks.push(<CinematicClosingSection key="cinematic-closing" />);

    return (
      <HomepageEditModeProvider editMode={false}>{cinematicBlocks}</HomepageEditModeProvider>
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
    <HomepageEditModeProvider editMode={editMode}>
      {editMode && <HomepageEditBanner />}
      {blocks}
    </HomepageEditModeProvider>
  );
}
