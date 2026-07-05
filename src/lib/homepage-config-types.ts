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
  hideUntilPhotosAdded?: boolean;
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

export interface HomepageCtaData {
  heading: string;
  body: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
}

export interface HomepageExtras {
  familyMatching: FamilyMatchingSectionData;
  ourProcess: OurProcessSectionData;
  homepageCta?: HomepageCtaData;
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

/**
 * Editable copy for the Obsidian (cinematic) homepage layout. These strings
 * used to be hard-coded inside `ObsidianHome.tsx`; they now live in the homepage
 * config so the owner can edit every line from the visual editor.
 */
export interface ObsidianSpotlightCopy {
  badgeDark: string;
  badgeLight: string;
  titleLine1: string;
  titleLine2: string;
  bodyBn: string;
  bodyEn: string;
  ctaPrimary: string;
  ctaPrimaryHref: string;
  ctaSecondary: string;
  ctaSecondaryHref: string;
  whatButton: string;
  categoryGo: string;
}

export interface ObsidianProductsCopy {
  heading: string;
  viewAll: string;
  viewAllHref: string;
}

export interface ObsidianShineCopy {
  tag: string;
  titleLine1: string;
  titleLine2: string;
}

export interface ObsidianCatsCopy {
  items: string[];
  cta: string;
  ctaHref: string;
}

export interface ObsidianHomeCopy {
  spotlight: ObsidianSpotlightCopy;
  products: ObsidianProductsCopy;
  shine: ObsidianShineCopy;
  cats: ObsidianCatsCopy;
}

export const DEFAULT_OBSIDIAN_COPY: ObsidianHomeCopy = {
  spotlight: {
    badgeDark: 'ALMA',
    badgeLight: 'SPOTLIGHT',
    titleLine1: 'CRAFTED FOR',
    titleLine2: 'EVERY OCCASION',
    bodyBn: 'প্রিমিয়াম কাপড়, নিখুঁত সেলাই — প্রতিটি পাঞ্জাবিতে আলমার স্বাক্ষর।',
    bodyEn: 'Handpicked fabrics, tailored to perfection — delivered across Bangladesh.',
    ctaPrimary: 'Shop Panjabi',
    ctaPrimaryHref: '/products?category=panjabi',
    ctaSecondary: 'View Collection',
    ctaSecondaryHref: '/products',
    whatButton: 'এটা কী?',
    categoryGo: 'দেখুন →',
  },
  products: {
    heading: 'ALMA COLLECTION',
    viewAll: 'সব পণ্য দেখুন ▶',
    viewAllHref: '/products',
  },
  shine: {
    tag: 'ALMA COLLECTION',
    titleLine1: 'যে পাঞ্জাবিতে আপনি',
    titleLine2: 'নিজেই মুগ্ধ হবেন',
  },
  cats: {
    items: ['পাঞ্জাবি', 'ইসলামিক', 'এক্সেসরিজ', 'ইলেকট্রনিক্স', 'হোম ও ডেকর', 'ফ্যামিলি সেট'],
    cta: 'সব পণ্য দেখুন',
    ctaHref: '/products',
  },
};

/**
 * Per-slot image override + framing adjustment for the Obsidian homepage's
 * catalog-derived imagery (hero coverflow, spotlight, product grid, shine band,
 * footer strip). Every field optional: when all unset the slot renders its
 * original catalog image with no reframing.
 */
export interface HomepageImageSlotAdjust {
  /** Replacement image URL. When empty/absent the slot keeps its catalog image. */
  url?: string;
  /** objectPosition X, 0–100 (%). Default 50. */
  posX?: number;
  /** objectPosition Y, 0–100 (%). Default 50. */
  posY?: number;
  /** CSS scale factor, 1–2.5. Default 1 (no zoom). */
  zoom?: number;
}

/**
 * Editable copy for the static chrome around the Obsidian hero overlay. These
 * labels are shared by every slide (they are not product data), so the owner can
 * rename them without any risk of drifting out of sync with the catalog. The
 * product name / code / price shown on each card always come from the live
 * product the owner assigns to that slot (see {@link HomepageConfig.heroProductIds}).
 */
export interface HeroOverlayConfig {
  hotBadge?: string;
  shopNow?: string;
  seeAll?: string;
}

export const DEFAULT_HERO_OVERLAY: HeroOverlayConfig = {
  hotBadge: 'HOT',
  shopNow: 'Shop Now',
  seeAll: 'সব পণ্য দেখুন ▶',
};

export interface HomepageConfig {
  sections: HomepageSectionConfig[];
  extras?: HomepageExtras;
  /** Editable copy for the Obsidian/cinematic homepage layout. */
  obsidianCopy?: ObsidianHomeCopy;
  /** Owner-editable static labels for the hero overlay (HOT / Shop Now / see-all). */
  heroOverlay?: HeroOverlayConfig;
  /**
   * Products the owner has pinned to the hero coverflow, one per 3D card slot
   * (index 0 = first product card). A set id shows that exact product — with its
   * live image, name and price. An empty/absent slot falls back to the
   * auto-picked signature product, so the hero never renders a blank card.
   */
  heroProductIds?: string[];
  /**
   * Per-slot image overrides for the Obsidian homepage, keyed by slot id
   * (`hero-0`…`hero-5`, `spotlight`, `grid-0`…`grid-7`, `shine-0`…`shine-7`,
   * `strip-0`…`strip-11`). See {@link HomepageImageSlotAdjust}.
   */
  imageSlots?: Record<string, HomepageImageSlotAdjust>;
  lastSaved: string;
  /** Overridden by site_config.cinematic_mode_enabled when set */
  cinematicMode?: boolean;
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
