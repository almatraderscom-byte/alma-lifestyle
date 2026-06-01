import type {
  AdminCategory,
  AdminCollection,
  AdminOrder,
  AdminProduct,
  OrderStatus,
} from '@/lib/admin-store';
import type { HomepageConfig } from '@/lib/homepage-config-types';
import type { AppSettings } from '@/lib/admin-settings-types';

type ApiSuccess<T> = { status: 'success'; data: T };
type ApiError = { status: 'error'; error: string };

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const isGet = !init?.method || init.method === 'GET';
  const url = isGet
    ? `${path}${path.includes('?') ? '&' : '?'}_t=${Date.now()}`
    : path;

  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: 'include',
  });

  const json = (await res.json()) as ApiSuccess<T> | ApiError;
  if (json.status === 'error' || !res.ok) {
    const message =
      'error' in json ? json.error : `Request failed (${res.status})`;
    console.error(`[admin-api] ${path} failed:`, res.status, message);
    throw new Error(message);
  }
  return json.data;
}

type ProductsListPayload =
  | AdminProduct[]
  | { data: AdminProduct[]; pagination?: { total: number } };

function normalizeProductsList(payload: ProductsListPayload): AdminProduct[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  console.error('[admin-api] Unexpected products list shape:', payload);
  return [];
}

export async function fetchProducts(params?: {
  limit?: number;
  published?: boolean;
}): Promise<AdminProduct[]> {
  const q = new URLSearchParams();
  q.set('admin', 'true');
  q.set('limit', String(params?.limit ?? 200));
  if (params?.published !== undefined) {
    q.set('published', String(params.published));
  }
  const payload = await request<ProductsListPayload>(`/api/v1/products?${q}`);
  const products = normalizeProductsList(payload);
  const sampleIds = products.slice(0, 3).map((p) => p.id);
  console.log('[admin-api] fetchProducts count:', products.length, 'sample IDs:', sampleIds);
  return products;
}

export async function fetchProduct(id: string): Promise<AdminProduct> {
  return request<AdminProduct>(`/api/v1/products/${id}`);
}

