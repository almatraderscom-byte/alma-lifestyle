/**
 * Storefront copy — mixed Bangla (brand/culture) + English (ecommerce UI).
 * Use `UI` from `./ui-terms` for standard buttons and labels.
 */
import { UI } from './ui-terms';

export const SITE = {
  brandName: 'ALMA',
  tagline: 'প্রিমিয়াম স্টাইল ও মান — চড়া দাম ছাড়াই',
  whatsappNumber: '8801307777733',
  whatsappPrefill:
    'আসসালামু আলাইকুম, আমি ALMA Lifestyle থেকে পণ্য সম্পর্কে জানতে চাই।',
  copyrightYear: '২০২৬',
} as const;

export const NAV = {
  shop: { label: 'দোকান', href: '/products' },
  newArrivals: { label: 'নতুন', href: '/new' },
  islamic: { label: 'ইসলামিক', href: '/products?category=islamic' },
  collections: { label: 'কালেকশন', href: '/products' },
  about: { label: 'আমাদের সম্পর্কে', href: '/about' },
  categoriesLabel: 'Categories',
} as const;

/** Storefront product categories (filters, nav, footer). */
export const CATEGORIES = [
  {
    slug: 'panjabi',
    name: 'পাঞ্জাবি',
    nameEn: 'Panjabi',
    description: 'প্রিমিয়াম পাঞ্জাবি ও ফ্যামিলি সেট',
  },
  {
    slug: 'electronics',
    name: 'ইলেকট্রনিক্স',
    nameEn: 'Electronics',
    description: 'গ্যাজেট ও ইলেকট্রনিক্স',
  },
  {
    slug: 'accessories',
    name: 'এক্সেসরিজ',
    nameEn: 'Accessories',
    description: 'বেল্ট, ওয়ালেট ও আরও',
  },
  {
    slug: 'home-decor',
    name: 'হোম ও ডেকর',
    nameEn: 'Home & Decor',
    description: 'ঘর সাজানোর পণ্য',
  },
  {
    slug: 'islamic',
    name: 'ইসলামিক',
    nameEn: 'Islamic',
    description: 'মসজিদ, ইবাদত ও ইসলামিক প্রয়োজনের পণ্য',
  },
] as const;

export const MOBILE_NAV_ICONS = {
  search: { label: UI.search, href: '/products' },
  wishlist: { label: UI.wishlist, href: '/products' },
  bag: { label: UI.cart, href: '/cart' },
} as const;

/** Editorial split hero — Section 1 */
export const EDITORIAL_HERO = {
  caption: 'নতুন কালেকশন · ২০২৬',
  title: 'আধুনিক পরিবারের প্রিমিয়াম পার্টনার',
  subtitle: 'প্রিমিয়াম মানে আপনার পরিবারের জন্য — এলিগেন্ট স্টাইল, সাশ্রয়ী দামে',
  ctaPrimary: 'View Collection',
  ctaPrimaryHref: '/products',
  ctaSecondary: 'গল্পটা জানুন →',
  ctaSecondaryHref: '/about',
  imageHint: 'Image: Editorial hero — model in maroon panjabi, soft natural light, full body',
  badges: ['১০,০০০+ ক্রেতা', '৪.৮ ★', '৬৪ জেলা', '৩ দিনে ডেলিভারি'] as const,
} as const;

/** Story marquee — Section 2 */
export const STORY_MARQUEE = {
  rowOne: 'প্রিমিয়াম কোয়ালিটি · দ্রুত ডেলিভারি · সাশ্রয়ী দাম · বিশ্বস্ত সেবা · ',
  rowTwo: '৬৪ জেলায় ডেলিভারি · COD সুবিধা · ১০০% অরিজিনাল · ২৪/৭ সাপোর্ট · ',
  /** @deprecated Use rowOne — kept for CMS legacy */
  text: 'প্রিমিয়াম কোয়ালিটি · দ্রুত ডেলিভারি · সাশ্রয়ী দাম · বিশ্বস্ত সেবা · ',
} as const;

