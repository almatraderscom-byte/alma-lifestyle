'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  getDraftHomepageConfig,
  getSortedEnabledSections,
  isPreviewMode,
  resolveFeaturedProducts,
} from '@/lib/homepage-config';
import type { HomepageConfig, HomepageSectionId } from '@/lib/homepage-config-types';
import type { FeaturedProduct } from '@/lib/content';
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

interface HomePageRendererProps {
  initialConfig: HomepageConfig;
  featuredProducts?: FeaturedProduct[];
  oceanProducts?: OceanProduct[];
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

/** Extra homepage blocks inserted after config-driven sections */
const INSERT_AFTER: Partial<Record<HomepageSectionId, ReactNode[]>> = {
  marquee: [
    <WhyChooseAlma key="why-choose-alma" />,
    <FamilyMatchingShowcase key="family-matching" />,
  ],
  brandStory: [<OurProcess key="our-process" />],
  community: [<HomepageFAQ key="homepage-faq" />],
  trust: [<HomepageCTA key="homepage-cta" />],
};

export function HomePageRenderer({
  initialConfig,
  featuredProducts = [],
  oceanProducts = [],
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

  const blocks: ReactNode[] = [];

  function pushBlock(key: string, label: string, content: ReactNode) {
    blocks.push(
      <CustomerErrorBoundary key={key} sectionLabel={label}>
        {content}
      </CustomerErrorBoundary>
    );
  }

  function maybeDivider(beforeId: HomepageSectionId, afterId?: HomepageSectionId) {
    if (!afterId || beforeId === 'marquee' || afterId === 'marquee') return;
    blocks.push(<SectionDivider key={`divider-${beforeId}-${afterId}`} />);
  }

  sections.forEach((section, index) => {
    const label = sectionLabels[section.id] ?? 'সেকশন';
    const next = sections[index + 1];

    const content = (() => {
      switch (section.id) {
        case 'hero':
          return (
            <>
              <EditorialHero data={section.data} />
              <FloatingCollectionOcean products={oceanProducts} />
            </>
          );
        case 'marquee':
          return <StoryMarquee data={section.data} />;
        case 'categories':
          return <CategoryShowcase data={section.data} />;
        case 'featured':
          return (
            <FeaturedProductsSection
              data={section.data}
              products={
                preview ? resolveFeaturedProducts(section.data) : featuredProducts
              }
            />
          );
        case 'brandStory':
          return <BrandStory data={section.data} />;
        case 'reviews':
          return <ReviewsSection data={section.data} />;
        case 'collectionBanner':
          return <CollectionBannerEditorial data={section.data} />;
        case 'community':
          return <CommunityGrid data={section.data} />;
        case 'trust':
          return <TrustStrip data={section.data} />;
        default:
          return null;
      }
    })();

    if (!content) return;

    pushBlock(section.id, label, content);

    const extras = INSERT_AFTER[section.id];
    if (extras?.length) {
      extras.forEach((extra, i) => {
        pushBlock(`${section.id}-extra-${i}`, 'সেকশন', extra);
      });
    }

    if (next) {
      maybeDivider(section.id, next.id);
    }
  });

  return <>{blocks}</>;
}
