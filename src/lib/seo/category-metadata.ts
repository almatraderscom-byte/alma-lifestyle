import type { Metadata } from 'next';
import type { CategorySlug } from '@/lib/products-data';
import { absoluteUrl } from '@/lib/seo/site-url';

export const CATEGORY_META: Record<
  CategorySlug,
  { title: string; description: string }
> = {
  panjabi: {
    title: 'প্রিমিয়াম পাঞ্জাবি কালেকশন',
    description:
      'বাছাই করা প্রিমিয়াম পাঞ্জাবি — ঐতিহ্যবাহী থেকে আধুনিক। ফ্যামিলি ম্যাচিং সেট available. ALMA Lifestyle.',
  },
  islamic: {
    title: 'ইসলামিক প্রোডাক্ট কালেকশন',
    description:
      'প্রিমিয়াম জায়নামাজ, ইসলামিক বই, ও ধর্মীয় পণ্য। ALMA Lifestyle.',
  },
  electronics: {
    title: 'ইলেকট্রনিক্স ও গ্যাজেট',
    description: 'মান যাচাই করা ইলেকট্রনিক্স পণ্য। ALMA Lifestyle.',
  },
  accessories: {
    title: 'এক্সেসরিজ কালেকশন',
    description: 'প্রিমিয়াম বেল্ট, ওয়ালেট ও লাইফস্টাইল এক্সেসরিজ। ALMA Lifestyle.',
  },
  'home-decor': {
    title: 'হোম ও ডেকর',
    description: 'হোম ডেকর ও লাইফস্টাইল পণ্য। ALMA Lifestyle.',
  },
};

export function buildCategoryListingMetadata(
  category: CategorySlug | null
): Metadata {
  if (!category || !(category in CATEGORY_META)) {
    return {
      title: 'সব পণ্য',
      description:
        'ALMA Lifestyle — প্রিমিয়াম পাঞ্জাবি, ফ্যামিলি ম্যাচিং, জায়নামাজ ও আরও অনেক কিছু।',
      alternates: { canonical: '/products' },
    };
  }

  const meta = CATEGORY_META[category];
  const canonical = `/products?category=${category}`;

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: absoluteUrl(canonical),
      type: 'website',
    },
    alternates: { canonical },
  };
}
