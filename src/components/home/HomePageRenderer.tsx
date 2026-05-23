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

  return (
    <>
      {sections.map((section) => {
        switch (section.id) {
          case 'hero':
            return <EditorialHero key={section.id} data={section.data} />;
          case 'marquee':
            return <StoryMarquee key={section.id} data={section.data} />;
          case 'categories':
            return <CategoryShowcase key={section.id} data={section.data} />;
          case 'featured':
            return (
              <FeaturedProductsSection
                key={section.id}
                data={section.data}
                products={resolveFeaturedProducts(section.data)}
              />
            );
          case 'brandStory':
            return <BrandStory key={section.id} data={section.data} />;
          case 'reviews':
            return <ReviewsSection key={section.id} data={section.data} />;
          case 'collectionBanner':
            return <CollectionBannerEditorial key={section.id} data={section.data} />;
          case 'community':
            return <CommunityGrid key={section.id} data={section.data} />;
          case 'trust':
            return <TrustStrip key={section.id} data={section.data} />;
          default:
            return null;
        }
      })}
    </>
  );
}
