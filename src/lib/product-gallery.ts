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

/** Listing card: family group or men's featured, plus second image for hover. */
export function buildListingCardGallery(product: CatalogProduct): StorefrontGalleryImage[] {
  if (product.designGroupMembers && product.designGroupMembers.length > 1) {
    const members = product.designGroupMembers;
    const men = members.find((m) => m.productType === 'men_panjabi') ?? members[0];
    const family = members.flatMap((m) =>
      mapProductImages(m).filter((i) => i.isFamilyGroup)
    );
    const menMember = mapProductImages(men).filter((i) => !i.isFamilyGroup);
    const boy = members.find((m) => m.productType === 'boy_panjabi');
    const boyImg = boy
      ? mapProductImages(boy).filter((i) => !i.isFamilyGroup)
      : [];

    const primary = family[0] ?? menMember[0];
    const secondary =
      family[0] && menMember[0]
        ? menMember[0]
        : boyImg[0] ?? menMember[1] ?? members[1]
          ? mapProductImages(members[1]).find((i) => !i.isFamilyGroup)
          : undefined;

    const list: StorefrontGalleryImage[] = [];
    if (primary) list.push(primary);
    if (secondary && (secondary.url ?? secondary.id) !== (primary?.url ?? primary?.id)) {
      list.push(secondary);
    }
    return list.length ? list : [{ id: '1', bgClass: product.bgClass }];
  }

  const imgs = mapProductImages(product);
  return imgs.length ? imgs : [{ id: '1', bgClass: product.bgClass }];
}
