import {
  BRAND_STORY,
  CATEGORY_SHOWCASE,
  COLLECTION_BANNER,
  COMMUNITY_SECTION,
  EDITORIAL_HERO,
  FEATURED_SECTION,
  HOME_FEATURED_PRODUCTS,
  REVIEWS_SECTION,
  STORY_MARQUEE,
  TRUST_STRIP,
} from '@/lib/content';
import type { FeaturedProduct } from '@/lib/content';
import { getTotalStock, type AdminProduct } from '@/lib/admin-store';
import {
  dedupeFeaturedAdminProducts,
  sanitizeFeaturedSectionData,
} from '@/lib/featured-products';
import { shouldUseStaticDemoCatalog } from '@/lib/storefront/catalog-source';
import { shouldUseApi } from '@/lib/data-source';
import type {
  CategoriesSectionData,
  CategoryCardConfig,
  CategoryColorClass,
  CommunitySectionData,
  FeaturedSectionData,
  HeroSectionData,
  HomepageConfig,
  HomepageSectionConfig,
  HomepageSectionId,
  SectionDataMap,
} from '@/lib/homepage-config-types';
import { DEFAULT_SECTION_ORDER } from '@/lib/homepage-config-types';
import { getDefaultHomepageExtras, mergeHomepageExtras } from '@/lib/homepage-extras';
import { migrateBrandStorySection, migrateCommunitySection } from '@/lib/homepage-migrations';
import { ensureImageSlots } from '@/lib/homepage-image-slots';

export const HOMEPAGE_CONFIG_KEY = 'alma-homepage-config';
export const HOMEPAGE_DRAFT_KEY = 'alma-homepage-draft';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

function categoryFromContent(
  item: (typeof CATEGORY_SHOWCASE.stacked)[number] | typeof CATEGORY_SHOWCASE.featured,
  isFeatured: boolean
): CategoryCardConfig {
  return {
    categorySlug: item.slug,
    displayName: item.name,
    subtitle: isFeatured && 'count' in item ? item.count : '',
    href: item.href,
    bgClass: item.bg as CategoryColorClass,
    imageHint: item.imageHint,
    imageUrl: '',
  };
}

export function getDefaultHomepageConfig(): HomepageConfig {
  const sections: HomepageSectionConfig[] = [
    {
      id: 'hero',
      enabled: true,
      order: 0,
      data: {
        caption: EDITORIAL_HERO.caption,
        title: EDITORIAL_HERO.title,
        subtitle: EDITORIAL_HERO.subtitle,
        ctaPrimary: EDITORIAL_HERO.ctaPrimary,
        ctaPrimaryHref: EDITORIAL_HERO.ctaPrimaryHref,
        ctaSecondary: EDITORIAL_HERO.ctaSecondary,
        ctaSecondaryHref: EDITORIAL_HERO.ctaSecondaryHref,
        backgroundImageUrl: '',
        imageHint: EDITORIAL_HERO.imageHint,
        badges: [...EDITORIAL_HERO.badges],
      },
    },
    {
      id: 'marquee',
      enabled: true,
      order: 1,
      data: { text: STORY_MARQUEE.text },
    },
    {
      id: 'categories',
      enabled: true,
      order: 2,
      data: {
        label: CATEGORY_SHOWCASE.label,
        title: CATEGORY_SHOWCASE.title,
        featured: categoryFromContent(CATEGORY_SHOWCASE.featured, true),
        stacked: [
          categoryFromContent(CATEGORY_SHOWCASE.stacked[0], false),
          categoryFromContent(CATEGORY_SHOWCASE.stacked[1], false),
          categoryFromContent(CATEGORY_SHOWCASE.stacked[2], false),
          categoryFromContent(CATEGORY_SHOWCASE.stacked[3], false),
        ],
      },
    },
    {
      id: 'featured',
      enabled: true,
      order: 3,
      data: {
        label: FEATURED_SECTION.label,
        title: FEATURED_SECTION.title,
        viewAllText: FEATURED_SECTION.viewAll,
        viewAllHref: FEATURED_SECTION.viewAllHref,
        source: 'latest',
        manualProductIds: [],
        productCount: 4,
      },
    },
    {
      id: 'brandStory',
      enabled: true,
      order: 4,
      data: {
        label: BRAND_STORY.label,
        title: BRAND_STORY.title,
        body: BRAND_STORY.body,
        cta: BRAND_STORY.cta,
        ctaHref: BRAND_STORY.ctaHref,
        imageCaption: BRAND_STORY.imageCaption,
        imageHint: BRAND_STORY.imageHint,
        imageUrl: '',
        images: ensureImageSlots(
          undefined,
          3,
          [
            'Image: Premium fabric close-up — verified quality',
            'Image: Family matching collection — coordinated outfits',
            'Image: ALMA team — trusted lifestyle partner',
          ],
          ['bg-mustard', 'bg-terracotta', 'bg-maroon']
        ),
      },
    },
    {
      id: 'reviews',
      enabled: true,
      order: 5,
      data: {
        title: REVIEWS_SECTION.title,
        verifiedLabel: REVIEWS_SECTION.verified,
        items: REVIEWS_SECTION.items.map((r) => ({
          id: r.id,
          rating: 5,
          text: r.text,
          name: r.name,
          city: r.city,
          title: r.title,
          productName: r.productName,
          date: r.date,
        })),
      },
    },
    {
      id: 'collectionBanner',
      enabled: true,
      order: 6,
      data: {
        label: COLLECTION_BANNER.label,
        title: COLLECTION_BANNER.title,
        subtitle: COLLECTION_BANNER.subtitle,
        cta: COLLECTION_BANNER.cta,
        href: COLLECTION_BANNER.href,
        promo: COLLECTION_BANNER.promo,
        bgClass: 'bg-maroon',
        backgroundImageUrl: '',
        imageHint: COLLECTION_BANNER.imageHint,
      },
    },
    {
      id: 'community',
      enabled: true,
      order: 7,
      data: {
        title: COMMUNITY_SECTION.title,
        subtitle: COMMUNITY_SECTION.subtitle,
        instagramUrl: COMMUNITY_SECTION.instagramUrl,
        tiles: COMMUNITY_SECTION.tiles.map((t) => ({
          id: t.id,
          bgClass: t.bg as CategoryColorClass,
          hint: t.hint,
          imageUrl: '',
          caption: '',
          alt: t.hint,
        })),
      },
    },
    {
      id: 'trust',
      enabled: true,
      order: 8,
      data: {
        items: TRUST_STRIP.map((t, i) => ({
          id: String(i + 1),
          icon: t.icon,
          title: t.title,
          text: t.text,
        })),
      },
    },
  ];

  return {
    sections,
    extras: getDefaultHomepageExtras(),
    lastSaved: new Date().toISOString(),
  };
}

