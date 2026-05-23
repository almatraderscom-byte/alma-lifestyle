/**
 * সমস্ত বাংলা কন্টেন্ট — এক জায়গায় সম্পাদনা করুন
 */

export const SITE = {
  brandName: 'ALMA',
  tagline: 'প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল',
  whatsappNumber: '8801000000000',
  whatsappPrefill:
    'আসসালামু আলাইকুম, আমি ALMA Lifestyle থেকে পণ্য সম্পর্কে জানতে চাই।',
  copyrightYear: '২০২৬',
} as const;

export const NAV = {
  shop: { label: 'দোকান', href: '/products' },
  newArrivals: { label: 'নতুন এসেছে', href: '/products?sort=newest' },
  collections: { label: 'কালেকশন', href: '/collections' },
  about: { label: 'আমাদের সম্পর্কে', href: '/products' },
} as const;

export const MOBILE_NAV_ICONS = {
  search: { label: 'খুঁজুন', href: '/products' },
  wishlist: { label: 'পছন্দ', href: '/products' },
  bag: { label: 'ব্যাগ', href: '/cart' },
} as const;

export const HERO = {
  title: 'প্রতিটি সুতায় আভিজাত্য',
  subtitle: 'প্রিমিয়াম পাঞ্জাবি, ইলেকট্রনিক্স ও লাইফস্টাইল পণ্যের সংগ্রহ',
  ctaShop: 'কেনাকাটা শুরু করুন',
  ctaNew: 'নতুন পণ্য দেখুন',
  shopHref: '/products',
  newHref: '/products?sort=newest',
} as const;

export const CATEGORIES_SECTION = {
  title: 'ক্যাটাগরি অনুযায়ী কিনুন',
  viewLabel: 'দেখুন →',
  items: [
    {
      slug: 'panjabi',
      name: 'পাঞ্জাবি',
      href: '/products?category=panjabi',
      bgClass: 'bg-[#8b7355]',
    },
    {
      slug: 'electronics',
      name: 'ইলেকট্রনিক্স',
      href: '/products?category=electronics',
      bgClass: 'bg-[#5c6570]',
    },
    {
      slug: 'accessories',
      name: 'এক্সেসরিজ',
      href: '/products?category=accessories',
      bgClass: 'bg-[#a68b5b]',
    },
    {
      slug: 'home-decor',
      name: 'হোম ও ডেকর',
      href: '/products?category=home-decor',
      bgClass: 'bg-[#6b8f71]',
    },
  ],
} as const;

export const FEATURED_SECTION = {
  title: 'নতুন এসেছে',
  viewAll: 'সব পণ্য দেখুন →',
  viewAllHref: '/products',
  addToBag: 'ব্যাগে যোগ করুন',
} as const;

export type FeaturedProduct = {
  id: string;
  title: string;
  price: number;
  bgClass: string;
  href: string;
};

export const FEATURED_PRODUCTS: FeaturedProduct[] = [
  {
    id: '1',
    title: 'রয়্যাল নেভি পাঞ্জাবি',
    price: 2550,
    bgClass: 'bg-[#2c3e5c]',
    href: '/products',
  },
  {
    id: '2',
    title: 'ক্লাসিক সাদা পাঞ্জাবি',
    price: 1850,
    bgClass: 'bg-[#e8e4df]',
    href: '/products',
  },
  {
    id: '3',
    title: 'প্রিমিয়াম কটন পাঞ্জাবি',
    price: 2150,
    bgClass: 'bg-[#8b7355]',
    href: '/products',
  },
  {
    id: '4',
    title: 'ওয়্যারলেস ইয়ারবাড প্রো',
    price: 3500,
    bgClass: 'bg-[#4a4a4a]',
    href: '/products',
  },
  {
    id: '5',
    title: 'লেদার ওয়ালেট',
    price: 950,
    bgClass: 'bg-[#6b4f3a]',
    href: '/products',
  },
  {
    id: '6',
    title: 'স্মার্ট ওয়াচ এলিট',
    price: 4200,
    bgClass: 'bg-[#1a1a1a]',
    href: '/products',
  },
  {
    id: '7',
    title: 'হ্যান্ডমেড জুট ব্যাগ',
    price: 750,
    bgClass: 'bg-[#c4a574]',
    href: '/products',
  },
  {
    id: '8',
    title: 'সিরামিক ফ্লাওয়ার ভাস',
    price: 1200,
    bgClass: 'bg-[#9cb5a0]',
    href: '/products',
  },
];

export const TRUST_FEATURES = [
  {
    icon: '🚚',
    title: 'দ্রুত ডেলিভারি',
    text: 'সারা বাংলাদেশে',
  },
  {
    icon: '💯',
    title: 'অরিজিনাল পণ্য',
    text: '১০০% গ্যারান্টি',
  },
  {
    icon: '🔄',
    title: 'সহজ রিটার্ন',
    text: '৭ দিনের মধ্যে',
  },
  {
    icon: '📞',
    title: '২৪/৭ সাপোর্ট',
    text: 'যেকোনো সময়',
  },
] as const;

export const COLLECTION_BANNER = {
  title: 'ঈদ কালেকশন ২০২৬',
  subtitle: 'ঈদের জন্য বিশেষভাবে বাছাই করা পাঞ্জাবি ও লাইফস্টাইল পণ্য',
  cta: 'কালেকশন দেখুন',
  href: '/collections',
} as const;

export const WHATSAPP = {
  label: 'আমাদের মেসেজ করুন',
} as const;

export const FOOTER = {
  quickLinksTitle: 'দ্রুত লিংক',
  quickLinks: [
    { label: 'সব পণ্য', href: '/products' },
    { label: 'নতুন এসেছে', href: '/products?sort=newest' },
    { label: 'বেস্ট সেলার', href: '/collections/best-sellers' },
    { label: 'আমাদের সম্পর্কে', href: '/products' },
  ],
  helpTitle: 'সাহায্য',
  helpLinks: [
    { label: 'যোগাযোগ', href: '/products' },
    { label: 'ডেলিভারি তথ্য', href: '/products' },
    { label: 'রিটার্ন পলিসি', href: '/products' },
    { label: 'সচরাচর জিজ্ঞাসা', href: '/products' },
  ],
  payments: ['bKash', 'Nagad', 'ক্যাশ অন ডেলিভারি'] as const,
  bottomLine: `© ${SITE.copyrightYear} ALMA Lifestyle | 🇧🇩 বাংলাদেশে তৈরি`,
  phoneDisplay: '+৮৮০ ১০০০-০০০০০০',
} as const;
