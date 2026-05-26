/**
 * @deprecated Collections PLP still uses mock helpers here. Category nav/filters use
 * `loadCategoriesServer()` — do not add new imports of CATEGORIES from this file.
 */
import type {
  ShopCategory,
  ShopCollection,
  ShopProduct,
  ProductCategorySlug,
  SortOption,
  ProductFilters,
} from '@/types/shop';

/** @deprecated Use loadCategoriesServer() — kept only for legacy references in this file. */
const LEGACY_CATEGORIES = [
  { slug: 'kurtis', name: 'Kurtis', nameBn: 'কুর্তি', productCount: 24 },
  { slug: 'sarees', name: 'Sarees', nameBn: 'শাড়ি', productCount: 18 },
  { slug: 'dupattas', name: 'Dupattas', nameBn: 'দুপাট্টা', productCount: 12 },
  { slug: 'panjabi', name: 'Panjabi', nameBn: 'পাঞ্জাবি', productCount: 14 },
  {
    slug: 'salwar-kameez',
    name: 'Salwar Kameez',
    nameBn: 'শালোয়ার কামিজ',
    productCount: 20,
  },
] as const;

export const COLLECTIONS: ShopCollection[] = [
  {
    slug: 'summer-essentials',
    name: 'Summer Essentials',
    description: 'Light fabrics for warm days',
    imageUrl:
      'https://images.unsplash.com/photo-1583391733981-5a958b142a7c?w=600&h=400&fit=crop',
    productCount: 16,
  },
  {
    slug: 'wedding-special',
    name: 'Wedding Special',
    description: 'Festive looks for celebrations',
    imageUrl:
      'https://images.unsplash.com/photo-1610030469983-98e550797fb4?w=600&h=400&fit=crop',
    productCount: 22,
  },
  {
    slug: 'everyday-elegance',
    name: 'Everyday Elegance',
    description: 'Comfortable premium daily wear',
    imageUrl:
      'https://images.unsplash.com/photo-1595777457583-95e059ee5811?w=600&h=400&fit=crop',
    productCount: 28,
  },
  {
    slug: 'eid-collection',
    name: 'Eid Collection',
    description: 'Curated festive outfits',
    imageUrl:
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=400&fit=crop',
    productCount: 19,
  },
];

const PRODUCT_SEEDS: Omit<
  ShopProduct,
  'id' | 'slug' | 'imageUrl' | 'badge'
