import type {
  BrandStorySectionData,
  CommunitySectionData,
  CommunityTileConfig,
} from '@/lib/homepage-config-types';
import { ensureImageSlots } from '@/lib/homepage-image-slots';

const BRAND_STORY_IMAGE_HINTS = [
  'Image: Weaver at loom — Sirajganj, warm documentary style',
  'Image: Fabric close-up — cotton texture',
  'Image: Family in ALMA outfits — candid smile',
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
  return { ...data, tiles };
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
