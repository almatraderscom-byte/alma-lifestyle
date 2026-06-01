import type { CatalogProduct } from '@/lib/products-data';
import type { ProductType } from '@/lib/product-design-types';

export type StorefrontGalleryImage = {
  id: string;
  url?: string;
  bgClass: string;
  /** family-group hero shot */
  isFamilyGroup?: boolean;
  /** ms for auto-play; default 4000 */
  durationMs?: number;
};

const TAB_ORDER: ProductType[] = [
  'men_panjabi',
  'boy_panjabi',
  'women_three_piece',
  'girl_two_piece',
];

function mapProductImages(product: CatalogProduct): StorefrontGalleryImage[] {
  return (product.images ?? []).map((img) => {
    const ext = img as { url?: string; isFamilyGroup?: boolean; durationMs?: number };
    return {
      id: img.id,
      url: ext.url,
      bgClass: img.bgClass,
      isFamilyGroup: ext.isFamilyGroup,
      durationMs: ext.durationMs,
    };
  });
}

/** Images for matching-set PDP: family hero first, then active member, then other members. */
export function buildMatchingSetGallery(
  group: CatalogProduct,
  activeMember: CatalogProduct
): StorefrontGalleryImage[] {
  const members = group.designGroupMembers ?? [group];
  const seen = new Set<string>();
  const out: StorefrontGalleryImage[] = [];

  function pushUnique(images: StorefrontGalleryImage[]) {
    for (const img of images) {
      const key = img.url ?? img.id;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(img);
    }
  }

  const familyFromAny = members.flatMap((m) =>
    mapProductImages(m).filter((i) => i.isFamilyGroup)
  );
  if (familyFromAny.length) {
    pushUnique(
      familyFromAny.map((img) => ({
        ...img,
        durationMs: 5000,
      }))
    );
  }

  pushUnique(
    mapProductImages(activeMember).filter((i) => !i.isFamilyGroup)
  );

  for (const type of TAB_ORDER) {
    const member = members.find((m) => m.productType === type);
    if (!member || member.id === activeMember.id) continue;
    pushUnique(
      mapProductImages(member).filter((i) => !i.isFamilyGroup)
    );
  }

  if (out.length === 0 && activeMember.images?.length) {
    return mapProductImages(activeMember);
  }

  return out.length ? out : [{ id: 'placeholder', bgClass: activeMember.bgClass }];
}

/** Listing card: all unique member images for auto-rotation (family hero first). */
export function buildListingCardGallery(product: CatalogProduct): StorefrontGalleryImage[] {
  if (product.designGroupMembers && product.designGroupMembers.length > 1) {
    const members = product.designGroupMembers;
    const men = members.find((m) => m.productType === 'men_panjabi') ?? members[0];
    const seen = new Set<string>();
    const out: StorefrontGalleryImage[] = [];

    function pushUnique(images: StorefrontGalleryImage[]) {
      for (const img of images) {
        const key = img.url ?? img.id;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(img);
      }
    }

    const family = members.flatMap((m) =>
      mapProductImages(m).filter((i) => i.isFamilyGroup)
    );
    if (family.length) pushUnique(family);

    pushUnique(mapProductImages(men).filter((i) => !i.isFamilyGroup));

    for (const type of TAB_ORDER) {
      const member = members.find((m) => m.productType === type);
      if (!member || member.id === men.id) continue;
      pushUnique(mapProductImages(member).filter((i) => !i.isFamilyGroup));
    }

    return out.length ? out : [{ id: '1', bgClass: product.bgClass }];
  }

  const imgs = mapProductImages(product);
  return imgs.length ? imgs : [{ id: '1', bgClass: product.bgClass }];
}
