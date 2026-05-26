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
  display_order: z.number().optional(),
  active: z.boolean().optional(),
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
  customerName: z.string().min(2),
  customerPhone: z.string().min(6),
  customerEmail: z.string().email().optional(),
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

/** Admin login body (SEC-004) — use when POST /api/v1/admin/session exists. */
export const AdminLoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
});

const CategoryColorClassSchema = z.enum(['bg-maroon', 'bg-terracotta', 'bg-emerald', 'bg-mustard']);

const CategoryCardConfigSchema = z.object({
  categorySlug: z.string().min(1),
  displayName: z.string(),
  subtitle: z.string(),
  href: z.string(),
  bgClass: CategoryColorClassSchema,
  imageHint: z.string(),
  imageUrl: z.string(),
});

const HeroSectionDataSchema = z.object({
  caption: z.string(),
  title: z.string(),
  subtitle: z.string(),
  ctaPrimary: z.string(),
  ctaPrimaryHref: z.string(),
  ctaSecondary: z.string(),
  ctaSecondaryHref: z.string(),
  backgroundImageUrl: z.string(),
  imageHint: z.string(),
  badges: z.array(z.string()),
});

const MarqueeSectionDataSchema = z.object({
  text: z.string(),
});

const CategoriesSectionDataSchema = z.object({
  label: z.string(),
  title: z.string(),
  featured: CategoryCardConfigSchema,
  stacked: z.tuple([CategoryCardConfigSchema, CategoryCardConfigSchema, CategoryCardConfigSchema]),
});

const FeaturedSectionDataSchema = z.object({
  label: z.string(),
  title: z.string(),
  viewAllText: z.string(),
  viewAllHref: z.string(),
  source: z.enum(['latest', 'bestsellers', 'manual']),
  manualProductIds: z.array(z.string()),
  productCount: z.union([z.literal(4), z.literal(8), z.literal(12)]),
});

const BrandStorySectionDataSchema = z.object({
  label: z.string(),
  title: z.string(),
  body: z.string(),
  cta: z.string(),
  ctaHref: z.string(),
  imageCaption: z.string(),
  imageHint: z.string(),
  imageUrl: z.string(),
});

const ReviewItemConfigSchema = z.object({
  id: z.string(),
  rating: z.number(),
  text: z.string(),
  name: z.string(),
  city: z.string(),
});

const ReviewsSectionDataSchema = z.object({
  title: z.string(),
  verifiedLabel: z.string(),
  items: z.array(ReviewItemConfigSchema),
});

const CollectionBannerSectionDataSchema = z.object({
  label: z.string(),
  title: z.string(),
  subtitle: z.string(),
  cta: z.string(),
  href: z.string(),
  promo: z.string(),
  bgClass: CategoryColorClassSchema,
  backgroundImageUrl: z.string(),
  imageHint: z.string(),
});

const CommunityTileConfigSchema = z.object({
  id: z.string(),
  bgClass: CategoryColorClassSchema,
  hint: z.string(),
  imageUrl: z.string(),
});

const CommunitySectionDataSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  instagramUrl: z.string(),
  tiles: z.array(CommunityTileConfigSchema),
});

const TrustItemConfigSchema = z.object({
  id: z.string(),
  icon: z.string(),
  title: z.string(),
  text: z.string(),
});

const TrustSectionDataSchema = z.object({
  items: z.array(TrustItemConfigSchema),
});

const HomepageSectionSchema = z.discriminatedUnion('id', [
  z.object({
    id: z.literal('hero'),
    enabled: z.boolean(),
    order: z.number(),
    data: HeroSectionDataSchema,
  }),
  z.object({
    id: z.literal('marquee'),
    enabled: z.boolean(),
    order: z.number(),
    data: MarqueeSectionDataSchema,
  }),
  z.object({
    id: z.literal('categories'),
    enabled: z.boolean(),
    order: z.number(),
    data: CategoriesSectionDataSchema,
  }),
  z.object({
    id: z.literal('featured'),
    enabled: z.boolean(),
    order: z.number(),
    data: FeaturedSectionDataSchema,
  }),
  z.object({
    id: z.literal('brandStory'),
    enabled: z.boolean(),
    order: z.number(),
    data: BrandStorySectionDataSchema,
  }),
  z.object({
    id: z.literal('reviews'),
    enabled: z.boolean(),
    order: z.number(),
    data: ReviewsSectionDataSchema,
  }),
  z.object({
    id: z.literal('collectionBanner'),
    enabled: z.boolean(),
    order: z.number(),
    data: CollectionBannerSectionDataSchema,
  }),
  z.object({
    id: z.literal('community'),
    enabled: z.boolean(),
    order: z.number(),
    data: CommunitySectionDataSchema,
  }),
  z.object({
    id: z.literal('trust'),
    enabled: z.boolean(),
    order: z.number(),
    data: TrustSectionDataSchema,
  }),
]);

/** Strict per-section homepage config (discriminated by section id). */
export const HomepageConfigSchema = z.object({
  sections: z.array(HomepageSectionSchema).min(1),
  lastSaved: z.string(),
});

/** Store settings payload for PUT /api/v1/settings. */
export const AppSettingsSchema = z.object({
  storeName: z.string().min(1),
  tagline: z.string(),
  logoUrl: z.string(),
  faviconUrl: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  whatsappCountryCode: z.string(),
  whatsappNumber: z.string(),
  physicalAddress: z.string(),
  businessHours: z.string(),
  facebookUrl: z.string(),
  instagramUrl: z.string(),
  youtubeUrl: z.string(),
  tiktokUrl: z.string(),
  freeDeliveryThresholdBdt: z.number(),
  defaultDeliveryChargeBdt: z.number(),
  freeDeliveryCities: z.array(z.string()),
  outsideCityDeliveryChargeBdt: z.number(),
  estimatedDeliveryTime: z.string(),
  codEnabled: z.boolean(),
  codInstructions: z.string(),
  bkashEnabled: z.boolean(),
  bkashMerchantNumber: z.string(),
  bkashInstructions: z.string(),
  nagadEnabled: z.boolean(),
  nagadMerchantNumber: z.string(),
  nagadInstructions: z.string(),
  primaryCurrency: z.literal('BDT'),
  usdExchangeRate: z.number(),
  aedExchangeRate: z.number(),
  showMultiCurrency: z.boolean(),
  seoSiteTitleTemplate: z.string(),
  seoSiteDescription: z.string(),
  seoDefaultOgImageUrl: z.string(),
  googleAnalyticsId: z.string(),
  facebookPixelId: z.string(),
  orderConfirmationEmailEnabled: z.boolean(),
  newOrderAdminNotificationEnabled: z.boolean(),
  emailFromName: z.string(),
  emailFromAddress: z.string(),
  lowStockThreshold: z.number().int().min(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).strict();

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join('; ') || 'Validation failed';
}
