import type { AppSettings } from '@/lib/admin-settings-types';
import { getDefaultAppSettings, migrateLegacySettings } from '@/lib/admin-settings-types';
import type { HomepageConfig } from '@/lib/homepage-config-types';
import {
  getSavedHomepageConfig,
  saveHomepageConfig as saveFullHomepageConfig,
} from '@/lib/homepage-config';

const KEYS = {
  products: 'alma-admin-products',
  categories: 'alma-admin-categories',
  collections: 'alma-admin-collections',
  orders: 'alma-admin-orders',
  homepage: 'alma-admin-homepage',
  settings: 'alma-admin-settings',
  seeded: 'alma-admin-seeded',
} as const;

export type ProductStatus = 'draft' | 'published';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex?: string;
  stock: number;
  sku: string;
}

export interface ProductImage {
  id: string;
  url: string;
  isFeatured: boolean;
  sortOrder: number;
}

export interface AdminProduct {
  id: string;
  title: string;
  banglaTitle?: string;
  tags?: string[];
  slug: string;
  shortDescription: string;
  description: string;
  priceBdt: number;
  compareAtPriceBdt?: number;
  costPriceBdt?: number;
  categoryId: string;
  status: ProductStatus;
  hasVariants: boolean;
  stock?: number;
  variants?: ProductVariant[];
  images: ProductImage[];
  collectionIds: string[];
  fabric?: string;
  careInstructions?: string;
  weightKg?: number;
  originCountry?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  totalBdt: number;
  status: OrderStatus;
  itemsCount: number;
  city: string;
  createdAt: string;
  updatedAt: string;
}

