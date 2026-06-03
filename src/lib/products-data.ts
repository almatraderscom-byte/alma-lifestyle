import type { FeaturedProduct } from '@/lib/content';
import type { ProductType } from '@/lib/product-design-types';
import { typeLabelsForDesignGroup } from '@/lib/product-design-types';
import { getDefaultProductImage } from '@/lib/default-images';
import { buildListingCardGallery } from '@/lib/product-gallery';

export type CategorySlug =
  | 'panjabi'
  | 'electronics'
  | 'accessories'
  | 'home-decor'
  | 'islamic';

export type CustomProductLayout = 'murda-moshari-landing';

export type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'popular';

export type CatalogProduct = FeaturedProduct & {
  slug: string;
  compareAtPrice?: number;
  categorySlug: CategorySlug;
  categoryName: string;
  colors: { id: string; name: string; hex: string }[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  aspectRatio: '3/4' | '1/1';
  description: string;
  materialCare: string;
  deliveryInfo: string;
  returnPolicy: string;
  images: { id: string; bgClass: string; url?: string; isFamilyGroup?: boolean }[];
  /** For listing card hover / dots */
  galleryImages?: { id: string; bgClass: string; url?: string }[];
  popularScore: number;
  createdAt: number;
  tags?: string[];
  productType?: ProductType;
  designGroupId?: string;
  designGroupName?: string;
  ageGroup?: string;
  /** All members when part of a matching design group */
  designGroupMembers?: CatalogProduct[];
  priceMin?: number;
  priceMax?: number;
  availableTypes?: ProductType[];
  customLayout?: CustomProductLayout;
  sku?: string;
  fabric?: string;
  published?: boolean;
  inStock?: boolean;
};

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  panjabi: 'পাঞ্জাবি',
  electronics: 'ইলেকট্রনিক্স',
  accessories: 'এক্সেসরিজ',
  'home-decor': 'হোম ও ডেকর',
  islamic: 'ইসলামিক',
};

const COLOR_PRESETS = [
  { id: 'white', name: 'সাদা', hex: '#f5f5f5' },
  { id: 'black', name: 'কালো', hex: '#1a1a1a' },
  { id: 'navy', name: 'নেভি', hex: '#2c3e5c' },
  { id: 'maroon', name: 'মেরুন', hex: '#6b2c3e' },
  { id: 'cream', name: 'ক্রিম', hex: '#f5f0eb' },
  { id: 'green', name: 'সবুজ', hex: '#4a7c59' },
] as const;

export const FILTER_COLORS = COLOR_PRESETS;