/** Valid config for builder + storefront (never empty sections). */
/** Deep-merge saved homepage config with defaults so image URLs and text are preserved. */
export function mergeHomepageConfig(
  saved: HomepageConfig | null | undefined,
  defaults: HomepageConfig = getDefaultHomepageConfig()
): HomepageConfig {
  if (!saved || !Array.isArray(saved.sections) || saved.sections.length === 0) {
    return defaults;
  }

  const byId = new Map(saved.sections.map((s) => [s.id, s]));
  const sections = defaults.sections.map((defaultSection, index) => {
    const savedSection = byId.get(defaultSection.id);
    if (!savedSection || savedSection.id !== defaultSection.id) {
      return { ...defaultSection, order: index };
    }
    let mergedData = {
      ...defaultSection.data,
      ...savedSection.data,
    } as typeof defaultSection.data;

    if (defaultSection.id === 'hero') {
      const raw = savedSection.data as HeroSectionData & { heroImage?: string };
      const hero = mergedData as HeroSectionData;
      if (!hero.backgroundImageUrl?.trim() && raw.heroImage?.trim()) {
        hero.backgroundImageUrl = raw.heroImage.trim();
      }
      mergedData = hero as typeof defaultSection.data;
    }
    if (defaultSection.id === 'brandStory') {
      mergedData = migrateBrandStorySection(mergedData as import('@/lib/homepage-config-types').BrandStorySectionData) as typeof defaultSection.data;
    }
    if (defaultSection.id === 'community') {
      mergedData = migrateCommunitySection(mergedData as import('@/lib/homepage-config-types').CommunitySectionData) as typeof defaultSection.data;
    }
    return {
      ...defaultSection,
      enabled: savedSection.enabled,
      order: savedSection.order ?? index,
      data: mergedData,
    };
  });

  return {
    ...defaults,
    ...saved,
    sections: sections.sort((a, b) => a.order - b.order) as HomepageSectionConfig[],
    extras: mergeHomepageExtras(saved.extras, defaults.extras ?? getDefaultHomepageExtras()),
    lastSaved: saved.lastSaved || defaults.lastSaved,
  };
}

export function ensureHomepageConfig(
  config: HomepageConfig | null | undefined
): HomepageConfig {
  if (!config || !Array.isArray(config.sections) || config.sections.length === 0) {
    return getDefaultHomepageConfig();
  }
  return mergeHomepageConfig(config);
}

function migrateLegacyConfig(raw: Record<string, unknown>): HomepageConfig | null {
  if (Array.isArray(raw.sections)) {
    const config = raw as unknown as HomepageConfig;
    if (config.sections.length === 0) return null;
    return mergeHomepageConfig(config);
  }
  if (typeof raw.heroTitle === 'string') {
    const def = getDefaultHomepageConfig();
    const hero = def.sections.find((s) => s.id === 'hero');
    if (hero && hero.id === 'hero') {
      hero.data.title = String(raw.heroTitle);
      hero.data.subtitle = String(raw.heroSubtitle ?? hero.data.subtitle);
    }
    return def;
  }
  return null;
}

