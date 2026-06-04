export const CINEMATIC_HERO = {
  videoSrc: '/videos/hero/hero-family-pink-loop.mp4',
  posterSrc: '/videos/hero/hero-poster.jpg',
  overlayBrandMark: 'A',
  overlayTagline: 'ALMA',
  eyebrow: 'EST. 1971 · DHAKA',
  brandName: 'ALMA',
  subheading: 'পরিবারের ঐতিহ্যে — বোনা প্রতিটি গল্প',
  metaLeft: 'SCROLL TO DISCOVER',
  metaRight: 'CHAPTER 01',
  /** Video/poster object-position — x% y% (lower y = more headroom) */
  mediaObjectPosition: '46% 18%',
  mediaObjectPositionMobile: 'center 22%',
} as const;

export const CINEMATIC_CHAPTERS = {
  sectionNumber: 'CHAPTER 02',
  stages: [
    {
      eyebrow: 'CHAPTER 02',
      heading: 'পরিবারের প্রতিটি মুহূর্তে — একটি স্মৃতি।',
      body: 'দাদার পাঞ্জাবি, বাবার পাঞ্জাবি, ছেলের পাঞ্জাবি — একই কাপড়ে, ভিন্ন প্রজন্মে।',
      imageLabel: 'পরিবার মুহূর্ত',
      gradientFrom: 'maroon',
      gradientTo: 'terracotta',
    },
    {
      eyebrow: 'EID · 2026',
      heading: 'ঈদের সকালে — পরিবার একসাথে।',
      body: 'আমাদের family matching collection দিয়ে এবারের ঈদ হোক unforgettable।',
      imageLabel: 'ঈদের সকাল',
      gradientFrom: 'mustard',
      gradientTo: 'maroon',
    },
    {
      eyebrow: 'WEDDING SEASON',
      heading: 'বিয়ের দিন — সম্মান, ঐতিহ্য, ভালোবাসা।',
      body: 'প্রতিটি কাপড়, প্রতিটি সুতো — handcrafted, premium, timeless।',
      imageLabel: 'বিয়ের আয়োজন',
      gradientFrom: 'emerald-deep',
      gradientTo: 'emerald',
    },
    {
      eyebrow: 'YOUR STORY · OUR FABRIC',
      heading: 'এই গল্পের অংশ হোন।',
      body: 'আপনার পরিবারের জন্য বানানো — Alma Lifestyle।',
      imageLabel: 'আপনার গল্প',
      gradientFrom: 'charcoal',
      gradientTo: 'mustard',
      cta: { label: 'সংগ্রহ দেখুন', href: '/products' },
    },
  ],
} as const;

export const CINEMATIC_CLOSING = {
  eyebrow: 'EVERY THREAD · EVERY STORY',
  heading: 'পরিবারের গল্প —\nপ্রতিটি কাপড়ে।',
  cta: { label: 'আপনার গল্প শুরু করুন', href: '/products' },
} as const;

export type CinematicGradientToken =
  | 'maroon'
  | 'terracotta'
  | 'mustard'
  | 'emerald'
  | 'emerald-deep'
  | 'charcoal';

export const CINEMATIC_GRADIENT_CSS: Record<CinematicGradientToken, string> = {
  maroon: 'var(--color-maroon)',
  terracotta: 'var(--color-terracotta)',
  mustard: 'var(--color-mustard)',
  emerald: 'var(--color-emerald)',
  'emerald-deep': 'var(--emerald-shadow)',
  charcoal: 'var(--color-charcoal)',
};

export const CINEMATIC_CHAPTER_PRODUCTS = [
  { stageIndex: 0, productSlug: 'royal-navy-panjabi' },
  { stageIndex: 1, productSlug: 'maroon-festive-panjabi' },
  { stageIndex: 2, productSlug: 'silk-premium-panjabi' },
  { stageIndex: 3, productSlug: 'premium-cotton-panjabi' },
] as const;

export const CINEMATIC_FILM_STRIP_PRODUCTS = [
  'classic-white-panjabi',
  'green-casual-panjabi',
] as const;