export const FILTER_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  mk('royal-navy-panjabi', 'রয়্যাল নেভি পাঞ্জাবি', 2550, 3200, 'panjabi', 'bg-[#2c3e5c]', 4.8, 25, ['navy'], 95),
  mk('classic-white-panjabi', 'ক্লাসিক সাদা পাঞ্জাবি', 1850, undefined, 'panjabi', 'bg-[#e8e4df]', 4.6, 18, ['white'], 88),
  mk('premium-cotton-panjabi', 'প্রিমিয়াম কটন পাঞ্জাবি', 2150, 2490, 'panjabi', 'bg-[#8b7355]', 4.7, 32, ['cream', 'navy'], 90),
  mk('silk-premium-panjabi', 'সিল্ক প্রিমিয়াম পাঞ্জাবি', 3850, 4500, 'panjabi', 'bg-[#4a5568]', 4.9, 41, ['maroon', 'navy'], 92),
  mk('maroon-festive-panjabi', 'মেরুন উৎসব পাঞ্জাবি', 2950, undefined, 'panjabi', 'bg-[#6b2c3e]', 4.5, 12, ['maroon'], 75),
  mk('green-casual-panjabi', 'সবুজ ক্যাজুয়াল পাঞ্জাবি', 1990, 2350, 'panjabi', 'bg-[#4a7c59]', 4.4, 9, ['green'], 70),
  mk('bluetooth-speaker-mini', 'ব্লুটুথ স্পিকার মিনি', 1800, 2200, 'electronics', 'bg-[#4a4a4a]', 4.3, 56, [], 80, '1/1'),
  mk('wireless-earbuds-pro', 'ওয়্যারলেস ইয়ারবাড প্রো', 3500, undefined, 'electronics', 'bg-[#1a1a1a]', 4.6, 88, ['black', 'white'], 85, '1/1'),
  mk('smart-watch-elite', 'স্মার্ট ওয়াচ এলিট', 4200, 4800, 'electronics', 'bg-[#2d3748]', 4.7, 64, ['black', 'navy'], 88, '1/1'),
  mk('usb-led-desk-lamp', 'ইউএসবি এলইডি ডেস্ক ল্যাম্প', 1250, undefined, 'electronics', 'bg-[#5c6570]', 4.2, 22, ['white', 'black'], 65, '1/1'),
  mk('leather-belt-classic', 'লেদার বেল্ট ক্লাসিক', 850, 990, 'accessories', 'bg-[#6b4f3a]', 4.5, 14, ['black', 'maroon'], 72),
  mk('leather-wallet', 'লেদার ওয়ালেট', 950, undefined, 'accessories', 'bg-[#5d4e37]', 4.4, 19, ['black', 'maroon'], 68),
  mk('handmade-jute-bag', 'প্রিমিয়াম জুট ব্যাগ', 750, 890, 'accessories', 'bg-[#c4a574]', 4.6, 27, ['cream', 'green'], 74),
  mk('sunglasses-classic', 'সানগ্লাস ক্লাসিক', 1100, 1350, 'accessories', 'bg-[#333]', 4.3, 11, ['black'], 60),
  mk('ceramic-flower-vase', 'সিরামিক ফ্লাওয়ার ভাস', 1200, undefined, 'home-decor', 'bg-[#9cb5a0]', 4.8, 8, ['green', 'cream'], 55, '1/1'),
  mk('cotton-cushion-set', 'কটন কুশন সেট', 1450, 1690, 'home-decor', 'bg-[#d4c4b0]', 4.5, 15, ['cream', 'maroon'], 58, '1/1'),
  {
    id: 'smart-murda-moshari',
    slug: 'smart-murda-moshari',
    title: 'স্মার্ট মুর্দা মশারী',
    price: 1790,
    compareAtPrice: 2260,
    categorySlug: 'islamic',
    categoryName: CATEGORY_LABELS.islamic,
    bgClass: 'bg-charcoal',
    href: '/products/smart-murda-moshari',
    colors: [],
    sizes: [],
    rating: 4.9,
    reviewCount: 0,
    aspectRatio: '1/1',
    description:
      'মুসলমানের শেষ গোসলে পর্দা, পরিচ্ছন্নতা ও সম্মানের জন্য সম্পূর্ণ সমাধান।',
    materialCare: 'টেকসই মেশ ও কাপড়। পরিচ্ছন্ন স্থানে রাখুন।',
    deliveryInfo:
      'ঢাকার ভিতরে ২-৩ কর্মদিবস, ঢাকার বাইরে ৩-৭ কর্মদিবস। ক্যাশ অন ডেলিভারি।',
    returnPolicy:
      '৭ দিনের মধ্যে অব্যবহৃত পণ্য রিটার্ন করা যাবে। পণ্য অবশ্যই মূল অবস্থায় থাকতে হবে।',
    images: [
      {
        id: '1',
        bgClass: 'bg-charcoal',
        url: '/products/murda-moshari/hero-black.jpg',
      },
      {
        id: '2',
        bgClass: 'bg-charcoal',
        url: '/products/murda-moshari/in-use.jpg',
      },
    ],
    popularScore: 90,
    createdAt: Date.now(),
    productType: 'simple',
    customLayout: 'murda-moshari-landing',
    sku: 'ALM-ISL-001',
    fabric: 'টেকসই মেশ ও কাপড়',
    published: true,
    inStock: true,
  },
];

function mk(
  slug: string,
  title: string,
  price: number,
  compareAtPrice: number | undefined,
  categorySlug: CategorySlug,
  bgClass: string,
  rating: number,
  reviewCount: number,
  colorIds: string[],
  popularScore: number,
  aspectRatio: '3/4' | '1/1' = '3/4',
  createdAt = Date.now() - Math.random() * 1e10
): CatalogProduct {
  const colors = COLOR_PRESETS.filter((c) =>
    colorIds.length === 0 ? true : colorIds.includes(c.id)
  ).slice(0, colorIds.length || 3);

  const sizes =
    categorySlug === 'panjabi' || categorySlug === 'accessories'
      ? ['S', 'M', 'L', 'XL', 'XXL']
      : categorySlug === 'electronics' ||
          categorySlug === 'home-decor' ||
          categorySlug === 'islamic'
        ? []
        : ['S', 'M', 'L', 'XL'];

  const defaultImageUrl = getDefaultProductImage(slug, categorySlug);

  const images = [
    { id: '1', bgClass, url: defaultImageUrl },
    { id: '2', bgClass: adjustBg(bgClass, 1), url: defaultImageUrl },
    { id: '3', bgClass, url: defaultImageUrl },
    { id: '4', bgClass: adjustBg(bgClass, 3), url: defaultImageUrl },
  ];

  return {
    id: slug,
    slug,
    title,
    price,
    compareAtPrice,
    categorySlug,
    categoryName: CATEGORY_LABELS[categorySlug],
    bgClass,
    href: `/products/${slug}`,
    colors: colors.length ? colors : [COLOR_PRESETS[2]],
    sizes,
    rating,
    reviewCount,
    aspectRatio,
    description: `${title} — ALMA Lifestyle-এর প্রিমিয়াম মানের পণ্য। উচ্চমানের উপাদান, যত্নে বাছাই ও যাচাইকৃত। বাংলাদেশে দ্রুত ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা।`,
    materialCare:
      'উচ্চমানের কাপড়। হালকা ঠান্ডা পানিতে হাতে ধোয়া বা ড্রাই ক্লিন করুন। সরাসরি রোদে শুকাবেন না।',
    deliveryInfo:
      'ঢাকার ভিতরে ২-৩ কর্মদিবস, ঢাকার বাইরে ৩-৭ কর্মদিবস। ৳৩,০০০ এর উপর ঢাকায় ফ্রি ডেলিভারি।',
    returnPolicy:
      '৭ দিনের মধ্যে অব্যবহৃত পণ্য রিটার্ন করা যাবে। পণ্য অবশ্যই মূল অবস্থায় থাকতে হবে।',
    images,
    popularScore,
    createdAt,
  };
}

