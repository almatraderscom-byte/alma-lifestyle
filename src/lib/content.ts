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
  slug?: string;
  title: string;
  price: number;
  bgClass: string;
  href: string;
};

export const FEATURED_PRODUCTS: FeaturedProduct[] = [
  {
    id: '1',
    slug: 'royal-navy-panjabi',
    title: 'রয়্যাল নেভি পাঞ্জাবি',
    price: 2550,
    bgClass: 'bg-[#2c3e5c]',
    href: '/products/royal-navy-panjabi',
  },
  {
    id: '2',
    slug: 'classic-white-panjabi',
    title: 'ক্লাসিক সাদা পাঞ্জাবি',
    price: 1850,
    bgClass: 'bg-[#e8e4df]',
    href: '/products/classic-white-panjabi',
  },
  {
    id: '3',
    slug: 'premium-cotton-panjabi',
    title: 'প্রিমিয়াম কটন পাঞ্জাবি',
    price: 2150,
    bgClass: 'bg-[#8b7355]',
    href: '/products/premium-cotton-panjabi',
  },
  {
    id: '4',
    slug: 'wireless-earbuds-pro',
    title: 'ওয়্যারলেস ইয়ারবাড প্রো',
    price: 3500,
    bgClass: 'bg-[#4a4a4a]',
    href: '/products/wireless-earbuds-pro',
  },
  {
    id: '5',
    slug: 'leather-wallet',
    title: 'লেদার ওয়ালেট',
    price: 950,
    bgClass: 'bg-[#6b4f3a]',
    href: '/products/leather-wallet',
  },
  {
    id: '6',
    slug: 'smart-watch-elite',
    title: 'স্মার্ট ওয়াচ এলিট',
    price: 4200,
    bgClass: 'bg-[#1a1a1a]',
    href: '/products/smart-watch-elite',
  },
  {
    id: '7',
    slug: 'handmade-jute-bag',
    title: 'হ্যান্ডমেড জুট ব্যাগ',
    price: 750,
    bgClass: 'bg-[#c4a574]',
    href: '/products/handmade-jute-bag',
  },
  {
    id: '8',
    slug: 'ceramic-flower-vase',
    title: 'সিরামিক ফ্লাওয়ার ভাস',
    price: 1200,
    bgClass: 'bg-[#9cb5a0]',
    href: '/products/ceramic-flower-vase',
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

export const BREADCRUMB = {
  home: 'হোম',
  allProducts: 'সব পণ্য',
} as const;

export const PRODUCTS_PAGE = {
  titleAll: 'সব পণ্য',
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
