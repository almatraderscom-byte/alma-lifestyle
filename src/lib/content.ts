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

/** Editorial split hero — Section 1 */
export const EDITORIAL_HERO = {
  caption: 'নতুন কালেকশন · ২০২৬',
  title: 'ঐতিহ্যের নতুন রূপ',
  subtitle: 'হাতে বোনা প্রতিটি সুতায়, লুকিয়ে আছে বাংলার গল্প',
  ctaPrimary: 'কালেকশন দেখুন',
  ctaPrimaryHref: '/collections',
  ctaSecondary: 'গল্পটা জানুন →',
  ctaSecondaryHref: '/products',
  imageHint: 'Image: Editorial hero — model in maroon panjabi, soft natural light, full body',
  badges: ['১০,০০০+ ক্রেতা', '৪.৮ ★', '৬৪ জেলা', '৩ দিনে ডেলিভারি'] as const,
} as const;

/** Story marquee — Section 2 */
export const STORY_MARQUEE = {
  text: 'হাতে তৈরি · বাংলাদেশের গর্ব · প্রিমিয়াম মানের · ১০০% অরিজিনাল · ক্যাশ অন ডেলিভারি · ',
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
  ],
} as const;

/** Featured products — Section 4 */
export const FEATURED_SECTION = {
  label: 'নতুন এসেছে — মে ২০২৬',
  title: 'এই সপ্তাহের পছন্দ',
  viewAll: 'সব দেখুন →',
  viewAllHref: '/products',
  addToBag: 'ব্যাগে যোগ করুন',
  newBadge: 'নতুন',
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
    title: 'হ্যান্ডমেড জুট ব্যাগ',
    price: 750,
    bgClass: 'bg-[#c4a574]',
    href: '/products/handmade-jute-bag',
    imageHint: 'Image: Handmade jute bag lifestyle',
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
  title: 'প্রতিটি পাঞ্জাবি, একটি যাত্রা',
  body: 'ALMA তৈরি হয় বাংলাদেশের ৭০+ পরিবারের তাঁতিদের হাতে। আমরা শুধু পোশাক বিক্রি করি না — আমরা ঐতিহ্য বহন করি, কারিগরদের জীবিকা নিশ্চিত করি।',
  cta: 'আমাদের সম্পর্কে জানুন →',
  ctaHref: '/products',
  imageCaption: 'তাঁতিদের সাথে — সিরাজগঞ্জ',
  imageHint: 'Image: Weavers at loom — Sirajganj, warm documentary style',
} as const;

