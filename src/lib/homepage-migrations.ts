import type {
  BrandStorySectionData,
  CategoryColorClass,
  CommunitySectionData,
  CommunityTileConfig,
  FamilyMatchingCardConfig,
  FamilyMatchingSectionData,
  HomepageImageSlot,
  OurProcessSectionData,
} from '@/lib/homepage-config-types';
import { ensureImageSlots, emptyImageSlot } from '@/lib/homepage-image-slots';

const PLACEHOLDER_HEX_TO_BG: Record<string, CategoryColorClass> = {
  '#6b2737': 'bg-maroon',
  '#c97d5d': 'bg-terracotta',
  '#c89b3c': 'bg-mustard',
  '#2d5f4f': 'bg-emerald',
};

type LegacyFamilyMatching = FamilyMatchingSectionData & {
  sectionLabel?: string;
  heading?: string;
  ctaLink?: string;
  mainImage?: HomepageImageSlot & { hint?: string };
  typeCards?: Array<{
    label?: string;
    image?: string;
    imageUrl?: string;
    caption?: string;
    alt?: string;
    placeholderColor?: string;
    href?: string;
    id?: string;
  }>;
};

export function migrateFamilyMatchingSection(
  data: FamilyMatchingSectionData,
  defaults?: FamilyMatchingSectionData
): FamilyMatchingSectionData {
  const raw = data as LegacyFamilyMatching;
  const def = defaults;

  let banner = raw.banner ?? raw.mainImage;
  if (raw.mainImage && !raw.banner) {
    banner = {
      url: raw.mainImage.url ?? '',
      caption: raw.mainImage.caption ?? '',
      alt: raw.mainImage.alt ?? '',
      imageHint: raw.mainImage.imageHint ?? raw.mainImage.hint ?? '',
      bgClass: raw.mainImage.bgClass,
    };
  }
  if (!banner?.imageHint && def?.banner) {
    banner = { ...def.banner, ...banner };
  }

  let cards = raw.cards;
  if (raw.typeCards?.length && !cards?.length) {
    cards = raw.typeCards.map((card, i) => {
      const defCard = def?.cards?.[i];
      const hex = card.placeholderColor?.toLowerCase();
      const bgClass =
        (hex && PLACEHOLDER_HEX_TO_BG[hex]) ||
        defCard?.bgClass ||
        'bg-maroon';
      return {
        id: card.id ?? defCard?.id ?? `family-${i + 1}`,
        label: card.label ?? defCard?.label ?? '',
        href: card.href ?? defCard?.href ?? '/products',
        imageHint: defCard?.imageHint ?? '',
        bgClass,
        imageUrl: card.imageUrl ?? card.image ?? '',
        caption: card.caption ?? '',
        alt: card.alt ?? '',
      } satisfies FamilyMatchingCardConfig;
    });
  }

  return {
    show: raw.show ?? def?.show ?? true,
    label: raw.label?.trim() || raw.sectionLabel?.trim() || def?.label || '',
    title: raw.title?.trim() || raw.heading?.trim() || def?.title || '',
    body: raw.body?.trim() || def?.body || '',
    ctaText: raw.ctaText?.trim() || def?.ctaText || '',
    ctaHref: raw.ctaHref?.trim() || raw.ctaLink?.trim() || def?.ctaHref || '/products',
    banner: banner ?? emptyImageSlot(def?.banner?.imageHint ?? '', def?.banner?.bgClass),
    cards: cards ?? def?.cards ?? [],
  };
}

export function migrateOurProcessSection(
  data: OurProcessSectionData,
  defaults?: OurProcessSectionData
): OurProcessSectionData {
  const def = defaults;
  return {
    show: data.show ?? def?.show ?? true,
    label: data.label?.trim() || def?.label || '',
    title: data.title?.trim() || def?.title || '',
    subtitle: data.subtitle?.trim() || def?.subtitle || '',
    steps: data.steps?.length ? data.steps : def?.steps ?? [],
  };
}

const BRAND_STORY_IMAGE_HINTS = [
  'Image: Premium fabric close-up — verified quality',
  'Image: Family matching collection — coordinated outfits',
  'Image: ALMA team — trusted lifestyle partner',
] as const;

const BRAND_STORY_BG: Array<'bg-mustard' | 'bg-terracotta' | 'bg-maroon'> = [
  'bg-mustard',
  'bg-terracotta',
  'bg-maroon',
];

export function migrateBrandStorySection(data: BrandStorySectionData): BrandStorySectionData {
  let images = data.images;

  if (!images?.length) {
    images = ensureImageSlots(undefined, 3, [...BRAND_STORY_IMAGE_HINTS], [...BRAND_STORY_BG]);
    if (data.imageUrl?.trim()) {
      images[0] = {
        ...images[0],
        url: data.imageUrl.trim(),
        caption: data.imageCaption || images[0].caption,
        alt: data.imageHint || images[0].alt,
      };
    }
  } else {
    images = ensureImageSlots(images, 3, [...BRAND_STORY_IMAGE_HINTS], [...BRAND_STORY_BG]);
  }

  const primary = images[0];
  return {
    ...data,
    images,
    imageUrl: primary.url,
    imageCaption: primary.caption || data.imageCaption,
    imageHint: primary.imageHint || data.imageHint,
  };
}

export function migrateCommunitySection(data: CommunitySectionData): CommunitySectionData {
  const tiles = data.tiles.map((tile) => ({
    ...tile,
    caption: tile.caption ?? '',
    alt: tile.alt ?? tile.hint,
  }));
  return { hideUntilPhotosAdded: data.hideUntilPhotosAdded ?? false, ...data, tiles };
}

export function normalizeCommunityTiles(
  tiles: CommunityTileConfig[],
  minCount = 6
): CommunityTileConfig[] {
  if (tiles.length >= minCount) return tiles;
  const out = [...tiles];
  while (out.length < minCount) {
    const n = out.length + 1;
    out.push({
      id: String(n),
      bgClass: 'bg-maroon',
      hint: `Image: Community photo ${n}`,
      imageUrl: '',
      caption: '',
      alt: '',
    });
  }
  return out;
}
