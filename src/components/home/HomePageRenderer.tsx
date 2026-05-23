'use client';

import { useEffect, useState } from 'react';
import {
  getActiveHomepageConfig,
  getSortedEnabledSections,
  resolveFeaturedProducts,
} from '@/lib/homepage-config';
import type { HomepageConfig } from '@/lib/homepage-config-types';
import { EditorialHero } from '@/components/home/EditorialHero';
import { StoryMarquee } from '@/components/home/StoryMarquee';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { BrandStory } from '@/components/home/BrandStory';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { CollectionBannerEditorial } from '@/components/home/CollectionBannerEditorial';
import { CommunityGrid } from '@/components/home/CommunityGrid';
import { TrustStrip } from '@/components/home/TrustStrip';
import { CustomerErrorBoundary } from '@/components/ui/CustomerErrorBoundary';

interface HomePageRendererProps {
  initialConfig?: HomepageConfig;
}

export function HomePageRenderer({ initialConfig }: HomePageRendererProps) {
  const [config, setConfig] = useState<HomepageConfig | null>(initialConfig ?? null);

  useEffect(() => {
    if (!initialConfig) {
      setConfig(getActiveHomepageConfig());
    }

    function refresh() {
      setConfig(getActiveHomepageConfig());
    }
    function onStorage(e: StorageEvent) {
      if (
        e.key === 'alma-homepage-draft' ||
        e.key === 'alma-homepage-config'
      ) {
        refresh();
      }
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('alma-homepage-draft-updated', refresh);
    const interval = setInterval(refresh, 800);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('alma-homepage-draft-updated', refresh);
      clearInterval(interval);
    };
  }, []);

  if (!config) {
    return <div className="min-h-screen bg-warm-white" aria-hidden />;
  }

  const sections = getSortedEnabledSections(config);

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

  return (
    <>
      {sections.map((section) => {
        const label = sectionLabels[section.id] ?? 'সেকশন';

        const content = (() => {
          switch (section.id) {
            case 'hero':
              return <EditorialHero data={section.data} />;
            case 'marquee':
              return <StoryMarquee data={section.data} />;
            case 'categories':
              return <CategoryShowcase data={section.data} />;
            case 'featured':
              return (
                <FeaturedProductsSection
                  data={section.data}
                  products={resolveFeaturedProducts(section.data)}
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

        if (!content) return null;

        return (
          <CustomerErrorBoundary key={section.id} sectionLabel={label}>
            {content}
          </CustomerErrorBoundary>
        );
      })}
    </>
  );
}
