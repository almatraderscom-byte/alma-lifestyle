/**
 * Supabase database types for Alma Lifestyle.
 * Row types mirror PostgreSQL tables; Insert/Update types support mutations.
 */

export type UUID = string;
export type Timestamp = string;

/** JSON-compatible value for JSONB columns (no `any`). */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

export interface Brand {
  id: UUID;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Category {
  id: UUID;
  brand_id: UUID;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  parent_id: UUID | null;
  display_order: number;
  active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Product {
  id: UUID;
  brand_id: UUID;
  category_id: UUID;
  sku: string;
  slug: string;
  title: string;
  description: string | null;
  price_usd: number;
  price_aed: number;
  price_bdt: number;
  cost_usd: number | null;
  weight_kg: number | null;
  fabric: string | null;
  care_instructions: string | null;
  origin_country: string | null;
  published: boolean;
  published_at: Timestamp | null;
  import_source_url: string | null;
  import_source_name: string | null;
  imported_at: Timestamp | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ProductVariant {
  id: UUID;
  product_id: UUID;
  sku: string;
  size: string | null;
  color: string | null;
  stock_quantity: number;
  reserved_quantity: number;
  sku_variant: string | null;
  display_name: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ProductImage {
  id: UUID;
  product_id: UUID;
  variant_id: UUID | null;
  url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: Timestamp;
}

export interface Collection {
  id: UUID;
  brand_id: UUID;
  slug: string;
  name: string;
  description: string | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  sort_order: number;
  published: boolean;
  published_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CollectionProduct {
  id: UUID;
  collection_id: UUID;
  product_id: UUID;
  sort_order: number;
  created_at: Timestamp;
}

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | string;

export interface Order {
  id: UUID;
  brand_id: UUID;
  order_number: string;
  customer_id: UUID | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string | null;
  shipping_country: string | null;
  shipping_postal_code: string | null;
  subtotal_usd: number;
  shipping_cost_usd: number;
  tax_usd: number;
  discount_usd: number;
  total_usd: number;
  status: OrderStatus;
  payment_method: string | null;
  notes: string | null;
  tracking_number: string | null;
  carrier: string | null;
  currency: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  shipped_at: Timestamp | null;
  delivered_at: Timestamp | null;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  variant_id: UUID | null;
  product_sku: string;
  product_title: string;
  variant_size: string | null;
  variant_color: string | null;
  unit_price_usd: number;
  quantity: number;
  discount_usd: number;
  total_usd: number;
  created_at: Timestamp;
}

export interface Customer {
  id: UUID;
  brand_id: UUID;
  email: string;
  password_hash: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  preferred_currency: string;
  preferred_language: string;
  marketing_opted_in: boolean;
  email_verified: boolean;
  email_verified_at: Timestamp | null;
  active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
  last_login_at: Timestamp | null;
}

export interface CustomerAddress {
  id: UUID;
  customer_id: UUID;
  label: string | null;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state_province: string | null;
  postal_code: string | null;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CartSession {
  id: UUID;
  brand_id: UUID;
  customer_id: UUID | null;
  session_token: string | null;
  data: Json | null;
  created_at: Timestamp;
  last_accessed_at: Timestamp;
  expires_at: Timestamp;
}

export interface AuditLog {
  id: UUID;
  brand_id: UUID;
  entity_type: string;
  entity_id: UUID;
  action: string;
  old_values: Json | null;
  new_values: Json | null;
  admin_id: UUID | null;
  admin_ip: string | null;
  user_agent: string | null;
  created_at: Timestamp;
}

export interface ImportLog {
  id: UUID;
  brand_id: UUID;
  import_batch_id: string | null;
  source_name: string | null;
  source_type: string | null;
  status: string | null;
  total_products: number | null;
  successful_count: number;
  failed_count: number;
  error_details: Json | null;
  started_at: Timestamp;
  completed_at: Timestamp | null;
  created_by: UUID | null;
  created_at: Timestamp;
}

// ---------------------------------------------------------------------------
// Insert / Update helpers
// ---------------------------------------------------------------------------

type AutoGenerated = 'id' | 'created_at' | 'updated_at';

export type BrandInsert = Omit<Brand, AutoGenerated> &
  Partial<Pick<Brand, 'id' | 'created_at' | 'updated_at'>>;

export type BrandUpdate = Partial<Omit<Brand, 'id' | 'created_at'>>;

export type CategoryInsert = Omit<Category, AutoGenerated> &
  Partial<Pick<Category, 'id' | 'created_at' | 'updated_at'>>;

export type CategoryUpdate = Partial<Omit<Category, 'id' | 'created_at'>>;

export type ProductInsert = Omit<Product, AutoGenerated> &
  Partial<Pick<Product, 'id' | 'created_at' | 'updated_at'>>;

export type ProductUpdate = Partial<Omit<Product, 'id' | 'created_at'>>;

export type ProductVariantInsert = Omit<ProductVariant, AutoGenerated> &
  Partial<Pick<ProductVariant, 'id' | 'created_at' | 'updated_at'>>;

export type ProductVariantUpdate = Partial<Omit<ProductVariant, 'id' | 'created_at'>>;

export type ProductImageInsert = Omit<ProductImage, 'id' | 'created_at'> &
  Partial<Pick<ProductImage, 'id' | 'created_at'>>;

export type ProductImageUpdate = Partial<Omit<ProductImage, 'id'>>;

export type CollectionInsert = Omit<Collection, AutoGenerated> &
  Partial<Pick<Collection, 'id' | 'created_at' | 'updated_at'>>;

export type CollectionUpdate = Partial<Omit<Collection, 'id' | 'created_at'>>;

export type CollectionProductInsert = Omit<CollectionProduct, 'id' | 'created_at'> &
  Partial<Pick<CollectionProduct, 'id' | 'created_at'>>;

export type CollectionProductUpdate = Partial<Omit<CollectionProduct, 'id' | 'created_at'>>;

export type OrderInsert = Omit<Order, AutoGenerated> &
  Partial<Pick<Order, 'id' | 'created_at' | 'updated_at'>>;

export type OrderUpdate = Partial<Omit<Order, 'id' | 'created_at'>>;

export type OrderItemInsert = Omit<OrderItem, 'id' | 'created_at'> &
  Partial<Pick<OrderItem, 'id' | 'created_at'>>;

export type OrderItemUpdate = Partial<Omit<OrderItem, 'id' | 'created_at'>>;

export type CustomerInsert = Omit<Customer, AutoGenerated> &
  Partial<Pick<Customer, 'id' | 'created_at' | 'updated_at'>>;

export type CustomerUpdate = Partial<Omit<Customer, 'id' | 'created_at'>>;

export type CustomerAddressInsert = Omit<CustomerAddress, AutoGenerated> &
  Partial<Pick<CustomerAddress, 'id' | 'created_at' | 'updated_at'>>;

export type CustomerAddressUpdate = Partial<Omit<CustomerAddress, 'id' | 'created_at'>>;

export type CartSessionInsert = Omit<CartSession, 'id' | 'created_at'> &
  Partial<Pick<CartSession, 'id' | 'created_at'>>;

export type CartSessionUpdate = Partial<Omit<CartSession, 'id' | 'created_at'>>;

export type AuditLogInsert = Omit<AuditLog, 'id' | 'created_at'> &
  Partial<Pick<AuditLog, 'id' | 'created_at'>>;

export type AuditLogUpdate = Partial<Omit<AuditLog, 'id' | 'created_at'>>;

export type ImportLogInsert = Omit<ImportLog, 'id' | 'created_at'> &
  Partial<Pick<ImportLog, 'id' | 'created_at'>>;

export type ImportLogUpdate = Partial<Omit<ImportLog, 'id' | 'created_at'>>;

// ---------------------------------------------------------------------------
// Supabase Database map
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: Brand;
        Insert: BrandInsert;
        Update: BrandUpdate;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
        Relationships: [
          {
            foreignKeyName: 'categories_brand_id_fkey';
            columns: ['brand_id'];
            referencedRelation: 'brands';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'categories_parent_id_fkey';
            columns: ['parent_id'];
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
        Relationships: [
          {
            foreignKeyName: 'products_brand_id_fkey';
            columns: ['brand_id'];
            referencedRelation: 'brands';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      product_variants: {
        Row: ProductVariant;
        Insert: ProductVariantInsert;
        Update: ProductVariantUpdate;
        Relationships: [
          {
            foreignKeyName: 'product_variants_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      product_images: {
        Row: ProductImage;
        Insert: ProductImageInsert;
        Update: ProductImageUpdate;
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_images_variant_id_fkey';
            columns: ['variant_id'];
            referencedRelation: 'product_variants';
            referencedColumns: ['id'];
          },
        ];
      };
      collections: {
        Row: Collection;
        Insert: CollectionInsert;
        Update: CollectionUpdate;
        Relationships: [
          {
            foreignKeyName: 'collections_brand_id_fkey';
            columns: ['brand_id'];
            referencedRelation: 'brands';
            referencedColumns: ['id'];
          },
        ];
      };
      collection_products: {
        Row: CollectionProduct;
        Insert: CollectionProductInsert;
        Update: CollectionProductUpdate;
        Relationships: [
          {
            foreignKeyName: 'collection_products_collection_id_fkey';
            columns: ['collection_id'];
            referencedRelation: 'collections';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'collection_products_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: Order;
        Insert: OrderInsert;
        Update: OrderUpdate;
        Relationships: [
          {
            foreignKeyName: 'orders_brand_id_fkey';
            columns: ['brand_id'];
            referencedRelation: 'brands';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_customer_id_fkey';
            columns: ['customer_id'];
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: OrderItem;
        Insert: OrderItemInsert;
        Update: OrderItemUpdate;
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_variant_id_fkey';
            columns: ['variant_id'];
            referencedRelation: 'product_variants';
            referencedColumns: ['id'];
          },
        ];
      };
      customers: {
        Row: Customer;
        Insert: CustomerInsert;
        Update: CustomerUpdate;
        Relationships: [
          {
            foreignKeyName: 'customers_brand_id_fkey';
            columns: ['brand_id'];
            referencedRelation: 'brands';
            referencedColumns: ['id'];
          },
        ];
      };
      customer_addresses: {
        Row: CustomerAddress;
        Insert: CustomerAddressInsert;
        Update: CustomerAddressUpdate;
        Relationships: [
          {
            foreignKeyName: 'customer_addresses_customer_id_fkey';
            columns: ['customer_id'];
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      cart_sessions: {
        Row: CartSession;
        Insert: CartSessionInsert;
        Update: CartSessionUpdate;
        Relationships: [
          {
            foreignKeyName: 'cart_sessions_brand_id_fkey';
            columns: ['brand_id'];
            referencedRelation: 'brands';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cart_sessions_customer_id_fkey';
            columns: ['customer_id'];
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      audit_logs: {
        Row: AuditLog;
        Insert: AuditLogInsert;
        Update: AuditLogUpdate;
        Relationships: [
          {
            foreignKeyName: 'audit_logs_brand_id_fkey';
            columns: ['brand_id'];
            referencedRelation: 'brands';
            referencedColumns: ['id'];
          },
        ];
      };
      import_logs: {
        Row: ImportLog;
        Insert: ImportLogInsert;
        Update: ImportLogUpdate;
        Relationships: [
          {
            foreignKeyName: 'import_logs_brand_id_fkey';
            columns: ['brand_id'];
            referencedRelation: 'brands';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ---------------------------------------------------------------------------
// Query result shapes
// ---------------------------------------------------------------------------

export interface ProductWithRelations extends Product {
  product_images: ProductImage[];
  product_variants: ProductVariant[];
}

export interface CollectionWithProductCount extends Collection {
  product_count: number;
}

export interface CollectionWithProducts extends Collection {
  collection_products: Array<
    CollectionProduct & {
      products: ProductWithRelations;
    }
  >;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
