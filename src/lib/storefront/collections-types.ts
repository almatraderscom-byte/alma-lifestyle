import type { PublicApiProduct } from '@/lib/mappers/public-product';

export type StorefrontCollectionSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  heroImageUrl: string | null;
  productCount: number;
  updatedAt: string;
};

export type StorefrontCollectionDetail = {
  collection: StorefrontCollectionSummary;
  products: PublicApiProduct[];
};