/** Category showcase — Section 3 */
export const CATEGORY_SHOWCASE = {
  label: 'ক্যাটাগরি',
  title: 'কী খুঁজছেন আপনি?',
  featured: {
    slug: 'panjabi',
    name: 'পাঞ্জাবি',
    count: '১২০+ ডিজাইন',
    href: '/products?category=panjabi',
    bg: 'bg-maroon',
    imageHint: 'Image: Panjabi collection — layered fabrics, rich maroon tones',
  },
  stacked: [
    {
      slug: 'electronics',
      name: 'ইলেকট্রনিক্স',
      href: '/products?category=electronics',
      bg: 'bg-terracotta',
      imageHint: 'Image: Electronics — earbuds, watch on cream surface',
    },
    {
      slug: 'accessories',
      name: 'এক্সেসরিজ',
      href: '/products?category=accessories',
      bg: 'bg-mustard',
      imageHint: 'Image: Accessories — leather wallet, belt flat lay',
    },
    {
      slug: 'home-decor',
      name: 'হোম ও ডেকর',
      href: '/products?category=home-decor',
      bg: 'bg-emerald',
      imageHint: 'Image: Home decor — ceramic vase, cushions',
    },
    {
      slug: 'islamic',
      name: 'ইসলামিক',
      href: '/products?category=islamic',
      bg: 'bg-emerald',
      imageHint: 'Image: Islamic products — Smart Murda Moshari',
    },
  ],
} as const;

/** Featured products — Section 4 */
export const FEATURED_SECTION = {
  label: 'নতুন এসেছে — মে ২০২৬',
  title: 'এই সপ্তাহের পছন্দ',
  viewAll: 'সব দেখুন →',
  viewAllHref: '/products',
  addToBag: UI.addToCart,
  newBadge: UI.newBadge,
} as const;

export type FeaturedProduct = {
  id: string;
  slug?: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  bgClass: string;
  href: string;
  isNew?: boolean;
  layout?: 'normal' | 'tall';
  imageHint?: string;
};

/** Homepage featured row (4 editorial cards) */
export const HOME_FEATURED_PRODUCTS: FeaturedProduct[] = [
  {
    id: '1',
    slug: 'royal-navy-panjabi',
    title: 'রয়্যাল নেভি পাঞ্জাবি',
    price: 2550,
    compareAtPrice: 3200,
    bgClass: 'bg-[#2c3e5c]',
    href: '/products/royal-navy-panjabi',
    isNew: true,
    layout: 'normal',
    imageHint: 'Image: Royal navy panjabi — close-up embroidery detail',
  },
  {
    id: '2',
    slug: 'premium-cotton-panjabi',
    title: 'প্রিমিয়াম কটন পাঞ্জাবি',
    price: 2150,
    compareAtPrice: 2490,
    bgClass: 'bg-[#8b7355]',
    href: '/products/premium-cotton-panjabi',
    layout: 'tall',
    imageHint: 'Image: Premium cotton panjabi — full length on model',
  },
  {
    id: '3',
    slug: 'silk-premium-panjabi',
    title: 'সিল্ক প্রিমিয়াম পাঞ্জাবি',
    price: 3850,
    compareAtPrice: 4500,
    bgClass: 'bg-[#4a5568]',
    href: '/products/silk-premium-panjabi',
    layout: 'normal',
    imageHint: 'Image: Silk panjabi — fabric texture, folded sleeve',
  },
  {
    id: '4',
    slug: 'classic-white-panjabi',
    title: 'ক্লাসিক সাদা পাঞ্জাবি',
    price: 1850,
    bgClass: 'bg-[#e8e4df]',
    href: '/products/classic-white-panjabi',
    isNew: true,
    layout: 'tall',
    imageHint: 'Image: Classic white panjabi — Eid-ready styling',
  },
];

