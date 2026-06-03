-- =============================================================================
-- Product landing page content (customLayout PDPs)
-- Migration: 013_product_landing_contents.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS product_landing_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug TEXT UNIQUE NOT NULL,
  layout_key TEXT NOT NULL,
  content JSONB NOT NULL,
  updated_by UUID REFERENCES admin_users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_contents_slug ON product_landing_contents (product_slug);
CREATE INDEX IF NOT EXISTS idx_landing_contents_layout ON product_landing_contents (layout_key);

COMMENT ON TABLE product_landing_contents IS 'Structured JSON content for products with custom landing layouts.';

DROP TRIGGER IF EXISTS trg_landing_contents_touch ON product_landing_contents;
CREATE TRIGGER trg_landing_contents_touch
  BEFORE UPDATE ON product_landing_contents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE product_landing_contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS landing_contents_read_public ON product_landing_contents;
CREATE POLICY landing_contents_read_public ON product_landing_contents
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS service_role_all_landing_contents ON product_landing_contents;
CREATE POLICY service_role_all_landing_contents ON product_landing_contents
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
