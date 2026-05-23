/**
 * Admin data layer for the dashboard.
 *
 * When `shouldUseApi()` is true (Supabase env configured), read/write functions
 * call `/api/v1/*` via `admin-api.ts` (server uses service role + RLS bypass).
 *
 * When Supabase is not configured, the same functions use `localStorage` keys
 * prefixed with `alma-admin-*` and seed demo data on first visit.
 */
import type { AppSettings } from '@/lib/admin-settings-types';
import { getDefaultAppSettings, migrateLegacySettings } from '@/lib/admin-settings-types';
import type { HomepageConfig } from '@/lib/homepage-config-types';
import {
  getSavedHomepageConfig,
  saveHomepageConfig as saveFullHomepageConfig,
} from '@/lib/homepage-config';
import { isDatabaseUuid, isLegacyLocalId, newDatabaseId } from '@/lib/admin-ids';
import { shouldUseApi } from '@/lib/data-source';
import type { ProductType } from '@/lib/product-design-types';
import * as adminApi from '@/lib/admin-api';

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
  /** Persisted in product_images.alt_text for gallery ordering */
  imageRole?: 'family-group' | 'member';
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
  productType: ProductType;
  designGroupId?: string;
  designGroupName?: string;
  ageGroup?: string;
  displayOrder?: number;
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
  status: ProductStatus,
  productType: ProductType = 'simple'
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
    productType,
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
function getProductsLocal(): AdminProduct[] {
  ensureAdminSeed();
  return readJson<AdminProduct[]>(KEYS.products, []);
}

export async function getProducts(): Promise<AdminProduct[]> {
  if (shouldUseApi()) {
    try {
      const result = await adminApi.fetchProducts({ limit: 1000 });
      const legacy = result.filter((p) => isLegacyLocalId(p.id));
      if (legacy.length > 0) {
        console.warn(
          '[admin-store] API returned legacy localStorage-style IDs — check API mapper:',
          legacy.map((p) => p.id).slice(0, 3)
        );
      }
      return result;
    } catch (error) {
      console.error('[admin-store] API fetchProducts failed:', error);
      throw error;
    }
  }
  return getProductsLocal();
}

export async function getProductById(id: string): Promise<AdminProduct | null> {
  if (shouldUseApi()) {
    if (isDatabaseUuid(id)) {
      try {
        return await adminApi.fetchProduct(id);
      } catch (error) {
        console.error('[admin-store] API fetchProduct failed for', id, error);
        return null;
      }
    }
    if (isLegacyLocalId(id)) {
      console.warn(
        '[admin-store] Legacy local id in API mode — not in Supabase:',
        id
      );
      return getProductsLocal().find((p) => p.id === id) ?? null;
    }
    console.error('[admin-store] Invalid product id format:', id);
    return null;
  }
  return getProductsLocal().find((p) => p.id === id) ?? null;
}

export async function saveProduct(product: AdminProduct): Promise<AdminProduct> {
  if (shouldUseApi()) return adminApi.createProductApi(product);
  const products = getProductsLocal();
  const next = { ...product, updatedAt: new Date().toISOString() };
  products.push(next);
  writeJson(KEYS.products, products);
  return next;
}