/** Full catalog cards (cart recommendations, etc.) */
export const FEATURED_PRODUCTS: FeaturedProduct[] = [
  ...HOME_FEATURED_PRODUCTS,
  {
    id: '5',
    slug: 'wireless-earbuds-pro',
    title: 'ওয়্যারলেস ইয়ারবাড প্রো',
    price: 3500,
    bgClass: 'bg-[#4a4a4a]',
    href: '/products/wireless-earbuds-pro',
    imageHint: 'Image: Wireless earbuds product shot',
  },
  {
    id: '6',
    slug: 'leather-wallet',
    title: 'লেদার ওয়ালেট',
    price: 950,
    bgClass: 'bg-[#6b4f3a]',
    href: '/products/leather-wallet',
    imageHint: 'Image: Leather wallet flat lay',
  },
  {
    id: '7',
    slug: 'handmade-jute-bag',
    title: 'প্রিমিয়াম জুট ব্যাগ',
    price: 750,
    bgClass: 'bg-[#c4a574]',
    href: '/products/handmade-jute-bag',
    imageHint: 'Image: Premium jute bag lifestyle',
  },
  {
    id: '8',
    slug: 'ceramic-flower-vase',
    title: 'সিরামিক ফ্লাওয়ার ভাস',
    price: 1200,
    bgClass: 'bg-[#9cb5a0]',
    href: '/products/ceramic-flower-vase',
    imageHint: 'Image: Ceramic vase with flowers',
  },
];

/** Brand story — Section 5 */
export const BRAND_STORY = {
  label: 'আমাদের গল্প',
  title: 'ALMA Lifestyle এর গল্প',
  body: 'ALMA Lifestyle তৈরি হয়েছে এক বিশ্বাস থেকে — সবারই প্রিমিয়াম স্টাইল ও মান পাওয়ার অধিকার আছে, চড়া luxury দাম না দিয়েও।',
  paragraphs: [
    'ALMA Lifestyle তৈরি হয়েছে এক বিশ্বাস থেকে — সবারই প্রিমিয়াম স্টাইল ও মান পাওয়ার অধিকার আছে, চড়া luxury দাম না দিয়েও।',
    'আমরা বাংলাদেশের সেরা manufacturer, factory এবং trusted vendor দের সাথে কাজ করে এনে দিই যত্নে বাছাই করা প্রিমিয়াম পণ্য — পরিবার ম্যাচিং পাঞ্জাবি থেকে শুরু করে latest electronics, accessories এবং home decor।',
    'আমাদের লক্ষ্য একটাই: আপনার আধুনিক জীবনযাত্রায় এনে দেওয়া elegance, comfort এবং quality — সাশ্রয়ী দামে।',
    'আমরা চাই আমাদের পরিবার আপনার পরিবারের মতো একসাথে সাজুক — ঈদ, বিবাহ, বা শুধু একসাথে কাটানো একটি সুন্দর দিনের জন্য।',
  ],
  blockquote: 'প্রিমিয়াম স্টাইল, সাশ্রয়ী দামে',
  cta: 'আমাদের সম্পর্কে জানুন →',
  ctaHref: '/products',
  imageCaption: 'প্রিমিয়াম কাপড় — যাচাইকৃত মান',
  imageCaptions: [
    'প্রিমিয়াম কাপড় — যাচাইকৃত মান',
    'পরিবার ম্যাচিং কালেকশন',
    'ALMA পরিবার — আপনার বিশ্বস্ত পার্টনার',
  ],
  imageHint: 'Image: Premium fabric close-up — verified quality',
} as const;

