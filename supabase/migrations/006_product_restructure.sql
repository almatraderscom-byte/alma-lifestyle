-- =============================================================================
-- Matching family panjabi design groups + product types
-- Migration: 006_product_restructure.sql
-- =============================================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) NOT NULL DEFAULT 'simple';

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS design_group_id UUID REFERENCES products (id) ON DELETE SET NULL;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS design_group_name VARCHAR(255);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS age_group VARCHAR(20);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN products.product_type IS 'simple | men_panjabi | boy_panjabi | women_three_piece | girl_two_piece';
COMMENT ON COLUMN products.design_group_id IS 'Shared ID for matching family designs (typically men''s product id).';
COMMENT ON COLUMN products.design_group_name IS 'Bangla/English design label shared across matching SKUs.';
COMMENT ON COLUMN products.age_group IS 'girl_two_piece only: 1-5, 6-9, 10-14';

CREATE INDEX IF NOT EXISTS idx_products_design_group ON products (design_group_id);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products (product_type);

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_product_type_check;

ALTER TABLE products
  ADD CONSTRAINT products_product_type_check
  CHECK (
    product_type IN (
      'simple',
      'men_panjabi',
      'boy_panjabi',
      'women_three_piece',
      'girl_two_piece'
    )
  );
