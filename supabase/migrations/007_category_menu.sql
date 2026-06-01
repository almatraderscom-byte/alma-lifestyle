-- Navigation menu controls for categories
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS show_in_menu BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN categories.show_in_menu IS 'When true, category appears in storefront header navigation.';

CREATE INDEX IF NOT EXISTS idx_categories_menu
  ON categories (brand_id, active, show_in_menu, display_order);