/** Reviews — Section 6 */
export const REVIEWS_SECTION = {
  title: 'ক্রেতাদের কথা',
  verified: 'Verified Purchase',
  items: [
    {
      id: '1',
      text: 'অসাধারণ মানের পাঞ্জাবি! কাপড় খুব আরামদায়ক, সেলাই perfect। ঈদে পরেছি, সবাই প্রশংসা করেছে।',
      name: 'রফিকুল ইসলাম',
      city: 'ঢাকা',
    },
    {
      id: '2',
      text: 'অনলাইনে অর্ডার করেছিলাম, ৩ দিনেই পেয়েছি। প্যাকেজিং খুব সুন্দর, পণ্য একদম ছবির মতো।',
      name: 'ফাতেমা বেগম',
      city: 'চট্টগ্রাম',
    },
    {
      id: '3',
      text: 'সিলেটের জন্য ডেলিভারি একটু দেরি হয়েছিল কিন্তু মান দেখে মন খুশি। আবার অর্ডার করবো ইনশাআল্লাহ।',
      name: 'কামরুল হাসান',
      city: 'সিলেট',
    },
    {
      id: '4',
      text: 'রাজশাহীতে এমন প্রিমিয়াম শপ খুব কম। ক্যাশ অন ডেলিভারি সুবিধা পেয়ে ভালো লাগলো।',
      name: 'নাসির উদ্দিন',
      city: 'রাজশাহী',
    },
    {
      id: '5',
      text: 'কুমিল্লা থেকে অর্ডার — সাইজ ঠিক ছিল, রিটার্নের দরকার পড়েনি। দাম অনুযায়ী মান ভালো।',
      name: 'সালমা আক্তার',
      city: 'কুমিল্লা',
    },
    {
      id: '6',
      text: 'খুলনায় পাঞ্জাবি পাওয়া কঠিন, ALMA দিয়ে সহজ হয়েছে। হোয়াটসঅ্যাপে সাপোর্টও দ্রুত।',
      name: 'আব্দুল করিম',
      city: 'খুলনা',
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
  href: '/collections',
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
    { id: '3', bg: 'bg-mustard', hint: 'Image: Weaver workshop' },
    { id: '4', bg: 'bg-emerald', hint: 'Image: Home decor styling' },
    { id: '5', bg: 'bg-cream', hint: 'Image: Eid family portrait' },
    { id: '6', bg: 'bg-charcoal', hint: 'Image: Product detail macro' },
  ],
} as const;

/** Trust strip — Section 9 */
export const TRUST_STRIP = [
  {
    icon: '🚚',
    title: 'ফ্রি ডেলিভারি',
    text: '১৫০০ টাকার বেশি অর্ডারে',
  },
  {
    icon: '💵',
    title: 'ক্যাশ অন ডেলিভারি',
    text: 'সারা দেশে',
  },
  {
    icon: '🔄',
    title: '৭ দিনের রিটার্ন',
    text: 'কোনো প্রশ্ন ছাড়াই',
  },
  {
    icon: '📞',
    title: '২৪/৭ সাপোর্ট',
    text: '০১XXXXXXXXX',
  },
] as const;

export const WHATSAPP = {
  label: 'আমাদের মেসেজ করুন',
} as const;

export const FOOTER = {
  quickLinksTitle: 'দ্রুত লিংক',
  quickLinks: [
    { label: 'সব পণ্য', href: '/products' },
    { label: 'শপিং ব্যাগ', href: '/cart' },
    { label: 'নতুন এসেছে', href: '/products?sort=newest' },
    { label: 'বেস্ট সেলার', href: '/collections' },
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

export const BREADCRUMB = {
  home: 'হোম',
  allProducts: 'সব পণ্য',
} as const;

export const PRODUCTS_PAGE = {
  titleAll: 'সব পণ্য',
  filterMatchingSet: 'ম্যাচিং সেট',
  filterSingleProduct: 'একক পণ্য',
  filterAll: 'সব',
  filter: 'ফিল্টার',
  closeFilter: 'বন্ধ করুন',
  applyFilter: 'ফিল্টার প্রয়োগ করুন',
  resetFilter: 'রিসেট করুন',
  categoriesTitle: 'ক্যাটাগরি',
  priceRangeTitle: 'দামের পরিসীমা',
  colorTitle: 'রঙ',
  sizeTitle: 'সাইজ',
  sortLabel: 'সাজান',
  sortOptions: {
    newest: 'নতুন আগে',
    'price-asc': 'দাম: কম থেকে বেশি',
    'price-desc': 'দাম: বেশি থেকে কম',
    popular: 'জনপ্রিয়তা',
  } as const,
  emptyTitle: 'কোনো পণ্য পাওয়া যায়নি',
  emptySubtitle: 'অন্য ফিল্টার চেষ্টা করুন বা সব পণ্য দেখুন',
  emptyReset: 'ফিল্টার রিসেট করুন',
  prevPage: '← আগের পাতা',
  nextPage: '→ পরের পাতা',
  perPage: 12,
} as const;

export const PDP = {
  selectColor: 'রঙ নির্বাচন করুন',
  selectSize: 'সাইজ নির্বাচন করুন',
  quantity: 'পরিমাণ',
  sizeChart: 'সাইজ চার্ট দেখুন',
  addToBag: 'ব্যাগে যোগ করুন',
  buyNow: 'এখনই কিনুন',
  whatsappOrder: '📱 হোয়াটসঅ্যাপে অর্ডার করুন',
  trust: {
    freeDelivery: 'ফ্রি ডেলিভারি ঢাকার মধ্যে',
    cod: 'ক্যাশ অন ডেলিভারি',
    returns: '৭ দিনের রিটার্ন',
    original: '১০০% অরিজিনাল',
  },
  accordion: {
    description: 'বিবরণ',
    material: 'উপাদান ও যত্ন',
    delivery: 'ডেলিভারি তথ্য',
    returns: 'রিটার্ন পলিসি',
  },
  relatedTitle: 'আপনার জন্য আরও পণ্য',
  recentTitle: 'সাম্প্রতিক দেখা পণ্য',
  toastAdded: 'ব্যাগে যোগ করা হয়েছে!',
} as const;

export const SIZE_CHART = {
  title: 'সাইজ চার্ট',
  close: 'বন্ধ করুন',
  sizeCol: 'সাইজ',
  chest: 'বুক',
  waist: 'কোমর',
  length: 'লম্বা',
  inch: 'ইঞ্চি',
  cm: 'সেমি',
  note: 'মাপ সেন্টিমিটারে নেওয়া হয়েছে। আপনার সাধারণ সাইজ বেছে নিন।',
} as const;

export const CART = {
  breadcrumbCart: 'শপিং ব্যাগ',
  title: 'আপনার শপিং ব্যাগ',
  remove: 'সরিয়ে ফেলুন',
  subtotal: 'সাবটোটাল',
  delivery: 'ডেলিভারি চার্জ',
  deliveryFreeDhaka: 'ঢাকার মধ্যে ফ্রি',
  deliveryOutside: 'ঢাকার বাইরে',
  total: 'মোট',
  couponLabel: 'কুপন কোড',
  couponPlaceholder: 'কুপন কোড লিখুন',
  couponApply: 'প্রয়োগ করুন',
  checkout: 'চেকআউট করুন',
  whatsappOr: 'অথবা হোয়াটসঅ্যাপে অর্ডার করুন',
  whatsappOrder: 'হোয়াটসঅ্যাপে অর্ডার করুন',
  trustBadges: ['ক্যাশ অন ডেলিভারি', 'নিরাপদ পেমেন্ট', '৭ দিনের রিটার্ন'] as const,
  emptyTitle: 'আপনার শপিং ব্যাগ খালি',
  emptyCta: 'কেনাকাটা শুরু করুন',
  emptyHref: '/products',
  recommendationsTitle: 'আপনি এগুলোও পছন্দ করতে পারেন',
  decreaseQty: 'পরিমাণ কমান',
  increaseQty: 'পরিমাণ বাড়ান',
  lineTotal: 'মোট',
} as const;

export const CHECKOUT = {
  breadcrumbCheckout: 'চেকআউট',
  title: 'অর্ডার সম্পন্ন করুন',
  customerSection: 'আপনার তথ্য',
  nameLabel: 'নাম',
  namePlaceholder: 'আপনার পুরো নাম',
  phoneLabel: 'মোবাইল নম্বর',
  phonePlaceholder: '০১XXXXXXXXX',
  emailLabel: 'ইমেইল',
  emailPlaceholder: 'আপনার ইমেইল — না দিলেও হবে',
  addressSection: 'ডেলিভারি ঠিকানা',
  addressLabel: 'এলাকা / ঠিকানা',
  addressPlaceholder: 'বাড়ি নং, রাস্তা, এলাকা',
  cityLabel: 'শহর',
  cityPlaceholder: 'শহর নির্বাচন করুন',
  postcodeLabel: 'পোস্ট কোড',
  postcodePlaceholder: 'পোস্ট কোড (ঐচ্ছিক)',
  noteLabel: 'অর্ডার নোট',
  notePlaceholder: 'বিশেষ কোনো নির্দেশনা থাকলে লিখুন',
  paymentSection: 'পেমেন্ট পদ্ধতি',
  paymentCod: 'ক্যাশ অন ডেলিভারি',
  paymentBkash: 'বিকাশ',
  paymentNagad: 'নগদ',
  paymentInstruction: 'পেমেন্ট করুন: {number} নম্বরে। ট্রানজেকশন আইডি নিচে দিন।',
  transactionIdLabel: 'ট্রানজেকশন আইডি',
  transactionIdPlaceholder: 'ট্রানজেকশন আইডি লিখুন',
  bkashNumber: '০১XXXXXXXXX',
  nagadNumber: '০১XXXXXXXXX',
  orderSummaryTitle: 'অর্ডার সারাংশ',
  subtotal: 'সাবটোটাল',
  delivery: 'ডেলিভারি',
  deliveryFree: 'ফ্রি (ঢাকা)',
  total: 'মোট',
  submit: 'অর্ডার নিশ্চিত করুন',
  terms: 'অর্ডার করার মাধ্যমে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন',
  submitting: 'অর্ডার পাঠানো হচ্ছে...',
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
    address: 'ডেলিভারি ঠিকানা লিখুন',
    city: 'শহর নির্বাচন করুন',
    transactionId: 'ট্রানজেকশন আইডি দিন',
  },
} as const;

export const CONFIRMATION = {
  title: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে! 🎉',
  orderNumberPrefix: 'অর্ডার নম্বর:',
  contactSoon: 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো',
  whatsappTrack: 'হোয়াটসঅ্যাপে অর্ডার ট্র্যাক করুন',
  continueShopping: 'কেনাকাটা চালিয়ে যান',
  goHome: 'হোমপেজে যান',
  summaryTitle: 'অর্ডার সারাংশ',
  subtotal: 'সাবটোটাল',
  delivery: 'ডেলিভারি',
  total: 'মোট',
  emptyRedirect: 'কোনো অর্ডার পাওয়া যায়নি',
} as const;
