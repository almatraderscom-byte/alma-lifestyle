-- =============================================================================
-- Alma Lifestyle Ecommerce — Initial schema
-- Migration: 001_initial_schema.sql
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. brands
-- Multi-brand root entity (single brand in production: alma-lifestyle).
-- -----------------------------------------------------------------------------
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(255),
  website_url VARCHAR(255),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

COMMENT ON TABLE brands IS 'Brand tenants for multi-brand ecommerce (e.g. Alma Lifestyle).';
COMMENT ON COLUMN brands.slug IS 'URL-safe unique identifier for the brand.';

CREATE INDEX idx_brands_active ON brands (active) WHERE active = true;

-- -----------------------------------------------------------------------------
-- 2. categories
-- Hierarchical product taxonomy per brand.
-- -----------------------------------------------------------------------------
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE RESTRICT,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  parent_id UUID REFERENCES categories (id) ON DELETE SET NULL,
  display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (brand_id, slug)
);

COMMENT ON TABLE categories IS 'Product categories (e.g. Panjabi, Accessories) scoped per brand.';
COMMENT ON COLUMN categories.parent_id IS 'Optional parent for nested category trees.';

CREATE INDEX idx_categories_brand ON categories (brand_id);
CREATE INDEX idx_categories_parent ON categories (parent_id);
CREATE INDEX idx_categories_active ON categories (active, brand_id);

-- -----------------------------------------------------------------------------
-- 3. products
-- Core catalog items with multi-currency pricing and import metadata.
-- -----------------------------------------------------------------------------
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
  sku VARCHAR(100) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_usd DECIMAL(10, 2) NOT NULL,
  price_aed DECIMAL(10, 2) NOT NULL,
  price_bdt DECIMAL(10, 2) NOT NULL,
  cost_usd DECIMAL(10, 2),
  weight_kg DECIMAL(5, 2),
  fabric VARCHAR(100),
  care_instructions TEXT,
  origin_country VARCHAR(2),
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP,
  import_source_url VARCHAR(500),
  import_source_name VARCHAR(100),
  imported_at TIMESTAMP,
  seo_title VARCHAR(255),
  seo_description VARCHAR(500),
  seo_keywords VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (brand_id, sku),
  UNIQUE (brand_id, slug)
);

COMMENT ON TABLE products IS 'Sellable products; snapshots on orders preserve historical data.';
COMMENT ON COLUMN products.published_at IS 'When the product was first published to the storefront.';

CREATE INDEX idx_products_brand ON products (brand_id);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_published ON products (published, brand_id, published_at DESC);
CREATE INDEX idx_products_sku ON products (sku);
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_imported_at ON products (imported_at DESC NULLS LAST);

-- -----------------------------------------------------------------------------
-- 4. product_variants
-- Size/color/stock combinations per product.
-- -----------------------------------------------------------------------------
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  size VARCHAR(50),
  color VARCHAR(50),
  stock_quantity INT NOT NULL DEFAULT 0,
  reserved_quantity INT NOT NULL DEFAULT 0,
  sku_variant VARCHAR(100),
  display_name VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (product_id, sku),
  UNIQUE (product_id, size, color)
);

COMMENT ON TABLE product_variants IS 'Inventory-bearing variants (size, color) for each product.';
COMMENT ON COLUMN product_variants.reserved_quantity IS 'Units held in open carts or pending orders.';

CREATE INDEX idx_variants_product ON product_variants (product_id);
CREATE INDEX idx_variants_sku ON product_variants (sku);

-- -----------------------------------------------------------------------------
-- 5. product_images
-- Gallery images per product (optional variant association).
-- -----------------------------------------------------------------------------
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants (id) ON DELETE SET NULL,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (product_id, url)
);

COMMENT ON TABLE product_images IS 'Ordered product media; lowest sort_order is typically the hero image.';

CREATE INDEX idx_product_images_product ON product_images (product_id);
CREATE INDEX idx_product_images_variant ON product_images (variant_id);

-- -----------------------------------------------------------------------------
-- 6. collections
-- Curated merchandising groups (seasonal edits, bestsellers, etc.).
-- -----------------------------------------------------------------------------
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE RESTRICT,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  hero_image_url VARCHAR(255),
  hero_image_alt VARCHAR(255),
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (brand_id, slug)
);

COMMENT ON TABLE collections IS 'Marketing collections grouping products for storefront browsing.';

CREATE INDEX idx_collections_brand ON collections (brand_id);
CREATE INDEX idx_collections_published ON collections (published, brand_id);

-- -----------------------------------------------------------------------------
-- 7. collection_products
-- Many-to-many join between collections and products with manual ordering.
-- -----------------------------------------------------------------------------
CREATE TABLE collection_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (collection_id, product_id)
);

COMMENT ON TABLE collection_products IS 'Ordered membership of products within a collection.';

CREATE INDEX idx_collection_products_collection ON collection_products (collection_id);
CREATE INDEX idx_collection_products_product ON collection_products (product_id);