/** Reviews — Section 6 */
export const REVIEWS_SECTION = {
  title: 'ক্রেতাদের কথা',
  verified: 'যাচাইকৃত ক্রয়',
  items: [
    {
      id: '1',
      title: 'অসাধারণ মান!',
      text: 'আমাদের ঈদের পরিবারিক পাঞ্জাবি কিনেছিলাম ALMA থেকে। কাপড়ের কোয়ালিটি, সেলাই, ফিটিং — সব কিছু অসাধারণ। বাচ্চারা খুব খুশি, আর আমার স্বামীও সবাইকে দেখাচ্ছে। আবার অর্ডার করব!',
      name: 'রহিমা খাতুন',
      city: 'ঢাকা',
      productName: 'ফ্যামিলি ম্যাচিং সেট - রয়্যাল নেভি',
      date: '১৫ মার্চ, ২০২৬',
    },
    {
      id: '2',
      title: 'দ্রুত ডেলিভারি',
      text: 'চট্টগ্রাম থেকে অর্ডার করেছিলাম, ৩ দিনেই পেয়েছি। প্যাকেজিং খুব সুন্দর, পণ্য একদম ছবির মতো। ক্যাশ অন ডেলিভারিতে কোনো ঝামেলা হয়নি।',
      name: 'ফাতেমা বেগম',
      city: 'চট্টগ্রাম',
      productName: 'ক্লাসিক এমব্রয়ডারি পাঞ্জাবি',
      date: '২ মার্চ, ২০২৬',
    },
    {
      id: '3',
      title: 'পরিবার সেট সেরা',
      text: 'বাবা-মা-দুই বাচ্চা — চারজনের জন্য মিলিয়ে অর্ডার। রঙ মিলেছে, সাইজ ঠিক। সিলেটে ডেলিভারি একটু দেরি হয়েছিল কিন্তু মান দেখে মন খুশি।',
      name: 'কামরুল হাসান',
      city: 'সিলেট',
      productName: 'ফ্যামিলি ম্যাচিং - এমারাল্ড',
      date: '২০ ফেব্রুয়ারি, ২০২৬',
    },
    {
      id: '4',
      title: 'রাজশাহীতে ALMA',
      text: 'রাজশাহীতে এমন প্রিমিয়াম শপ খুব কম। কাপড়ের গুণমান স্পর্শ করলেই বোঝা যায় — যত্নে বাছাই করা মান। ক্যাশ অন ডেলিভারি সুবিধা পেয়ে ভালো লাগলো।',
      name: 'নাসির উদ্দিন',
      city: 'রাজশাহী',
      productName: 'প্রিমিয়াম কটন পাঞ্জাবি',
      date: '৮ ফেব্রুয়ারি, ২০২৬',
    },
    {
      id: '5',
      title: 'সাইজ পারফেক্ট',
      text: 'কুমিল্লা থেকে অর্ডার — সাইজ ঠিক ছিল, রিটার্নের দরকার পড়েনি। দাম অনুযায়ী মান ভালো। WhatsApp এ সাপোর্টও দ্রুত ছিল।',
      name: 'সালমা আক্তার',
      city: 'কুমিল্লা',
      productName: 'মহিলা থ্রি-পিস সেট',
      date: '২৫ জানুয়ারি, ২০২৬',
    },
    {
      id: '6',
      title: 'খুলনায় সহজ',
      text: 'খুলনায় ভালো পাঞ্জাবি পাওয়া কঠিন, ALMA দিয়ে সহজ হয়েছে। ছেলের পাঞ্জাবি ফিটিং দারুণ। পরের ঈদেও অর্ডার করব ইনশাআল্লাহ।',
      name: 'আব্দুল করিম',
      city: 'খুলনা',
      productName: 'বয়েজ পাঞ্জাবি সেট',
      date: '১০ জানুয়ারি, ২০২৬',
    },
  ],
} as const;

/** Eid collection banner — Section 7 */
export const COLLECTION_BANNER = {
  label: 'বিশেষ আয়োজন',
  title: 'ঈদ কালেকশন ২০২৬',
  subtitle: 'এই ঈদে নিজেকে সাজান আভিজাত্যে',
  cta: 'কালেকশন দেখুন →',
  promo: 'সীমিত সময়ের জন্য — ২০% ছাড়',
  href: '/products',
  imageHint: 'Image: Eid collection hero — family in festive panjabi, golden hour',
} as const;

/** Community / Instagram — Section 8 */
export const COMMUNITY_SECTION = {
  title: 'আমাদের কমিউনিটি',
  subtitle: '#ALMALifestyle দিয়ে শেয়ার করুন',
  instagramUrl: 'https://www.instagram.com/',
  tiles: [
    { id: '1', bg: 'bg-maroon', hint: 'Image: Customer OOTD — navy panjabi' },
    { id: '2', bg: 'bg-terracotta', hint: 'Image: Flat lay — accessories' },
    { id: '3', bg: 'bg-mustard', hint: 'Image: Premium lifestyle collection flat lay' },
    { id: '4', bg: 'bg-emerald', hint: 'Image: Home decor styling' },
    { id: '5', bg: 'bg-cream', hint: 'Image: Eid family portrait' },
    { id: '6', bg: 'bg-charcoal', hint: 'Image: Product detail macro' },
  ],
} as const;

