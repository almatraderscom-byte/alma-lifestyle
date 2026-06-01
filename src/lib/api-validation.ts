import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(20),
});

export const ProductsListQuerySchema = PaginationQuerySchema.extend({
  category: z.string().uuid().optional(),
  published: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  search: z.string().max(200).optional(),
  sort: z.enum(['date', 'title', 'price', 'stock']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
  designGroup: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

export const AdminProductImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  isFeatured: z.boolean(),
  sortOrder: z.number(),
});

export const AdminProductVariantSchema = z.object({
  id: z.string(),
  size: z.string(),
  color: z.string(),
  colorHex: z.string().optional(),
  stock: z.number().int().min(0),
  sku: z.string(),
});

export const AdminProductBodySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  banglaTitle: z.string().optional(),
  tags: z.array(z.string()).optional(),
  slug: z.string().min(1),
  shortDescription: z.string(),
  description: z.string(),
  priceBdt: z.number().min(0),
  compareAtPriceBdt: z.number().optional(),
  costPriceBdt: z.number().optional(),
  categoryId: z.string().uuid(),
  status: z.enum(['draft', 'published']),
  hasVariants: z.boolean(),
  stock: z.number().optional(),
  variants: z.array(AdminProductVariantSchema).optional(),
  images: z.array(AdminProductImageSchema),
  collectionIds: z.array(z.string().uuid()),
  fabric: z.string().optional(),
  careInstructions: z.string().optional(),
  weightKg: z.number().optional(),
  originCountry: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  sku: z.string(),
  productType: z
    .enum([
      'simple',
      'men_panjabi',
      'boy_panjabi',
      'women_three_piece',
      'girl_two_piece',
    ])
    .optional()
    .default('simple'),
  designGroupId: z.string().uuid().optional().nullable(),
  designGroupName: z.string().optional().nullable(),
  ageGroup: z.string().optional().nullable(),
  displayOrder: z.number().int().optional(),
});

export const CategoryBodySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image_url: z.string().optional(),
  display_order: z.number().int().optional(),
  active: z.boolean().optional(),
  show_in_menu: z.boolean().optional(),
});

export const CollectionBodySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  hero_image_url: z.string().optional(),
  sort_order: z.number().optional(),
  published: z.boolean().optional(),
  productIds: z.array(z.string().uuid()).optional(),
});

export const CreateOrderBodySchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  customerName: z.string().min(2),
  customerPhone: z.string().min(6),
  customerEmail: z
    .union([z.string().email(), z.literal('')])
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  shippingAddress: z.string().min(3),
  shippingCity: z.string().min(1),
  paymentMethod: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().uuid().optional(),
        productSlug: z.string().optional(),
        variantId: z.string().uuid().nullable().optional(),
        quantity: z.number().int().positive(),
        unitPriceBdt: z.number().min(0),
        productTitle: z.string(),
        productSku: z.string(),
        variantSize: z.string().nullable().optional(),
        variantColor: z.string().nullable().optional(),
      })
    )
    .min(1),
  subtotalBdt: z.number().min(0),
  shippingCostBdt: z.number().min(0),
  totalBdt: z.number().min(0),
});

export const OrderStatusPatchSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});
