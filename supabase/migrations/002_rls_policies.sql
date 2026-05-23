-- =============================================================================
-- Alma Lifestyle Ecommerce — Row Level Security policies
-- Migration: 002_rls_policies.sql
-- =============================================================================
--
-- Roles:
--   anon / authenticated — storefront & customer self-service
--   service_role         — admin API (supabaseAdmin); bypasses RLS by default,
--                          explicit policies included for clarity
--
-- Customer rows use id = auth.uid() (Supabase Auth user id matches customers.id)
-- =============================================================================

-- Helper: published product exists
CREATE OR REPLACE FUNCTION public.is_product_published(p_product_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM products p
    WHERE p.id = p_product_id
      AND p.published = true
  );
$$;

COMMENT ON FUNCTION public.is_product_published IS 'RLS helper: true when product is published.';

-- =============================================================================
-- Enable RLS on all tables
-- =============================================================================

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Service role — full access (admin / server-side operations)
-- =============================================================================

CREATE POLICY service_role_all_brands
  ON brands FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_categories
  ON categories FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_products
  ON products FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_product_variants
  ON product_variants FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_product_images
  ON product_images FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_collections
  ON collections FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_collection_products
  ON collection_products FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_customers
  ON customers FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_orders
  ON orders FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_order_items
  ON order_items FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_customer_addresses
  ON customer_addresses FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_cart_sessions
  ON cart_sessions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_audit_logs
  ON audit_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_import_logs
  ON import_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =============================================================================
-- Public catalog read (anon + authenticated)
-- =============================================================================

-- brands
CREATE POLICY public_read_active_brands
  ON brands FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- categories
CREATE POLICY public_read_active_categories
  ON categories FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- products
CREATE POLICY public_read_published_products
  ON products FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- product_variants (published products only)
CREATE POLICY public_read_variants_of_published_products
  ON product_variants FOR SELECT
  TO anon, authenticated
  USING (public.is_product_published(product_id));

-- product_images (published products only)
CREATE POLICY public_read_images_of_published_products
  ON product_images FOR SELECT
  TO anon, authenticated
  USING (public.is_product_published(product_id));

-- collections
CREATE POLICY public_read_published_collections
  ON collections FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- collection_products (published collection + published product)
CREATE POLICY public_read_published_collection_products
  ON collection_products FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM collections c
      WHERE c.id = collection_products.collection_id
        AND c.published = true
    )
    AND public.is_product_published(collection_products.product_id)
  );

-- =============================================================================
-- Authenticated customers — own data only
-- =============================================================================

-- customers
CREATE POLICY customers_select_own
  ON customers FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY customers_insert_own
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY customers_update_own
  ON customers FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- orders
CREATE POLICY orders_select_own
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY orders_insert_own
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY orders_update_own
  ON orders FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- order_items (via parent order ownership)
CREATE POLICY order_items_select_own
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM orders o
      WHERE o.id = order_items.order_id
        AND o.customer_id = auth.uid()
    )
  );

CREATE POLICY order_items_insert_own
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM orders o
      WHERE o.id = order_items.order_id
        AND o.customer_id = auth.uid()
    )
  );

-- customer_addresses
CREATE POLICY customer_addresses_select_own
  ON customer_addresses FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY customer_addresses_insert_own
  ON customer_addresses FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY customer_addresses_update_own
  ON customer_addresses FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY customer_addresses_delete_own
  ON customer_addresses FOR DELETE
  TO authenticated
  USING (customer_id = auth.uid());

-- cart_sessions
CREATE POLICY cart_sessions_select_own
  ON cart_sessions FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY cart_sessions_insert_own
  ON cart_sessions FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY cart_sessions_update_own
  ON cart_sessions FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY cart_sessions_delete_own
  ON cart_sessions FOR DELETE
  TO authenticated
  USING (customer_id = auth.uid());

-- =============================================================================
-- audit_logs & import_logs — no public/authenticated policies (service_role only)
-- =============================================================================
