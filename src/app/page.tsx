import { EditorialHero } from '@/components/home/EditorialHero';
import { StoryMarquee } from '@/components/home/StoryMarquee';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { BrandStory } from '@/components/home/BrandStory';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { CollectionBannerEditorial } from '@/components/home/CollectionBannerEditorial';
import { CommunityGrid } from '@/components/home/CommunityGrid';
import { TrustStrip } from '@/components/home/TrustStrip';

export default function HomePage() {
  return (
    <>
      <EditorialHero />
      <StoryMarquee />
      <CategoryShowcase />
      <FeaturedProductsSection />
      <BrandStory />
      <ReviewsSection />
      <CollectionBannerEditorial />
      <CommunityGrid />
      <TrustStrip />
    </>
  );
}