export async function createProductApi(product: AdminProduct): Promise<AdminProduct> {
  return request<AdminProduct>('/api/v1/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export async function updateProductApi(
  id: string,
  product: AdminProduct
): Promise<AdminProduct> {
  return request<AdminProduct>(`/api/v1/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(product),
  });
}

export async function deleteProductApi(id: string): Promise<void> {
  await request(`/api/v1/products/${id}`, { method: 'DELETE' });
}

export async function uploadImageApi(
  file: File,
  folder: string,
  bucket: 'product-images' | 'homepage-images' = 'product-images'
): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  form.append('bucket', bucket);
  const res = await fetch('/api/v1/upload', {
    method: 'POST',
    body: form,
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    console.error('[Upload] Non-JSON response:', res.status, text.slice(0, 200));
    if (res.status === 413) {
      throw new Error('Image too large. Maximum 4MB allowed.');
    }
    throw new Error(`Upload failed: server returned ${res.status}`);
  }

  const json = (await res.json()) as ApiSuccess<{ url: string } | string> | ApiError;
  if (json.status === 'error' || !res.ok) {
    const message = 'error' in json ? json.error : `Upload failed (${res.status})`;
    console.error('[admin-api] upload failed:', res.status, message);
    throw new Error(message);
  }
  const payload = json.data;
  const url =
    typeof payload === 'string'
      ? payload
      : payload && typeof payload === 'object' && 'url' in payload
        ? payload.url
        : '';
  if (!url) {
    console.error('[admin-api] upload missing url in response:', json);
    throw new Error('Upload response missing image URL');
  }
  console.log('[admin-api] upload ok:', url);
  return url;
}

export async function fetchCategories(admin = true): Promise<AdminCategory[]> {
  const q = admin ? '?admin=true' : '';
  return request<AdminCategory[]>(`/api/v1/categories${q}`);
}

export async function saveCategoryApi(
  category: AdminCategory,
  isNew: boolean
): Promise<AdminCategory> {
  const body = {
    name: category.name,
    slug: category.slug,
    description: category.description,
    display_order: category.displayOrder ?? 0,
    active: category.active ?? true,
    show_in_menu: category.showInMenu ?? true,
  };
  if (isNew) {
    return request<AdminCategory>('/api/v1/categories', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
  return request<AdminCategory>(`/api/v1/categories/${category.id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteCategoryApi(id: string): Promise<void> {
  await request(`/api/v1/categories/${id}`, { method: 'DELETE' });
}

export async function fetchCollections(): Promise<AdminCollection[]> {
  return request<AdminCollection[]>('/api/v1/collections?admin=true');
}

export async function saveCollectionApi(
  collection: AdminCollection,
  isNew: boolean
): Promise<AdminCollection> {
  const body = {
    name: collection.name,
    slug: collection.slug,
    description: collection.description,
    published: true,
    productIds: collection.productIds,
  };
  if (isNew) {
    return request<AdminCollection>('/api/v1/collections', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
  return request<AdminCollection>(`/api/v1/collections/${collection.id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteCollectionApi(id: string): Promise<void> {
  await request(`/api/v1/collections/${id}`, { method: 'DELETE' });
}

export async function fetchOrders(options?: {
  includeArchived?: boolean;
  archivedOnly?: boolean;
}): Promise<AdminOrder[]> {
  const q = new URLSearchParams();
  q.set('limit', '500');
  if (options?.includeArchived) q.set('includeArchived', 'true');
  if (options?.archivedOnly) q.set('archivedOnly', 'true');

  const payload = await request<AdminOrder[] | { data: AdminOrder[] }>(
    `/api/v1/orders?${q}`
  );
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

export async function cancelOrderApi(id: string): Promise<void> {
  await request(`/api/v1/admin/orders/${id}/cancel`, { method: 'POST' });
}

export async function archiveOrderApi(id: string): Promise<void> {
  await request(`/api/v1/admin/orders/${id}/archive`, { method: 'POST' });
}

export async function restoreOrderApi(id: string): Promise<void> {
  await request(`/api/v1/admin/orders/${id}/restore`, { method: 'POST' });
}

export async function deleteOrderPermanentlyApi(id: string): Promise<void> {
  await request(`/api/v1/admin/orders/${id}/archive`, { method: 'DELETE' });
}

export async function bulkOrderActionApi(
  orderIds: string[],
  action: 'archive' | 'cancel' | 'delete'
): Promise<{ success: boolean; count: number }> {
  return request<{ success: boolean; count: number }>('/api/v1/admin/orders/bulk-action', {
    method: 'POST',
    body: JSON.stringify({ orderIds, action }),
  });
}

export async function deleteDesignGroupApi(id: string): Promise<{ unlinkedCount: number }> {
  return request<{ unlinkedCount: number }>(`/api/v1/admin/design-groups/${id}`, {
    method: 'DELETE',
  });
}

export async function updateOrderStatusApi(
  id: string,
  status: OrderStatus
): Promise<AdminOrder> {
  return request<AdminOrder>(`/api/v1/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function fetchHomepageConfigApi(): Promise<HomepageConfig> {
  return request<HomepageConfig>('/api/v1/homepage-config');
}

export async function saveHomepageConfigApi(config: HomepageConfig): Promise<HomepageConfig> {
  return request<HomepageConfig>('/api/v1/homepage-config', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export async function fetchSettingsApi(): Promise<AppSettings> {
  return request<AppSettings>('/api/v1/settings');
}

export async function saveSettingsApi(settings: AppSettings): Promise<AppSettings> {
  return request<AppSettings>('/api/v1/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export async function createOrderApi(payload: unknown): Promise<{
  orderNumber: string;
  id: string;
}> {
  return request('/api/v1/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