export async function updateProduct(
  id: string,
  updates: Partial<AdminProduct>
): Promise<AdminProduct | null> {
  if (shouldUseApi()) {
    const existing = await getProductById(id);
    if (!existing) return null;
    return adminApi.updateProductApi(id, {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    });
  }
  const products = getProductsLocal();
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

export async function deleteProduct(id: string): Promise<boolean> {
  if (shouldUseApi()) {
    await adminApi.deleteProductApi(id);
    return true;
  }
  writeJson(
    KEYS.products,
    getProductsLocal().filter((p) => p.id !== id)
  );
  return true;
}

export async function duplicateProduct(id: string): Promise<AdminProduct | null> {
  const source = await getProductById(id);
  if (!source) return null;
  const now = new Date().toISOString();
  const copy: AdminProduct = {
    ...source,
    id: shouldUseApi() ? newDatabaseId() : uid('prod'),
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
function getCategoriesLocal(): AdminCategory[] {
  ensureAdminSeed();
  return readJson<AdminCategory[]>(KEYS.categories, []);
}

export async function getCategories(): Promise<AdminCategory[]> {
  if (shouldUseApi()) {
    try {
      return await adminApi.fetchCategories(true);
    } catch (error) {
      console.error('[admin-store] API fetchCategories failed:', error);
      throw error;
    }
  }
  return getCategoriesLocal();
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function saveCategory(cat: AdminCategory): Promise<AdminCategory> {
  if (shouldUseApi()) return adminApi.saveCategoryApi(cat, !UUID_RE.test(cat.id));
  const items = getCategoriesLocal();
  items.push(cat);
  writeJson(KEYS.categories, items);
  return cat;
}

export async function updateCategory(
  id: string,
  updates: Partial<AdminCategory>
): Promise<AdminCategory | null> {
  if (shouldUseApi()) {
    const existing = (await getCategories()).find((c) => c.id === id);
    if (!existing) return null;
    return adminApi.saveCategoryApi({ ...existing, ...updates, id }, false);
  }
  const items = getCategoriesLocal();
  const index = items.findIndex((c) => c.id === id);
  if (index < 0) return null;
  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
  writeJson(KEYS.categories, items);
  return items[index];
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (shouldUseApi()) {
    await adminApi.deleteCategoryApi(id);
    return true;
  }
  writeJson(
    KEYS.categories,
    getCategoriesLocal().filter((c) => c.id !== id)
  );
  return true;
}

// ——— Collections ———
function getCollectionsLocal(): AdminCollection[] {
  ensureAdminSeed();
  return readJson<AdminCollection[]>(KEYS.collections, []);
}

export async function getCollections(): Promise<AdminCollection[]> {
  if (shouldUseApi()) {
    try {
      return await adminApi.fetchCollections();
    } catch (error) {
      console.error('[admin-store] API fetchCollections failed:', error);
      throw error;
    }
  }
  return getCollectionsLocal();
}

export async function saveCollection(col: AdminCollection): Promise<AdminCollection> {
  if (shouldUseApi()) return adminApi.saveCollectionApi(col, true);
  const items = getCollectionsLocal();
  items.push(col);
  writeJson(KEYS.collections, items);
  return col;
}

export async function updateCollection(
  id: string,
  updates: Partial<AdminCollection>
): Promise<AdminCollection | null> {
  if (shouldUseApi()) {
    const existing = (await getCollections()).find((c) => c.id === id);
    if (!existing) return null;
    return adminApi.saveCollectionApi({ ...existing, ...updates, id }, false);
  }
  const items = getCollectionsLocal();
  const index = items.findIndex((c) => c.id === id);
  if (index < 0) return null;
  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
  writeJson(KEYS.collections, items);
  return items[index];
}

export async function deleteCollection(id: string): Promise<boolean> {
  if (shouldUseApi()) {
    await adminApi.deleteCollectionApi(id);
    return true;
  }
  writeJson(
    KEYS.collections,
    getCollectionsLocal().filter((c) => c.id !== id)
  );
  return true;
}

// ——— Orders ———
function getOrdersLocal(): AdminOrder[] {
  ensureAdminSeed();
  return readJson<AdminOrder[]>(KEYS.orders, []);
}

export async function getOrders(): Promise<AdminOrder[]> {
  if (shouldUseApi()) {
    try {
      return await adminApi.fetchOrders();
    } catch (error) {
      console.error('[admin-store] API fetchOrders failed:', error);
      throw error;
    }
  }
  return getOrdersLocal();
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<AdminOrder | null> {
  if (shouldUseApi()) return adminApi.updateOrderStatusApi(id, status);
  const orders = getOrdersLocal();
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

// ——— Homepage ———
export async function getHomepageConfig(): Promise<HomepageConfig> {
  if (shouldUseApi()) return adminApi.fetchHomepageConfigApi();
  return getSavedHomepageConfig();
}

export async function saveHomepageConfig(config: HomepageConfig): Promise<HomepageConfig> {
  if (shouldUseApi()) return adminApi.saveHomepageConfigApi(config);
  return saveFullHomepageConfig(config);
}

// ——— Settings ———
function getSettingsLocal(): AppSettings {
  ensureAdminSeed();
  const raw = readJson<Record<string, unknown> | null>(KEYS.settings, null);
  if (!raw) return getDefaultAppSettings();
  if ('supportEmail' in raw || !('contactEmail' in raw)) {
    return migrateLegacySettings(raw);
  }
  return { ...getDefaultAppSettings(), ...(raw as unknown as AppSettings) };
}

export async function getSettings(): Promise<AppSettings> {
  if (shouldUseApi()) {
    try {
      const partial = await adminApi.fetchSettingsApi();
      return { ...getDefaultAppSettings(), ...partial };
    } catch (error) {
      console.error('[admin-store] API fetchSettings failed:', error);
      return getSettingsLocal();
    }
  }
  return getSettingsLocal();
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  if (shouldUseApi()) return adminApi.saveSettingsApi(settings);
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

export async function exportAllData(): Promise<void> {
  if (!isBrowser()) return;
  const payload: AdminDataExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    products: await getProducts(),
    categories: await getCategories(),
    collections: await getCollections(),
    orders: await getOrders(),
    settings: await getSettings(),
    homepage: shouldUseApi()
      ? await adminApi.fetchHomepageConfigApi()
      : getSavedHomepageConfig(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alma-admin-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(
  json: string
): Promise<{ ok: boolean; error?: string }> {
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
  const id = shouldUseApi() ? newDatabaseId() : uid('prod');
  return {
    id,
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    priceBdt: 0,
    categoryId: '',
    productType: 'simple',
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
