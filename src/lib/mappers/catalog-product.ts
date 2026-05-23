import type { ProductType } from '@/lib/product-design-types';
import type { CatalogProduct, CategorySlug } from '@/lib/products-data';
import type { Category, ProductWithRelations } from '@/server/db/schema';

const BG_CLASSES = [
  'bg-[#2c3e5c]',
  'bg-[#e8e4df]',
  'bg-[#8b7355]',
  'bg-[#4a5568]',
  'bg-[#6b2c3e]',
  'bg-[#4a7c59]',
  'bg-[#1a1a1a]',
  'bg-cream',
];

function pickBg(index: number): string {
  return BG_CLASSES[index % BG_CLASSES.length];
}

export function mapDbProductToCatalog(
  product: ProductWithRelations,
  category: Category | undefined,
  index = 0
): CatalogProduct {
  const image = product.product_images?.[0];
  const price = Number(product.price_bdt);
  const ext = product as ProductWithRelations & {
    compare_at_price_bdt?: number | null;
    title_bn?: string | null;
    short_description?: string | null;
  };

  const categorySlug = (category?.slug ?? 'panjabi') as CategorySlug;

  return {
    id: product.id,
    slug: product.slug,
    title: ext.title_bn || product.title,
    price,
    compareAtPrice: ext.compare_at_price_bdt
      ? Number(ext.compare_at_price_bdt)
      : undefined,
    categorySlug,
    categoryName: category?.name ?? categorySlug,
    bgClass: image?.url ? 'bg-cream' : pickBg(index),
    href: `/products/${product.slug}`,
    layout: index % 2 === 1 ? 'tall' : 'normal',
    imageHint: ext.short_description ?? product.title,
    isNew: Boolean(
      product.published_at &&
        Date.now() - new Date(product.published_at).getTime() < 86400000 * 14
    ),
    colors: [],
    sizes: product.product_variants?.map((v) => v.size ?? 'M').filter(Boolean) ?? [
      'M',
    ],
    rating: 4.5,
    reviewCount: 0,
    aspectRatio: '3/4',
    description: product.description ?? '',
    materialCare: product.care_instructions ?? '',
    deliveryInfo: '',
    returnPolicy: '',
    images: (product.product_images ?? []).map((img, i) => ({
      id: img.id,
      bgClass: img.url ? 'bg-cream' : pickBg(i),
    })),
    popularScore: 50 + index,
    createdAt: new Date(product.created_at).getTime(),
    productType: (product.product_type ?? 'simple') as ProductType,
    designGroupId: product.design_group_id ?? undefined,
    designGroupName: product.design_group_name ?? undefined,
    ageGroup: product.age_group ?? undefined,
  };
}

export function mapDesignGroupToCatalogListing(
  members: ProductWithRelations[],
  category: Category | undefined,
  index = 0
): CatalogProduct {
  const sorted = [...members].sort((a, b) => a.display_order - b.display_order);
  const anchor =
    sorted.find((m) => m.product_type === 'men_panjabi') ?? sorted[0];
  const base = mapDbProductToCatalog(anchor, category, index);
  const prices = sorted.map((m) => Number(m.price_bdt));
  const types = [...new Set(sorted.map((m) => m.product_type as ProductType))];

  return {
    ...base,
    title: anchor.design_group_name ?? base.title,
    designGroupId: anchor.design_group_id ?? anchor.id,
    designGroupName: anchor.design_group_name ?? anchor.title,
    designGroupMembers: sorted.map((m, i) => mapDbProductToCatalog(m, category, i)),
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
    price: Math.min(...prices),
    availableTypes: types,
    href: `/products/${anchor.slug}`,
  };
}