export type { AppSettings } from '@/lib/admin-settings-types';
export { getDefaultAppSettings, migrateLegacySettings } from '@/lib/admin-settings-types';
export type { HomepageConfig } from '@/lib/homepage-config-types';
export { getDefaultHomepageConfig, getSavedHomepageConfig } from '@/lib/homepage-config';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ensureAdminSeed(): void {
  if (!isBrowser()) return;
  if (localStorage.getItem(KEYS.seeded)) return;

  const now = new Date().toISOString();
  const categories: AdminCategory[] = [
    { id: 'cat_panjabi', name: 'Panjabi', slug: 'panjabi', createdAt: now, updatedAt: now },
    { id: 'cat_electronics', name: 'Electronics', slug: 'electronics', createdAt: now, updatedAt: now },
    { id: 'cat_accessories', name: 'Accessories', slug: 'accessories', createdAt: now, updatedAt: now },
    { id: 'cat_home', name: 'Home & Decor', slug: 'home-decor', createdAt: now, updatedAt: now },
  ];

  const collections: AdminCollection[] = [
    {
      id: 'col_eid',
      name: 'Eid Collection 2026',
      slug: 'eid-collection',
      description: 'Festive panjabi and lifestyle picks',
      productIds: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'col_new',
      name: 'New Arrivals',
      slug: 'new-arrivals',
      description: 'Latest products',
      productIds: [],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const products: AdminProduct[] = [
    mkProduct('Royal Navy Panjabi', 'royal-navy-panjabi', 2550, 3200, 'cat_panjabi', 45, 'published'),
    mkProduct('Classic White Panjabi', 'classic-white-panjabi', 1850, undefined, 'cat_panjabi', 30, 'published'),
    mkProduct('Premium Cotton Panjabi', 'premium-cotton-panjabi', 2150, 2490, 'cat_panjabi', 8, 'published'),
    mkProduct('Silk Premium Panjabi', 'silk-premium-panjabi', 3850, 4500, 'cat_panjabi', 12, 'draft'),
    mkProduct('Wireless Earbuds Pro', 'wireless-earbuds-pro', 3500, undefined, 'cat_electronics', 25, 'published'),
    mkProduct('Smart Watch Elite', 'smart-watch-elite', 4200, 4800, 'cat_electronics', 5, 'published'),
    mkProduct('Leather Wallet', 'leather-wallet', 950, 1100, 'cat_accessories', 3, 'published'),
    mkProduct('Handmade Jute Bag', 'handmade-jute-bag', 750, undefined, 'cat_accessories', 20, 'published'),
    mkProduct('Ceramic Flower Vase', 'ceramic-flower-vase', 1200, undefined, 'cat_home', 15, 'published'),
    mkProduct('USB LED Desk Lamp', 'usb-led-desk-lamp', 1250, undefined, 'cat_electronics', 18, 'draft'),
  ];

  collections[0].productIds = [products[0].id, products[2].id];
  collections[1].productIds = products.filter((p) => p.status === 'published').slice(0, 4).map((p) => p.id);

  const orders: AdminOrder[] = [
    mkOrder('ALM-10024001', 'Rafiqul Islam', '01712345678', 5100, 'pending', 2, 'Dhaka'),
    mkOrder('ALM-10024002', 'Fatema Begum', '01898765432', 2550, 'processing', 1, 'Chattogram'),
    mkOrder('ALM-10024003', 'Kamrul Hasan', '01911223344', 4200, 'shipped', 1, 'Sylhet'),
    mkOrder('ALM-10024004', 'Salma Akter', '01655667788', 1850, 'delivered', 1, 'Rajshahi'),
    mkOrder('ALM-10024005', 'Nasir Uddin', '01544332211', 7500, 'pending', 3, 'Dhaka'),
  ];

  writeJson(KEYS.categories, categories);
  writeJson(KEYS.collections, collections);
  writeJson(KEYS.products, products);
  writeJson(KEYS.orders, orders);
  writeJson(KEYS.settings, getDefaultAppSettings());
  localStorage.setItem(KEYS.seeded, '1');
}

function mkProduct(
  title: string,
  slug: string,
  price: number,
  compare: number | undefined,
  categoryId: string,
  stock: number,
  status: ProductStatus
): AdminProduct {
  const now = new Date().toISOString();
  const id = uid('prod');
  return {
    id,
    title,
    slug,
    shortDescription: `Premium ${title} from ALMA Lifestyle.`,
    description: `Detailed description for ${title}. High quality materials and careful craftsmanship.`,
    priceBdt: price,
    compareAtPriceBdt: compare,
    categoryId,
    status,
    hasVariants: false,
    stock,
    images: [
      {
        id: uid('img'),
        url: '',
        isFeatured: true,
        sortOrder: 0,
      },
    ],
    collectionIds: [],
    sku: `SKU-${slug.toUpperCase().replace(/-/g, '').slice(0, 8)}`,
    fabric: 'Premium cotton blend',
    careInstructions: 'Hand wash cold. Do not bleach.',
    weightKg: 0.45,
    originCountry: 'BD',
    createdAt: now,
    updatedAt: now,
  };
}

function mkOrder(
  orderNumber: string,
  name: string,
  phone: string,
  total: number,
  status: OrderStatus,
  items: number,
  city: string
): AdminOrder {
  const now = new Date().toISOString();
  return {
    id: uid('ord'),
    orderNumber,
    customerName: name,
    customerPhone: phone,
    totalBdt: total,
    status,
    itemsCount: items,
    city,
    createdAt: now,
    updatedAt: now,
  };
}

// ——— Products ———
export function getProducts(): AdminProduct[] {
  ensureAdminSeed();
  return readJson<AdminProduct[]>(KEYS.products, []);
}

export function getProductById(id: string): AdminProduct | null {
  return getProducts().find((p) => p.id === id) ?? null;
}

export function saveProduct(product: AdminProduct): AdminProduct {
  const products = getProducts();
  const next = { ...product, updatedAt: new Date().toISOString() };
  products.push(next);
  writeJson(KEYS.products, products);
  return next;
}

export function updateProduct(id: string, updates: Partial<AdminProduct>): AdminProduct | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index < 0) return null;
  const updated = {
    ...products[index],
    ...updates,
    id: products[index].id,
    updatedAt: new Date().toISOString(),
  };
  products[index] = updated;
  writeJson(KEYS.products, products);
  return updated;
}

export function deleteProduct(id: string): boolean {
  const products = getProducts().filter((p) => p.id !== id);
  writeJson(KEYS.products, products);
  return true;
}

