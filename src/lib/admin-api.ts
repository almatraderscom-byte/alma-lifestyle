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
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: 'include',
  });

  const json = (await res.json()) as ApiSuccess<T> | ApiError;
  if (json.status === 'error' || !res.ok) {
    throw new Error('error' in json ? json.error : `Request failed (${res.status})`);
  }
  return json.data;
}

export async function fetchProducts(params?: {
  limit?: number;
  published?: boolean;
}): Promise<AdminProduct[]> {
  const q = new URLSearchParams();
  q.set('limit', String(params?.limit ?? 500));
  if (params?.published !== undefined) {
    q.set('published', String(params.published));
  }
  const result = await request<{
    data: AdminProduct[];
    pagination: { total: number };
  }>(`/api/v1/products?${q}`);
  return result.data;
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
  const json = (await res.json()) as ApiSuccess<{ url: string }> | ApiError;
  if (json.status === 'error' || !res.ok) {
    throw new Error('error' in json ? json.error : 'Upload failed');
  }
  return json.data.url;
}

export async function fetchCategories(admin = true): Promise<AdminCategory[]> {
  const q = admin ? '?admin=true' : '';
  return request<AdminCategory[]>(`/api/v1/categories${q}`);
}

export async function saveCategoryApi(
  category: AdminCategory,
  isNew: boolean
): Promise<AdminCategory> {
  if (isNew) {
    return request<AdminCategory>('/api/v1/categories', {
      method: 'POST',
      body: JSON.stringify({
        name: category.name,
        slug: category.slug,
        description: category.description,
      }),
    });
  }
  return request<AdminCategory>(`/api/v1/categories/${category.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: category.name,
      slug: category.slug,
      description: category.description,
    }),
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

export async function fetchOrders(): Promise<AdminOrder[]> {
  const result = await request<{
    data: AdminOrder[];
  }>('/api/v1/orders?limit=200');
  return result.data;
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
