export type ProductCategorySlug =
  | 'kurtis'
  | 'sarees'
  | 'dupattas'
  | 'panjabi'
  | 'salwar-kameez';

export interface ShopCategory {
  slug: ProductCategorySlug;
  name: string;
  nameBn: string;
  productCount: number;
}

export interface ShopCollection {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  productCount: number;
}

export interface ShopProduct {
  id: string;
  slug: string;
  title: string;
  /** Category slug from Supabase (e.g. panjabi, electronics). */
  category: string;
  categoryLabel: string;
  collectionSlugs: string[];
  price: number;
  compareAtPrice?: number;
  currency: 'BDT';
  colors: string[];
  sizes: string[];
  imageUrl: string;
  badge?: 'new' | 'bestseller' | 'sale';
  familySlug?: string;
  inStock: boolean;
}

export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc';

export interface ProductFilters {
  category?: string;
  collection?: string;
  sort?: SortOption;
  query?: string;
}
