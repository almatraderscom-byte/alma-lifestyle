import { isDatabaseUuid } from '@/lib/admin-ids';
import type { ProductType } from '@/lib/product-design-types';
import { DISPLAY_ORDER_BY_TYPE } from '@/lib/product-design-types';
import type { AdminProduct, AdminCategory, AdminCollection, AdminOrder, OrderStatus } from '@/lib/admin-store';
import type {
  Category,
  Collection,
  Order,
  OrderItem,
  Product,
  ProductImage,
  ProductVariant,
  ProductWithRelations,
} from '@/server/db/schema';
import type { HomepageConfig } from '@/lib/homepage-config-types';
import type { AppSettings } from '@/lib/admin-settings-types';
import { getDefaultAppSettings } from '@/lib/admin-settings-types';

const DEFAULT_USD_RATE = 110;
const DEFAULT_AED_RATE = 30;

function bdtToUsd(bdt: number, rate = DEFAULT_USD_RATE): number {
  return Math.round((bdt / rate) * 100) / 100;
}

function bdtToAed(bdt: number, rate = DEFAULT_AED_RATE): number {
  return Math.round((bdt / rate) * 100) / 100;
}

export function mapDbProductToAdmin(
  row: ProductWithRelations,
  collectionIds: string[] = []
): AdminProduct {
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const variants = row.product_variants ?? [];
  const hasVariants = variants.length > 0;
  const ext = row as Product & {
    title_bn?: string | null;
    short_description?: string | null;
    compare_at_price_bdt?: number | null;
    tags?: string[] | null;
  };

  const id = row.id;
  if (!id || !isDatabaseUuid(id)) {
    console.error('[mapDbProductToAdmin] Invalid product id from database:', id, row.sku);
  }

  return {
    id,
    title: row.title,
    banglaTitle: ext.title_bn ?? undefined,
    tags: ext.tags ?? undefined,
    slug: row.slug,
    shortDescription: ext.short_description ?? row.description?.slice(0, 200) ?? '',
    description: row.description ?? '',
    priceBdt: Number(row.price_bdt),
    compareAtPriceBdt: ext.compare_at_price_bdt
      ? Number(ext.compare_at_price_bdt)
      : undefined,
    costPriceBdt: row.cost_usd ? Number(row.cost_usd) : undefined,
    categoryId: row.category_id,
    status: row.published ? 'published' : 'draft',
    hasVariants,
    stock: hasVariants
      ? undefined
      : variants[0]?.stock_quantity ?? 0,
    variants: hasVariants
      ? variants.map((v) => ({
          id: v.id,
          size: v.size ?? 'M',
          color: v.color ?? 'Default',
          stock: v.stock_quantity,
          sku: v.sku,
        }))
      : undefined,
    images: (() => {
      const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
      const featuredRow =
        sorted.find((img) => img.alt_text !== 'family-group') ?? sorted[0];
      return sorted.map((img) => {
        const alt = img.alt_text ?? '';
        return {
          id: img.id,
          url: img.url,
          isFeatured: featuredRow ? img.id === featuredRow.id : false,
          sortOrder: img.sort_order,
          imageRole: alt === 'family-group' ? 'family-group' : 'member',
        };
      });
    })(),
    collectionIds,
    fabric: row.fabric ?? undefined,
    careInstructions: row.care_instructions ?? undefined,
    weightKg: row.weight_kg ? Number(row.weight_kg) : undefined,
    originCountry: row.origin_country ?? undefined,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    seoKeywords: row.seo_keywords ?? undefined,
    sku: row.sku,
    productType: (row.product_type ?? 'simple') as ProductType,
    designGroupId: row.design_group_id ?? undefined,
    designGroupName: row.design_group_name ?? undefined,
    ageGroup: row.age_group ?? undefined,
    displayOrder: row.display_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface AdminProductWriteInput {
  product: AdminProduct;
  brandId: string;
  usdRate?: number;
  aedRate?: number;
}

export function mapAdminProductToDbInsert({
  product,
  brandId,
  usdRate = DEFAULT_USD_RATE,
  aedRate = DEFAULT_AED_RATE,
}: AdminProductWriteInput): {
  productRow: Omit<Product, 'id' | 'created_at' | 'updated_at'> & {
    title_bn?: string | null;
    short_description?: string | null;
    compare_at_price_bdt?: number | null;
    tags?: string[] | null;
  };
  variants: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>[];
  images: Omit<ProductImage, 'id' | 'created_at'>[];
} {
  const published = product.status === 'published';
  const productRow = {
    brand_id: brandId,
    category_id: product.categoryId,
    sku: product.sku || `SKU-${product.slug.slice(0, 12).toUpperCase()}`,
    slug: product.slug,
    title: product.title,
    title_bn: product.banglaTitle ?? null,
    short_description: product.shortDescription || null,
    compare_at_price_bdt: product.compareAtPriceBdt ?? null,
    tags: product.tags ?? [],
    description: product.description,
    price_usd: bdtToUsd(product.priceBdt, usdRate),
    price_aed: bdtToAed(product.priceBdt, aedRate),
    price_bdt: product.priceBdt,
    cost_usd: product.costPriceBdt ?? null,
    weight_kg: product.weightKg ?? null,
    fabric: product.fabric ?? null,
    care_instructions: product.careInstructions ?? null,
    origin_country: product.originCountry ?? 'BD',
    published,
    published_at: published ? new Date().toISOString() : null,
    seo_title: product.seoTitle ?? null,
    seo_description: product.seoDescription ?? null,
    seo_keywords: product.seoKeywords ?? null,
    import_source_url: null,
    import_source_name: null,
    imported_at: null,
    deleted_at: null,
    product_type: product.productType ?? 'simple',
    design_group_id: product.designGroupId ?? null,
    design_group_name: product.designGroupName ?? null,
    age_group: product.ageGroup ?? null,
    display_order:
      product.displayOrder ?? DISPLAY_ORDER_BY_TYPE[product.productType ?? 'simple'],
  };

  const variants =
    product.hasVariants && product.variants?.length
      ? product.variants.map((v) => ({
          product_id: product.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          stock_quantity: v.stock,
          reserved_quantity: 0,
          sku_variant: v.sku,
          display_name: `${v.size} / ${v.color}`,
        }))
      : [
          {
            product_id: product.id,
            sku: product.sku,
            size: 'One Size',
            color: 'Default',
            stock_quantity: product.stock ?? 0,
            reserved_quantity: 0,
            sku_variant: null,
            display_name: 'Default',
          },
        ];

  const images = product.images.map((img, i) => ({
    product_id: product.id,
    variant_id: null,
    url: img.url,
    alt_text:
      img.imageRole === 'family-group'
        ? 'family-group'
        : product.title,
    sort_order: img.sortOrder ?? i,
  }));

  return { productRow, variants, images };
}

export function mapDbCategoryToAdmin(row: Category): AdminCategory {
  const ext = row as Category & { show_in_menu?: boolean };
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    displayOrder: row.display_order,
    active: row.active,
    showInMenu: ext.show_in_menu ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDbCollectionToAdmin(
  row: Collection,
  productIds: string[]
): AdminCollection {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    productIds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const ORDER_STATUS_TO_ADMIN: Record<string, OrderStatus> = {
  pending_payment: 'pending',
  confirmed: 'processing',
  processing: 'processing',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

const ORDER_STATUS_TO_DB: Record<OrderStatus, string> = {
  pending: 'pending_payment',
  processing: 'confirmed',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

export function mapDbOrderToAdmin(row: Order, itemsCount: number): AdminOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email ?? undefined,
    customerPhone: row.customer_phone,
    totalBdt: Math.round(Number(row.total_usd) * DEFAULT_USD_RATE),
    status: ORDER_STATUS_TO_ADMIN[row.status] ?? 'pending',
    itemsCount,
    city: row.shipping_city ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAdminOrderStatusToDb(status: OrderStatus): string {
  return ORDER_STATUS_TO_DB[status] ?? 'pending_payment';
}

export type { HomepageConfig, AppSettings };

export function parseHomepageConfig(value: unknown): HomepageConfig | null {
  if (!value || typeof value !== 'object') return null;
  return value as HomepageConfig;
}

export function parseAppSettings(value: unknown): AppSettings {
  if (!value || typeof value !== 'object') return getDefaultAppSettings();
  return { ...getDefaultAppSettings(), ...(value as AppSettings) };
}

export interface CreateOrderPayload {
  customerId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  shippingCity: string;
  paymentMethod: string;
  currency?: string;
  items: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
    unitPriceBdt: number;
    productTitle: string;
    productSku: string;
    variantSize?: string | null;
    variantColor?: string | null;
  }>;
  subtotalBdt: number;
  shippingCostBdt: number;
  totalBdt: number;
}

export function mapCreateOrderToDb(
  brandId: string,
  orderNumber: string,
  payload: CreateOrderPayload
): {
  order: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
  items: Omit<OrderItem, 'id' | 'created_at'>[];
} {
  const subtotalUsd = bdtToUsd(payload.subtotalBdt);
  const shippingUsd = bdtToUsd(payload.shippingCostBdt);
  const totalUsd = bdtToUsd(payload.totalBdt);

  const order = {
    brand_id: brandId,
    order_number: orderNumber,
    customer_id: payload.customerId ?? null,
    customer_name: payload.customerName,
    customer_email: payload.customerEmail ?? null,
    customer_phone: payload.customerPhone,
    shipping_address: payload.shippingAddress,
    shipping_city: payload.shippingCity,
    shipping_country: 'BD',
    shipping_postal_code: null,
    subtotal_usd: subtotalUsd,
    shipping_cost_usd: shippingUsd,
    tax_usd: 0,
    discount_usd: 0,
    total_usd: totalUsd,
    status: 'pending_payment',
    payment_method: payload.paymentMethod,
    notes: null,
    tracking_number: null,
    carrier: null,
    currency: payload.currency ?? 'BDT',
    shipped_at: null,
    delivered_at: null,
  };

  const items = payload.items.map((item) => ({
    order_id: '',
    product_id: item.productId,
    variant_id: item.variantId ?? null,
    product_sku: item.productSku,
    product_title: item.productTitle,
    variant_size: item.variantSize ?? null,
    variant_color: item.variantColor ?? null,
    unit_price_usd: bdtToUsd(item.unitPriceBdt),
    quantity: item.quantity,
    discount_usd: 0,
    total_usd: bdtToUsd(item.unitPriceBdt * item.quantity),
  }));

  return { order, items };
}