/** Trust strip — Section 9 */
export const TRUST_STRIP = [
  {
    icon: '🛡️',
    title: '১০০% অরিজিনাল',
    text: 'যাচাইকৃত পণ্য',
  },
  {
    icon: '🚚',
    title: '৬৪ জেলায় ডেলিভারি',
    text: '৩–৫ কার্যদিবসে',
  },
  {
    icon: '💳',
    title: 'COD সুবিধা',
    text: 'ক্যাশ অন ডেলিভারি',
  },
  {
    icon: '⭐',
    title: '৪.৮ রেটিং',
    text: '১০,০০০+ ক্রেতা',
  },
] as const;

export const WHATSAPP = {
  label: 'আমাদের মেসেজ করুন',
} as const;

export const FOOTER = {
  shopTitle: 'দোকান',
  shopLinks: [
    { label: 'সব পণ্য', href: '/products' },
    { label: 'পাঞ্জাবি', href: '/products?category=panjabi' },
    { label: 'ইলেকট্রনিক্স', href: '/products?category=electronics' },
    { label: 'এক্সেসরিজ', href: '/products?category=accessories' },
    { label: 'হোম ও ডেকর', href: '/products?category=home-decor' },
    { label: 'ইসলামিক', href: '/products?category=islamic' },
  ],
  helpTitle: 'সাহায্য',
  helpLinks: [
    { label: UI.trackOrder, href: '/track' },
    { label: 'ডেলিভারি', href: '/delivery' },
    { label: 'ফেরত নীতি', href: '/refund' },
    { label: 'সাইজ গাইড', href: '/size-guide' },
    { label: 'FAQ', href: '/faq' },
  ],
  companyTitle: 'কোম্পানি',
  companyLinks: [
    { label: 'আমাদের সম্পর্কে', href: '/about' },
    { label: 'যোগাযোগ', href: '/contact' },
    { label: 'শর্তাবলী', href: '/terms' },
    { label: 'গোপনীয়তা', href: '/privacy' },
  ],
  payments: ['bKash', 'Nagad', UI.cashOnDelivery] as const,
  bottomLine: `© ${SITE.copyrightYear} ALMA Lifestyle | প্রিমিয়াম লাইফস্টাইল পণ্যের বিশ্বস্ত ঠিকানা`,
  phoneDisplay: '+৮৮০ ১০০০-০০০০০০',
} as const;

export const BREADCRUMB = {
  home: UI.home,
  allProducts: 'সব পণ্য',
} as const;

export const PRODUCTS_PAGE = {
  titleAll: 'সব পণ্য',
  filterMatchingSet: 'ম্যাচিং সেট',
  filterSingleProduct: 'একক পণ্য',
  filterAll: 'সব',
  filter: UI.filter,
  closeFilter: UI.close,
  applyFilter: UI.apply,
  resetFilter: UI.reset,
  categoriesTitle: 'ক্যাটাগরি',
  priceRangeTitle: 'Price',
  colorTitle: UI.color,
  sizeTitle: UI.size,
  sortLabel: UI.sort,
  sortOptions: {
    newest: 'Newest',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    popular: UI.popular,
  } as const,
  emptyTitle: 'কোনো পণ্য পাওয়া যায়নি',
  emptySubtitle: 'অন্য ফিল্টার চেষ্টা করুন বা সব পণ্য দেখুন',
  emptyReset: 'ফিল্টার রিসেট করুন',
  prevPage: '← আগের পাতা',
  nextPage: '→ পরের পাতা',
  perPage: 12,
} as const;

export const PDP = {
  selectColor: UI.color,
  selectSize: UI.size,
  quantity: UI.quantity,
  sizeChart: 'Size Chart',
  addToBag: UI.addToCart,
  buyNow: '⚡ এখনই কিনুন',
  addFullSetToCart: 'Add Full Set to Cart',
  whatsappOrder: '📱 Order on WhatsApp',
  trust: {
    freeDelivery: 'ফ্রি ডেলিভারি ঢাকার মধ্যে',
    cod: 'ক্যাশ অন ডেলিভারি',
    returns: '৭ দিনের রিটার্ন',
    original: '১০০% অরিজিনাল',
  },
  accordion: {
    description: 'বিস্তারিত',
    material: 'উপাদান ও যত্ন',
    delivery: 'ডেলিভারি তথ্য',
    returns: 'Return Policy',
  },
  relatedTitle: 'আপনার জন্য আরও পণ্য',
  recentTitle: 'Recently Viewed',
  toastAdded: 'Added to cart!',
} as const;

