import type { ProductType } from '@/lib/product-design-types';
import type { Category, ProductWithRelations } from '@/server/db/schema';

/** Storefront-safe product shape for unauthenticated API consumers. */
export interface PublicApiProduct {
  id: string;
  slug: string;
  title: string;
  priceBdt: number;
  compareAtPriceBdt?: number;
  shortDescription: string;
  description: string;
  categoryId: string;
  categorySlug?: string;
  categoryName?: string;
  productType: ProductType;
  designGroupId?: string;
  designGroupName?: string;
  hasVariants: boolean;
  sizes: string[];
  variants?: Array<{
    id: string;
    size: string;
    color: string;
    stock: number;
  }>;
  images: Array<{
    id: string;
    url: string;
    isFeatured: boolean;
    sortOrder: number;
  }>;
  fabric?: string;
  careInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicApiDesignGroupListItem {
  designGroupId: string;
  designGroupName: string;
  slug: string;
  minPriceBdt: number;
  maxPriceBdt: number;
  types: ProductType[];
  typeLabels: string[];
  members: PublicApiProduct[];
}

export function isProductVisibleOnStorefront(row: ProductWithRelations): boolean {
  const deletedAt = (row as { deleted_at?: string | null }).deleted_at;
  return Boolean(row.published) && !deletedAt;
}

export function mapDbProductToPublic(
  row: ProductWithRelations,
  category?: Pick<Category, 'slug' | 'name'> | null
): PublicApiProduct {
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const variants = row.product_variants ?? [];
  const hasVariants = variants.length > 0;
  const ext = row as ProductWithRelations & {
    title_bn?: string | null;
    short_description?: string | null;
    compare_at_price_bdt?: number | null;
  };

  const featuredRow =
    images.find((img) => img.alt_text !== 'family-group') ?? images[0];

  return {
    id: row.id,
    slug: row.slug,
    title: ext.title_bn || row.title,
    priceBdt: Number(row.price_bdt),
    compareAtPriceBdt: ext.compare_at_price_bdt
      ? Number(ext.compare_at_price_bdt)
      : undefined,
    shortDescription: ext.short_description ?? row.description?.slice(0, 200) ?? '',
    description: row.description ?? '',
    categoryId: row.category_id,
    categorySlug: category?.slug,
    categoryName: category?.name,
    productType: (row.product_type ?? 'simple') as ProductType,
    designGroupId: row.design_group_id ?? undefined,
    designGroupName: row.design_group_name ?? undefined,
    hasVariants,
    sizes: variants.map((v) => v.size ?? 'M').filter(Boolean),
    variants: hasVariants
      ? variants.map((v) => ({
          id: v.id,
          size: v.size ?? 'M',
          color: v.color ?? 'Default',
          stock: v.stock_quantity,
        }))
      : undefined,
    images: images.map((img) => ({
      id: img.id,
      url: img.url,
      isFeatured: featuredRow ? img.id === featuredRow.id : false,
      sortOrder: img.sort_order,
    })),
    fabric: row.fabric ?? undefined,
    careInstructions: row.care_instructions ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