export function normalizeHomepageConfig(config: HomepageConfig): HomepageConfig {
  return mergeHomepageConfig(config);
}

export function getSavedHomepageConfig(): HomepageConfig {
  const def = getDefaultHomepageConfig();
  if (!isBrowser()) return def;
  const raw = localStorage.getItem(HOMEPAGE_CONFIG_KEY);
  if (!raw) return def;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const migrated = migrateLegacyConfig(parsed);
    if (migrated) return ensureHomepageConfig(migrated);
    return def;
  } catch {
    return def;
  }
}

export function saveHomepageConfig(config: HomepageConfig): HomepageConfig {
  const next: HomepageConfig = {
    ...ensureHomepageConfig(config),
    lastSaved: new Date().toISOString(),
  };
  writeJson(HOMEPAGE_CONFIG_KEY, next);
  writeJson(HOMEPAGE_DRAFT_KEY, next);
  return next;
}

export function getDraftHomepageConfig(): HomepageConfig | null {
  if (!isBrowser()) return null;
  const raw = readJson<HomepageConfig | null>(HOMEPAGE_DRAFT_KEY, null);
  return raw ? normalizeHomepageConfig(raw) : null;
}

export function saveDraftHomepageConfig(config: HomepageConfig): void {
  const next = ensureHomepageConfig(config);
  writeJson(HOMEPAGE_DRAFT_KEY, next);
}

export function isPreviewMode(): boolean {
  if (!isBrowser()) return false;
  return new URLSearchParams(window.location.search).get('preview') === 'true';
}

/** Config for storefront: draft when ?preview=true, else saved, else defaults */
export function getActiveHomepageConfig(): HomepageConfig {
  if (isPreviewMode()) {
    const draft = getDraftHomepageConfig();
    if (draft) return draft;
  }
  return getSavedHomepageConfig();
}

export function getSortedEnabledSections(
  config: HomepageConfig
): HomepageSectionConfig[] {
  return [...config.sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);
}

export function updateSectionData<K extends HomepageSectionId>(
  config: HomepageConfig,
  id: K,
  data: Partial<SectionDataMap[K]>
): HomepageConfig {
  return {
    ...config,
    sections: config.sections.map((s) =>
      s.id === id ? { ...s, data: { ...s.data, ...data } } : s
    ) as HomepageSectionConfig[],
  };
}

export function adminProductToFeatured(p: AdminProduct, index: number): FeaturedProduct {
  const bg = p.images[0]?.url ? 'bg-cream' : 'bg-[#e8e4df]';
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.priceBdt,
    compareAtPrice: p.compareAtPriceBdt,
    bgClass: bg,
    href: `/products/${p.slug}`,
    layout: index % 2 === 1 ? 'tall' : 'normal',
    imageHint: p.shortDescription || `Image: ${p.title}`,
    isNew: p.status === 'published' && Date.now() - new Date(p.createdAt).getTime() < 86400000 * 14,
  };
}

function getPublishedCatalogLocal(): AdminProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('alma-admin-products');
    if (!raw) return [];
    return (JSON.parse(raw) as AdminProduct[]).filter((p) => p.status === 'published');
  } catch {
    return [];
  }
}

export function resolveFeaturedProducts(data: FeaturedSectionData): FeaturedProduct[] {
  const section = sanitizeFeaturedSectionData(data);
  if (shouldUseApi()) {
    return [];
  }
  const catalog = getPublishedCatalogLocal();
  let list: AdminProduct[] = [];

  if (section.source === 'latest') {
    list = [...catalog].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } else if (section.source === 'bestsellers') {
    list = [...catalog].sort((a, b) => getTotalStock(a) - getTotalStock(b));
  } else if (section.source === 'manual' && section.manualProductIds.length > 0) {
    list = section.manualProductIds
      .map((id) => catalog.find((p) => p.id === id))
      .filter((p): p is AdminProduct => !!p);
  } else {
    list = [...catalog].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  if (list.length === 0) {
    return shouldUseStaticDemoCatalog()
      ? HOME_FEATURED_PRODUCTS.slice(0, section.productCount)
      : [];
  }

  list = dedupeFeaturedAdminProducts(list, section.productCount);

  return list.slice(0, section.productCount).map((p, i) => adminProductToFeatured(p, i));
}

export function getSectionConfig<K extends HomepageSectionId>(
  config: HomepageConfig,
  id: K
): Extract<HomepageSectionConfig, { id: K }> | undefined {
  return config.sections.find((s) => s.id === id) as Extract<
    HomepageSectionConfig,
    { id: K }
  > | undefined;
}