function adjustBg(base: string, i: number): string {
  const map: Record<string, string> = {
    'bg-[#2c3e5c]': 'bg-[#1e2a3d]',
    'bg-[#8b7355]': 'bg-[#6d5c44]',
    'bg-[#4a4a4a]': 'bg-[#333]',
    'bg-[#1a1a1a]': 'bg-[#333]',
  };
  return map[base] ?? base;
}

export function getProductBySlug(slug: string): CatalogProduct | undefined {
  return CATALOG_PRODUCTS.find((p) => p.slug === slug);
}

/** Apply static catalog fields (e.g. customLayout) when the live DB row omits them. */
export function mergeStaticProductOverrides(product: CatalogProduct): CatalogProduct {
  const staticProduct = getProductBySlug(product.slug);
  if (!staticProduct) return product;
  return {
    ...product,
    ...(staticProduct.customLayout ? { customLayout: staticProduct.customLayout } : {}),
  };
}

export function getAllProductSlugs(): string[] {
  return CATALOG_PRODUCTS.map((p) => p.slug);
}

export type ListingSetFilter = 'all' | 'matching' | 'single';

export function catalogIsDesignGroupCard(product: CatalogProduct): boolean {
  return Boolean(
    product.designGroupMembers &&
      product.designGroupMembers.length > 1 &&
      product.priceMin != null &&
      product.priceMax != null
  );
}

export function catalogListingTypeLabels(product: CatalogProduct): string[] {
  if (!product.availableTypes?.length) return [];
  return typeLabelsForDesignGroup(product.availableTypes);
}

export interface ProductFilters {
  categories: CategorySlug[];
  priceMin: number;
  priceMax: number;
  colors: string[];
  sizes: string[];
  listingSet: ListingSetFilter;
}

export const DEFAULT_FILTERS: ProductFilters = {
  categories: [],
  priceMin: 0,
  priceMax: 10000,
  colors: [],
  sizes: [],
  listingSet: 'all',
};

export function filterCatalogProducts(
  products: CatalogProduct[],
  filters: ProductFilters
): CatalogProduct[] {
  return products.filter((p) => {
    if (filters.categories.length > 0 && !filters.categories.includes(p.categorySlug)) {
      return false;
    }
    if (p.price < filters.priceMin || p.price > filters.priceMax) {
      return false;
    }
    if (filters.colors.length > 0) {
      const hasColor = p.colors.some((c) => filters.colors.includes(c.id));
      if (!hasColor) return false;
    }
    if (filters.sizes.length > 0 && p.sizes.length > 0) {
      const hasSize = p.sizes.some((s) => filters.sizes.includes(s));
      if (!hasSize) return false;
    }
    if (filters.listingSet === 'matching' && !catalogIsDesignGroupCard(p)) {
      return false;
    }
    if (filters.listingSet === 'single' && catalogIsDesignGroupCard(p)) {
      return false;
    }
    return true;
  });
}

export function sortCatalogProducts(
  products: CatalogProduct[],
  sort: SortKey
): CatalogProduct[] {
  const copy = [...products];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'popular':
      return copy.sort((a, b) => b.popularScore - a.popularScore);
    case 'newest':
    default:
      return copy.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export function paginateProducts<T>(
  items: T[],
  page: number,
  perPage: number
): { items: T[]; total: number; totalPages: number; start: number; end: number } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, total);

  return {
    items: items.slice(startIndex, endIndex),
    total,
    totalPages,
    start: total === 0 ? 0 : startIndex + 1,
    end: endIndex,
  };
}

export function toCardProduct(
  product: CatalogProduct
): FeaturedProduct & {
  isDesignGroup?: boolean;
  priceRange?: { min: number; max: number };
  typeLabels?: string[];
  galleryImages?: { id: string; bgClass: string; url?: string }[];
  aspectRatio?: '3/4' | '1/1';
} {
  const isDesignGroup = catalogIsDesignGroupCard(product);
  return {
    id: product.id,
    title: isDesignGroup
      ? (product.designGroupName ?? product.title)
      : product.title,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    bgClass: product.bgClass,
    href: product.href,
    slug: product.slug,
    isDesignGroup,
    priceRange:
      isDesignGroup && product.priceMin != null && product.priceMax != null
        ? { min: product.priceMin, max: product.priceMax }
        : undefined,
    typeLabels: isDesignGroup ? catalogListingTypeLabels(product) : undefined,
    galleryImages: buildListingCardGallery(product).map(({ id, bgClass, url }) => ({
      id,
      bgClass,
      url,
    })),
    aspectRatio: product.aspectRatio,
  };
}