>[] = [
  {
    title: 'Embroidered Cotton Kurti',
    category: 'kurtis',
    categoryLabel: 'Kurtis',
    collectionSlugs: ['summer-essentials', 'everyday-elegance'],
    price: 2490,
    compareAtPrice: 2990,
    currency: 'BDT',
    colors: ['Ivory', 'Rose', 'Sage'],
    sizes: ['S', 'M', 'L', 'XL'],
    familySlug: 'cotton-kurti-family',
    inStock: true,
  },
  {
    title: 'Silk Jamdani Saree',
    category: 'sarees',
    categoryLabel: 'Sarees',
    collectionSlugs: ['wedding-special', 'eid-collection'],
    price: 8900,
    currency: 'BDT',
    colors: ['Gold', 'Maroon'],
    sizes: ['Free Size'],
    familySlug: 'jamdani-saree-family',
    inStock: true,
  },
  {
    title: 'Printed Georgette Dupatta',
    category: 'dupattas',
    categoryLabel: 'Dupattas',
    collectionSlugs: ['summer-essentials'],
    price: 1290,
    currency: 'BDT',
    colors: ['Teal', 'Coral', 'Black'],
    sizes: ['Free Size'],
    inStock: true,
  },
  {
    title: 'Classic Panjabi — Premium Cotton',
    category: 'panjabi',
    categoryLabel: 'Panjabi',
    collectionSlugs: ['eid-collection', 'everyday-elegance'],
    price: 3200,
    compareAtPrice: 3800,
    currency: 'BDT',
    colors: ['White', 'Sky', 'Navy'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    familySlug: 'cotton-panjabi-family',
    inStock: true,
  },
  {
    title: 'Festive Salwar Kameez Set',
    category: 'salwar-kameez',
    categoryLabel: 'Salwar Kameez',
    collectionSlugs: ['wedding-special', 'eid-collection'],
    price: 5600,
    currency: 'BDT',
    colors: ['Emerald', 'Wine'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
  },
  {
    title: 'Block Print Kurti',
    category: 'kurtis',
    categoryLabel: 'Kurtis',
    collectionSlugs: ['everyday-elegance'],
    price: 1890,
    currency: 'BDT',
    colors: ['Indigo', 'Mustard'],
    sizes: ['S', 'M', 'L'],
    inStock: true,
  },
  {
    title: 'Organza Party Saree',
    category: 'sarees',
    categoryLabel: 'Sarees',
    collectionSlugs: ['wedding-special'],
    price: 7200,
    compareAtPrice: 8500,
    currency: 'BDT',
    colors: ['Blush', 'Lilac'],
    sizes: ['Free Size'],
    inStock: true,
  },
  {
    title: 'Chiffon Dupatta with Border',
    category: 'dupattas',
    categoryLabel: 'Dupattas',
    collectionSlugs: ['summer-essentials', 'eid-collection'],
    price: 990,
    currency: 'BDT',
    colors: ['Peach', 'Mint', 'Lavender'],
    sizes: ['Free Size'],
    inStock: true,
  },
  {
    title: 'Linen Panjabi — Slim Fit',
    category: 'panjabi',
    categoryLabel: 'Panjabi',
    collectionSlugs: ['summer-essentials'],
    price: 2750,
    currency: 'BDT',
    colors: ['Beige', 'Olive', 'Charcoal'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
  },
  {
    title: 'Casual Salwar Kameez',
    category: 'salwar-kameez',
    categoryLabel: 'Salwar Kameez',
    collectionSlugs: ['everyday-elegance'],
    price: 4100,
    currency: 'BDT',
    colors: ['Powder Blue', 'Dusty Rose'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
  },
  {
    title: 'Handloom Kurti with Palazzo',
    category: 'kurtis',
    categoryLabel: 'Kurtis',
    collectionSlugs: ['everyday-elegance', 'summer-essentials'],
    price: 3350,
    currency: 'BDT',
    colors: ['Rust', 'Cream'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
  },
  {
    title: 'Tissue Saree — Wedding Edit',
    category: 'sarees',
    categoryLabel: 'Sarees',
    collectionSlugs: ['wedding-special', 'eid-collection'],
    price: 12500,
    currency: 'BDT',
    colors: ['Champagne', 'Ruby'],
    sizes: ['Free Size'],
    inStock: false,
  },
  {
    title: 'Mirror Work Dupatta',
    category: 'dupattas',
    categoryLabel: 'Dupattas',
    collectionSlugs: ['wedding-special', 'eid-collection'],
    price: 1650,
    currency: 'BDT',
    colors: ['Red', 'Pink', 'Gold'],
    sizes: ['Free Size'],
    inStock: true,
  },
  {
    title: 'Embroidered Eid Panjabi',
    category: 'panjabi',
    categoryLabel: 'Panjabi',
    collectionSlugs: ['eid-collection'],
    price: 4500,
    compareAtPrice: 5200,
    currency: 'BDT',
    colors: ['Ivory', 'Pastel Blue'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    familySlug: 'cotton-panjabi-family',
    inStock: true,
  },
  {
    title: 'Anarkali Salwar Set',
    category: 'salwar-kameez',
    categoryLabel: 'Salwar Kameez',
    collectionSlugs: ['wedding-special'],
    price: 6800,
    currency: 'BDT',
    colors: ['Navy', 'Burgundy'],
    sizes: ['S', 'M', 'L'],
    inStock: true,
  },
  {
    title: 'Office Wear Kurti',
    category: 'kurtis',
    categoryLabel: 'Kurtis',
    collectionSlugs: ['everyday-elegance'],
    price: 2150,
    currency: 'BDT',
    colors: ['Black', 'Grey', 'White'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
  },
];

const IMAGE_IDS = [
  '1583391733981',
  '1610030469983',
  '1595777457583',
  '1566174053879',
  '1581047135770',
  '1515372039744',
  '1496747610174',
  '1469334031218',
  '1558618666',
  '1485968579570',
  '1572804013309',
  '1539008750456',
  '1558171813',
  '1509633759637',
  '1525502f47f1',
  '1558171813',
];

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

export const PRODUCTS: ShopProduct[] = PRODUCT_SEEDS.map((seed, index) => {
  const slug = slugifyTitle(seed.title);
  const badges: Array<ShopProduct['badge']> = [
    'new',
    'bestseller',
    undefined,
    'sale',
    undefined,
  ];
  return {
    ...seed,
    id: `prod-${index + 1}`,
    slug,
    imageUrl: `https://images.unsplash.com/photo-${IMAGE_IDS[index % IMAGE_IDS.length]}?w=600&h=800&fit=crop`,
    badge: badges[index % badges.length],
  };
});

export function getProductBySlug(slug: string): ShopProduct | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getCategoryBySlug(slug: ProductCategorySlug): ShopCategory | undefined {
  return LEGACY_CATEGORIES.find((c) => c.slug === slug) as ShopCategory | undefined;
}

export function getCollectionBySlug(slug: string): ShopCollection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}

export function getFamilyProducts(familySlug: string, excludeSlug: string): ShopProduct[] {
  return PRODUCTS.filter(
    (p) => p.familySlug === familySlug && p.slug !== excludeSlug
  ).slice(0, 6);
}

export function filterProducts(filters: ProductFilters): ShopProduct[] {
  let result = [...PRODUCTS];

  if (filters.category) {
    result = result.filter((p) => p.category === filters.category);
  }

  if (filters.collection) {
    result = result.filter((p) =>
      p.collectionSlugs.includes(filters.collection!)
    );
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
    );
  }

  const sort = filters.sort ?? 'featured';
  result = sortProducts(result, sort);

  return result;
}

function sortProducts(products: ShopProduct[], sort: SortOption): ShopProduct[] {
  const copy = [...products];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'newest':
      return copy.sort((a, b) => (a.badge === 'new' ? -1 : 1));
    case 'featured':
    default:
      return copy.sort((a, b) => {
        const score = (p: ShopProduct) =>
          (p.badge === 'bestseller' ? 2 : 0) + (p.badge === 'new' ? 1 : 0);
        return score(b) - score(a);
      });
  }
}

export function getFeaturedProducts(limit = 8): ShopProduct[] {
  return sortProducts(PRODUCTS, 'featured').slice(0, limit);
}

export function getNewArrivals(limit = 8): ShopProduct[] {
  return PRODUCTS.filter((p) => p.badge === 'new' || p.inStock)
    .slice(0, limit);
}
