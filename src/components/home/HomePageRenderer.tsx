'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  getDraftHomepageConfig,
  getSortedEnabledSections,
  isPreviewMode,
  resolveFeaturedProducts,
} from '@/lib/homepage-config';
import type { HomepageConfig } from '@/lib/homepage-config-types';
import type { FeaturedProduct } from '@/lib/content';
import { EditorialHero } from '@/components/home/EditorialHero';
import {
  FloatingCollectionOcean,
  type OceanProduct,
} from '@/components/home/FloatingCollectionOcean';
import { StoryMarquee } from '@/components/home/StoryMarquee';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { BrandStory } from '@/components/home/BrandStory';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { CollectionBannerEditorial } from '@/components/home/CollectionBannerEditorial';
import { CommunityGrid } from '@/components/home/CommunityGrid';
import { TrustStrip } from '@/components/home/TrustStrip';
import { CustomerErrorBoundary } from '@/components/ui/CustomerErrorBoundary';
import { SectionDivider } from '@/components/ui/SectionDivider';

interface HomePageRendererProps {
  initialConfig: HomepageConfig;
  featuredProducts?: FeaturedProduct[];
  oceanProducts?: OceanProduct[];
}

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

  const sectionLabels: Record<string, string> = {
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

  const blocks: ReactNode[] = [];

  sections.forEach((section, index) => {
    const label = sectionLabels[section.id] ?? 'সেকশন';

    const content = (() => {
      switch (section.id) {
        case 'hero':
          return (
            <>
              <EditorialHero data={section.data} featuredProducts={featuredProducts} />
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

    blocks.push(
      <CustomerErrorBoundary key={section.id} sectionLabel={label}>
        {content}
      </CustomerErrorBoundary>
    );

    const next = sections[index + 1];
    if (next && section.id !== 'marquee' && next.id !== 'marquee') {
      blocks.push(<SectionDivider key={`divider-${section.id}`} />);
    }
  });

  return <>{blocks}</>;
}