export const SIZE_CHART = {
  title: 'Size Chart',
  close: UI.close,
  sizeCol: UI.size,
  chest: 'বুক',
  waist: 'কোমর',
  length: 'লম্বা',
  inch: 'ইঞ্চি',
  cm: 'সেমি',
  note: 'মাপ সেন্টিমিটারে নেওয়া হয়েছে। আপনার সাধারণ সাইজ বেছে নিন।',
} as const;

export const CART = {
  breadcrumbCart: UI.cart,
  title: UI.myCart,
  remove: UI.remove,
  subtotal: UI.subtotal,
  delivery: UI.delivery,
  deliveryFreeDhaka: 'ফ্রি ডেলিভারি',
  deliveryOutside: 'ডেলিভারি',
  deliveryAtCheckout: 'চেকআউটে জেলা অনুযায়ী হিসাব হবে',
  deliveryFrom: 'ঢাকা সিটি থেকে',
  total: UI.total,
  couponLabel: 'Coupon Code',
  couponPlaceholder: 'Enter coupon code',
  couponApply: UI.apply,
  checkout: UI.checkout,
  whatsappOr: 'or order on WhatsApp',
  whatsappOrder: 'Order on WhatsApp',
  trustBadges: [UI.cashOnDelivery, 'Secure Payment', '7-Day Return'] as const,
  emptyTitle: UI.emptyCart,
  emptyCta: UI.continueShopping,
  emptyHref: '/products',
  recommendationsTitle: 'You may also like',
  decreaseQty: 'Decrease quantity',
  increaseQty: 'Increase quantity',
  lineTotal: UI.total,
  stockOut: UI.outOfStock,
  stockOutLine: 'This item is out of stock',
  stockOutCheckout: 'Remove out-of-stock items to checkout',
} as const;

export const CHECKOUT = {
  breadcrumbCheckout: UI.checkout,
  title: UI.checkout,
  customerSection: 'Your details',
  nameLabel: UI.fullName,
  namePlaceholder: 'আপনার পুরো নাম',
  phoneLabel: UI.phoneNumber,
  phonePlaceholder: '01XXXXXXXXX',
  emailLabel: UI.email,
  emailPlaceholder: 'আপনার ইমেইল — না দিলেও হবে',
  addressSection: 'ডেলিভারি তথ্য',
  addressLabel: 'বিস্তারিত ঠিকানা',
  addressPlaceholder: 'বাসা নম্বর, রোড, এলাকা...',
  thanaLabel: 'থানা / উপজেলা',
  thanaPlaceholder: 'যেমন: ধানমন্ডি, গুলশান',
  districtLabel: 'জেলা',
  cityLabel: UI.city,
  cityPlaceholder: 'Select city',
  postcodeLabel: 'Postcode',
  postcodePlaceholder: 'Postcode (optional)',
  noteLabel: UI.orderNotes,
  notePlaceholder: 'বিশেষ কোনো নির্দেশনা থাকলে লিখুন',
  paymentSection: UI.paymentMethod,
  paymentCod: UI.cashOnDelivery,
  paymentBkash: 'bKash',
  paymentNagad: 'Nagad',
  paymentInstruction: 'পেমেন্ট করুন: {number} নম্বরে। ট্রানজেকশন আইডি নিচে দিন।',
  transactionIdLabel: 'ট্রানজেকশন আইডি',
  transactionIdPlaceholder: 'ট্রানজেকশন আইডি লিখুন',
  bkashNumber: '০১XXXXXXXXX',
  nagadNumber: '০১XXXXXXXXX',
  orderSummaryTitle: UI.orderSummary,
  subtotal: UI.subtotal,
  delivery: UI.delivery,
  deliveryFree: 'ফ্রি!',
  deliverySelectDistrict: 'জেলা নির্বাচন করুন',
  freeDeliveryHint: 'আরও পণ্য যোগ করলে ফ্রি ডেলিভারি',
  total: UI.total,
  submit: UI.placeOrder,
  terms: 'By placing an order you agree to our terms',
  submitting: 'Placing order…',
  priceWarning: 'Some items are out of stock. Remove them from cart and try again.',
  stockBlockCheckout: 'Remove out-of-stock items before checkout',
  deliveryChargeOutside: 120,
  cities: [
    { value: 'dhaka', label: 'ঢাকা' },
    { value: 'chattogram', label: 'চট্টগ্রাম' },
    { value: 'sylhet', label: 'সিলেট' },
    { value: 'rajshahi', label: 'রাজশাহী' },
    { value: 'khulna', label: 'খুলনা' },
    { value: 'barishal', label: 'বরিশাল' },
    { value: 'rangpur', label: 'রংপুর' },
    { value: 'mymensingh', label: 'ময়মনসিংহ' },
    { value: 'cumilla', label: 'কুমিল্লা' },
    { value: 'gazipur', label: 'গাজীপুর' },
    { value: 'narayanganj', label: 'নারায়ণগঞ্জ' },
    { value: 'other', label: 'অন্যান্য' },
  ] as const,
  errors: {
    name: 'নাম লিখুন',
    phone: 'সঠিক মোবাইল নম্বর দিন',
    address: 'বিস্তারিত ঠিকানা লিখুন',
    city: 'জেলা নির্বাচন করুন',
    district: 'জেলা নির্বাচন করুন',
    thana: 'থানা / উপজেলা লিখুন',
    transactionId: 'ট্রানজেকশন আইডি দিন',
  },
} as const;