-- -----------------------------------------------------------------------------
-- 8. customers
-- Registered shopper accounts per brand.
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE RESTRICT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  preferred_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  preferred_language VARCHAR(5) NOT NULL DEFAULT 'en',
  marketing_opted_in BOOLEAN NOT NULL DEFAULT false,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verified_at TIMESTAMP,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  last_login_at TIMESTAMP,
  UNIQUE (brand_id, email)
);

COMMENT ON TABLE customers IS 'Customer accounts; id should align with auth.users when using Supabase Auth.';
COMMENT ON COLUMN customers.password_hash IS 'Nullable when using external auth providers only.';

CREATE INDEX idx_customers_brand ON customers (brand_id);
CREATE INDEX idx_customers_email ON customers (email);

-- -----------------------------------------------------------------------------
-- 9. orders
-- Immutable order headers with denormalized customer/shipping snapshot.
-- -----------------------------------------------------------------------------
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE RESTRICT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers (id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100),
  shipping_country VARCHAR(2),
  shipping_postal_code VARCHAR(20),
  subtotal_usd DECIMAL(10, 2) NOT NULL,
  shipping_cost_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_usd DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending_payment',
  payment_method VARCHAR(50),
  notes TEXT,
  tracking_number VARCHAR(100),
  carrier VARCHAR(50),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP
);

COMMENT ON TABLE orders IS 'Customer orders; line items stored in order_items with product snapshots.';
COMMENT ON COLUMN orders.status IS 'e.g. pending_payment, confirmed, shipped, delivered.';

CREATE INDEX idx_orders_brand ON orders (brand_id);
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_status ON orders (status, created_at DESC);
CREATE INDEX idx_orders_order_number ON orders (order_number);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);

-- -----------------------------------------------------------------------------
-- 10. order_items
-- Immutable line-item snapshots for each order.
-- -----------------------------------------------------------------------------
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants (id) ON DELETE SET NULL,
  product_sku VARCHAR(100) NOT NULL,
  product_title VARCHAR(255) NOT NULL,
  variant_size VARCHAR(50),
  variant_color VARCHAR(50),
  unit_price_usd DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  discount_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_usd DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

COMMENT ON TABLE order_items IS 'Frozen product/variant details at time of purchase.';

CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_order_items_product ON order_items (product_id);

-- -----------------------------------------------------------------------------
-- 11. customer_addresses
-- Saved shipping/billing addresses per customer.
-- -----------------------------------------------------------------------------
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  label VARCHAR(50),
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) NOT NULL,
  phone VARCHAR(20),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

COMMENT ON TABLE customer_addresses IS 'Reusable address book entries for logged-in customers.';

CREATE INDEX idx_customer_addresses_customer ON customer_addresses (customer_id);

-- -----------------------------------------------------------------------------
-- 12. cart_sessions
-- Guest and authenticated shopping cart persistence (JSON payload).
-- -----------------------------------------------------------------------------
CREATE TABLE cart_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES customers (id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE,
  data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMP NOT NULL DEFAULT now(),
  expires_at TIMESTAMP NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

COMMENT ON TABLE cart_sessions IS 'Ephemeral carts keyed by session_token (guest) or customer_id (logged in).';
COMMENT ON COLUMN cart_sessions.data IS 'Serialized cart lines, coupons, and metadata.';

CREATE INDEX idx_cart_sessions_customer ON cart_sessions (customer_id);
CREATE INDEX idx_cart_sessions_token ON cart_sessions (session_token);
CREATE INDEX idx_cart_sessions_expires ON cart_sessions (expires_at);

-- -----------------------------------------------------------------------------
-- 13. audit_logs
-- Append-only admin activity trail.
-- -----------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE RESTRICT,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  admin_id UUID,
  admin_ip VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

COMMENT ON TABLE audit_logs IS 'Immutable audit trail for admin mutations across entities.';

CREATE INDEX idx_audit_logs_brand ON audit_logs (brand_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_admin ON audit_logs (admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- -----------------------------------------------------------------------------
-- 14. import_logs
-- Bulk product import job tracking.
-- -----------------------------------------------------------------------------
CREATE TABLE import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE RESTRICT,
  import_batch_id VARCHAR(100),
  source_name VARCHAR(100),
  source_type VARCHAR(50),
  status VARCHAR(50),
  total_products INT,
  successful_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  error_details JSONB,
  started_at TIMESTAMP NOT NULL DEFAULT now(),
  completed_at TIMESTAMP,
  created_by UUID,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

COMMENT ON TABLE import_logs IS 'Tracks supplier/API import batches and per-batch outcomes.';

CREATE INDEX idx_import_logs_brand ON import_logs (brand_id);
CREATE INDEX idx_import_logs_status ON import_logs (status);
CREATE INDEX idx_import_logs_created_at ON import_logs (created_at DESC);

-- -----------------------------------------------------------------------------
-- updated_at trigger (shared)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customer_addresses_updated_at
  BEFORE UPDATE ON customer_addresses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