export function duplicateProduct(id: string): AdminProduct | null {
  const source = getProductById(id);
  if (!source) return null;
  const now = new Date().toISOString();
  const copy: AdminProduct = {
    ...source,
    id: uid('prod'),
    title: `${source.title} (Copy)`,
    slug: `${source.slug}-copy-${Math.random().toString(36).slice(2, 6)}`,
    sku: `${source.sku}-COPY`,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  return saveProduct(copy);
}

export function generateProductSlug(title: string): string {
  return slugify(title);
}

export function getTotalStock(product: AdminProduct): number {
  if (product.hasVariants && product.variants?.length) {
    return product.variants.reduce((sum, v) => sum + v.stock, 0);
  }
  return product.stock ?? 0;
}

// ——— Categories ———
export function getCategories(): AdminCategory[] {
  ensureAdminSeed();
  return readJson<AdminCategory[]>(KEYS.categories, []);
}

export function saveCategory(cat: AdminCategory): AdminCategory {
  const items = getCategories();
  items.push(cat);
  writeJson(KEYS.categories, items);
  return cat;
}

export function updateCategory(id: string, updates: Partial<AdminCategory>): AdminCategory | null {
  const items = getCategories();
  const index = items.findIndex((c) => c.id === id);
  if (index < 0) return null;
  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
  writeJson(KEYS.categories, items);
  return items[index];
}

export function deleteCategory(id: string): boolean {
  writeJson(
    KEYS.categories,
    getCategories().filter((c) => c.id !== id)
  );
  return true;
}

// ——— Collections ———
export function getCollections(): AdminCollection[] {
  ensureAdminSeed();
  return readJson<AdminCollection[]>(KEYS.collections, []);
}

export function saveCollection(col: AdminCollection): AdminCollection {
  const items = getCollections();
  items.push(col);
  writeJson(KEYS.collections, items);
  return col;
}

export function updateCollection(id: string, updates: Partial<AdminCollection>): AdminCollection | null {
  const items = getCollections();
  const index = items.findIndex((c) => c.id === id);
  if (index < 0) return null;
  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
  writeJson(KEYS.collections, items);
  return items[index];
}

export function deleteCollection(id: string): boolean {
  writeJson(
    KEYS.collections,
    getCollections().filter((c) => c.id !== id)
  );
  return true;
}

// ——— Orders ———
export function getOrders(): AdminOrder[] {
  ensureAdminSeed();
  return readJson<AdminOrder[]>(KEYS.orders, []);
}

export function updateOrderStatus(id: string, status: OrderStatus): AdminOrder | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index < 0) return null;
  orders[index] = {
    ...orders[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  writeJson(KEYS.orders, orders);
  return orders[index];
}

// ——— Homepage (delegates to homepage-config) ———
export function getHomepageConfig() {
  return getSavedHomepageConfig();
}

export function saveHomepageConfig(config: HomepageConfig) {
  return saveFullHomepageConfig(config);
}

// ——— Settings ———
export function getSettings(): AppSettings {
  ensureAdminSeed();
  const raw = readJson<Record<string, unknown> | null>(KEYS.settings, null);
  if (!raw) return getDefaultAppSettings();
  if ('supportEmail' in raw || !('contactEmail' in raw)) {
    return migrateLegacySettings(raw);
  }
  return { ...getDefaultAppSettings(), ...(raw as unknown as AppSettings) };
}

export function saveSettings(settings: AppSettings): AppSettings {
  const next: AppSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  writeJson(KEYS.settings, next);
  return next;
}

export interface AdminDataExport {
  version: 1;
  exportedAt: string;
  products: AdminProduct[];
  categories: AdminCategory[];
  collections: AdminCollection[];
  orders: AdminOrder[];
  settings: AppSettings;
  homepage: HomepageConfig;
}

export function exportAllData(): void {
  if (!isBrowser()) return;
  const payload: AdminDataExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    products: getProducts(),
    categories: getCategories(),
    collections: getCollections(),
    orders: getOrders(),
    settings: getSettings(),
    homepage: getSavedHomepageConfig(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alma-admin-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(json: string): { ok: boolean; error?: string } {
  if (!isBrowser()) return { ok: false, error: 'Not in browser' };
  try {
    const data = JSON.parse(json) as AdminDataExport;
    if (!data.version || !data.products) {
      return { ok: false, error: 'Invalid backup file' };
    }
    writeJson(KEYS.products, data.products);
    writeJson(KEYS.categories, data.categories);
    writeJson(KEYS.collections, data.collections);
    writeJson(KEYS.orders, data.orders);
    writeJson(KEYS.settings, data.settings);
    saveFullHomepageConfig(data.homepage);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not parse JSON' };
  }
}

export function createEmptyProduct(): AdminProduct {
  const now = new Date().toISOString();
  const id = uid('prod');
  return {
    id,
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    priceBdt: 0,
    categoryId: '',
    status: 'draft',
    hasVariants: false,
    stock: 0,
    images: [],
    collectionIds: [],
    sku: '',
    createdAt: now,
    updatedAt: now,
  };
}

export { uid, slugify };
