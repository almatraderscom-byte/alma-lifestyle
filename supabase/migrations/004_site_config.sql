-- =============================================================================
-- Site configuration (homepage, settings) + admin product fields
-- Migration: 004_site_config.sql
-- =============================================================================

CREATE TABLE site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

COMMENT ON TABLE site_config IS 'Key-value JSON config (homepage, settings, etc.).';

CREATE INDEX idx_site_config_key ON site_config (key);

CREATE TRIGGER trg_site_config_updated_at
  BEFORE UPDATE ON site_config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_role_all_site_config
  ON site_config FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY public_read_site_config
  ON site_config FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin-friendly product fields
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS title_bn VARCHAR(255),
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS compare_at_price_bdt DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

CREATE INDEX idx_products_deleted_at ON products (deleted_at) WHERE deleted_at IS NULL;
