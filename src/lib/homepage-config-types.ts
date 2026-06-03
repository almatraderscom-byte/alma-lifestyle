import type { FeaturedProduct } from '@/lib/content';

export type HomepageSectionId =
  | 'hero'
  | 'marquee'
  | 'categories'
  | 'featured'
  | 'brandStory'
  | 'reviews'
  | 'collectionBanner'
  | 'community'
  | 'trust';

export type CategoryColorClass =
  | 'bg-maroon'
  | 'bg-terracotta'
  | 'bg-emerald'
  | 'bg-mustard'
  | 'bg-charcoal'
  | 'bg-cream';

export interface HeroSectionData {
  caption: string;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaPrimaryHref: string;
  ctaSecondary: string;
  ctaSecondaryHref: string;
  backgroundImageUrl: string;
  imageHint: string;
  badges: string[];
}

export interface MarqueeSectionData {
  text: string;
}

export interface CategoryCardConfig {
  categorySlug: string;
  displayName: string;
  subtitle: string;
  href: string;
  bgClass: CategoryColorClass;
  imageHint: string;
  imageUrl: string;
}

export interface CategoriesSectionData {
  label: string;
  title: string;
  featured: CategoryCardConfig;
  stacked: [
    CategoryCardConfig,
    CategoryCardConfig,
    CategoryCardConfig,
    CategoryCardConfig,
  ];
}

export type FeaturedProductSource = 'latest' | 'bestsellers' | 'manual';

export interface FeaturedSectionData {
  label: string;
  title: string;
  viewAllText: string;
  viewAllHref: string;
  source: FeaturedProductSource;
  manualProductIds: string[];
  productCount: 4 | 8 | 12;
}

export interface HomepageImageSlot {
  url: string;
  caption: string;
  alt: string;
  imageHint: string;
  bgClass?: CategoryColorClass;
}

export interface BrandStorySectionData {
  label: string;
  title: string;
  body: string;
  cta: string;
  ctaHref: string;
  /** @deprecated use images[0] — kept for migration */
  imageCaption: string;
  imageHint: string;
  imageUrl: string;
  /** [0] large left, [1] top-right, [2] bottom-right */
  images: HomepageImageSlot[];
}

export interface ReviewItemConfig {
  id: string;
  rating: number;
  text: string;
  name: string;
  city: string;
  title?: string;
  productName?: string;
  date?: string;
}

export interface ReviewsSectionData {
  title: string;
  verifiedLabel: string;
  items: ReviewItemConfig[];
}

export interface CollectionBannerSectionData {
  label: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  promo: string;
  bgClass: CategoryColorClass;
  backgroundImageUrl: string;
  imageHint: string;
}

export interface CommunityTileConfig {
  id: string;
  bgClass: CategoryColorClass;
  hint: string;
  imageUrl: string;
  caption: string;
  alt: string;
}

export interface CommunitySectionData {
  title: string;
  subtitle: string;
  instagramUrl: string;
  tiles: CommunityTileConfig[];
}

export interface TrustItemConfig {
  id: string;
  icon: string;
  title: string;
  text: string;
}

export interface TrustSectionData {
  items: TrustItemConfig[];
}

export interface FamilyMatchingCardConfig {
  id: string;
  label: string;
  href: string;
  imageHint: string;
  bgClass: CategoryColorClass;
  imageUrl: string;
  caption: string;
  alt: string;
}

export interface FamilyMatchingSectionData {
  /** When false, section is hidden on the customer homepage */
  show: boolean;
  label: string;
  title: string;
  body: string;
  ctaText: string;
  ctaHref: string;
  banner: HomepageImageSlot;
  cards: FamilyMatchingCardConfig[];
}

export interface OurProcessStepConfig {
  icon: string;
  title: string;
  description: string;
  bgClass: CategoryColorClass;
  imageUrl: string;
  caption: string;
  alt: string;
  imageHint: string;
}

export interface OurProcessSectionData {
  show: boolean;
  label: string;
  title: string;
  subtitle: string;
  steps: OurProcessStepConfig[];
}

export interface HomepageExtras {
  familyMatching: FamilyMatchingSectionData;
  ourProcess: OurProcessSectionData;
}

export interface SectionDataMap {
  hero: HeroSectionData;
  marquee: MarqueeSectionData;
  categories: CategoriesSectionData;
  featured: FeaturedSectionData;
  brandStory: BrandStorySectionData;
  reviews: ReviewsSectionData;
  collectionBanner: CollectionBannerSectionData;
  community: CommunitySectionData;
  trust: TrustSectionData;
}

export type HomepageSectionConfig = {
  [K in HomepageSectionId]: {
    id: K;
    enabled: boolean;
    order: number;
    data: SectionDataMap[K];
  };
}[HomepageSectionId];

export interface HomepageConfig {
  cinematicMode?: boolean;
  sections: HomepageSectionConfig[];
  extras?: HomepageExtras;
  lastSaved: string;
}

/** Accordion / visual-editor ids for blocks outside `sections` */
export type HomepageExtraSectionId =
  | 'family-matching'
  | 'our-process'
  | 'why-choose-alma'
  | 'homepage-faq'
  | 'homepage-cta'
  | 'bestSelling';

export type HomepageEditorSectionId = HomepageSectionId | HomepageExtraSectionId;

export const HOMEPAGE_SECTION_LABELS: Record<HomepageSectionId, string> = {
  hero: 'Editorial Hero',
  marquee: 'Story Marquee',
  categories: 'Category Showcase',
  featured: 'Featured Products',
  brandStory: 'Brand Story',
  reviews: 'Reviews',
  collectionBanner: 'Collection Banner',
  community: 'Community Grid',
  trust: 'Trust Strip',
};

export const DEFAULT_SECTION_ORDER: HomepageSectionId[] = [
  'hero',
  'marquee',
  'categories',
  'featured',
  'brandStory',
  'reviews',
  'collectionBanner',
  'community',
  'trust',
];

/** Resolved featured products for rendering (not stored in config JSON) */
export type ResolvedFeaturedSection = FeaturedSectionData & {
  products: FeaturedProduct[];
};