export const CONFIRMATION = {
  title: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে! 🎉',
  orderNumberPrefix: `${UI.orderNumber}:`,
  contactSoon: 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো',
  whatsappTrack: UI.trackOnWhatsApp,
  continueShopping: UI.continueShopping,
  goHome: 'হোমপেজে যান',
  summaryTitle: UI.orderSummary,
  subtotal: UI.subtotal,
  delivery: UI.delivery,
  total: UI.total,
  emptyRedirect: 'কোনো অর্ডার পাওয়া যায়নি',
} as const;

export const TRACK = {
  title: UI.trackOrder,
  orderNumber: UI.orderNumber,
  phone: UI.phoneNumber,
  submit: UI.trackOrder,
  loading: UI.loading,
  searchAnother: 'Track another order',
  notFound: 'Order not found. Check order number and phone.',
  failed: 'Could not track — please try again',
  status: UI.orderStatus,
  tracking: 'Tracking',
  total: UI.total,
} as const;

export const AUTH = {
  loginTitle: UI.login,
  loginButton: UI.login,
  signUpTitle: UI.signUp,
  signUpButton: UI.signUp,
  signUpPrompt: 'New here?',
  signUpLink: 'Create account',
  signUpCreating: 'Creating…',
  hasAccount: 'Already have an account?',
  forgotPassword: UI.forgotPassword,
  resetTitle: 'Reset Password',
  sendResetLink: 'Send reset link',
  resetSent: 'Password reset link sent to your email',
  resetEmailError: 'Could not send email — check the address',
  email: UI.email,
  password: UI.password,
  fullName: UI.fullName,
  mobile: UI.mobile,
  loading: UI.loading,
  trackGuest: `${UI.trackOrder} (Guest)`,
  account: UI.myAccount,
  trackShort: UI.trackOrder,
  backToLogin: `← ${UI.login}`,
  errors: {
    invalidCredentials: 'Invalid email or password',
    systemNotReady: 'Account system is not configured yet',
    signUpFailed: 'Sign up failed — check your email',
    systemUnavailable: 'System unavailable',
  },
} as const;

export const HEADER = {
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  mobileMenu: 'Mobile menu',
  mainNav: 'Main navigation',
} as const;

export const ACCOUNT = {
  title: 'My Orders',
  loading: UI.loading,
  logout: UI.logout,
  trackGuest: AUTH.trackGuest,
  noOrders: 'No orders yet',
  defaultName: 'Customer',
} as const;

export { UI } from './ui-terms';
