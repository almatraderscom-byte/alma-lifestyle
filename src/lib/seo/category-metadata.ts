import type { Metadata } from 'next';
import type { CategorySlug } from '@/lib/products-data';
import { absoluteUrl } from '@/lib/seo/site-url';

export const CATEGORY_META: Record<
  CategorySlug,
  { title: string; description: string }
> = {
  panjabi: {
    title: 'ছেলেদের ও বাবা-ছেলের এমব্রয়ডারি পাঞ্জাবি',
    description:
      'কটন ও টেনসিল কটনের এমব্রয়ডারি পাঞ্জাবি — বড়দের ৩৮–৫৪ ও ছেলে শিশুর ১৬–৩৬ সাইজ, একই ডিজাইনে। বাবা-ছেলের সেট একসাথে অর্ডার করুন, সারা দেশে ক্যাশ অন ডেলিভারি।',
  },
  islamic: {
    title: 'জায়নামাজ, ইসলামিক বই ও মুরদা মশারি',
    description:
      'নরম ও নন-স্লিপ জায়নামাজ, ইসলামিক বইয়ের কম্বো, মুরদা মশারি ও অন্যান্য ইসলামিক পণ্য। উপহার দেওয়ার জন্যও উপযোগী। ৬৪ জেলায় ডেলিভারি, ক্যাশ অন ডেলিভারি।',
  },
  electronics: {
    title: 'ইলেকট্রনিক্স ও গ্যাজেট',
    description: 'মান যাচাই করা ইলেকট্রনিক্স পণ্য। ALMA Lifestyle.',
  },
  accessories: {
    title: 'ঘড়ি, ওয়ালেট ও কাপল ওয়াচ — এক্সেসরিজ',
    description:
      'ছেলে ও মেয়েদের ঘড়ি, কাপল ওয়াচ, চামড়ার ওয়ালেট ও হাতে তৈরি পাটের ব্যাগ। নিজের জন্য বা উপহারে। সারা বাংলাদেশে ডেলিভারি, পণ্য হাতে পেয়ে টাকা দেওয়ার সুবিধা।',
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
      title: 'সব পণ্য — পাঞ্জাবি, ফ্যামিলি সেট ও ইসলামিক পণ্য',
      description:
        'পাঞ্জাবি, বাবা-ছেলের ম্যাচিং সেট, জায়নামাজ, ইসলামিক বই, ঘড়ি ও লাইফস্টাইল পণ্য এক জায়গায়। ৬৪ জেলায় ডেলিভারি, পণ্য হাতে পেয়ে টাকা দেওয়ার সুবিধা।',
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
