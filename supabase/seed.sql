-- =============================================================================
-- Alma Lifestyle — Development seed data
-- Run after 001_initial_schema.sql (and optionally 002_rls_policies.sql)
-- =============================================================================

-- Brand
INSERT INTO brands (slug, name, description, active)
VALUES (
  'alma-lifestyle',
  'Alma Lifestyle',
  'Premium Punjabi fashion ecommerce for Bangladesh and UAE.',
  true
)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  updated_at = now();

-- Categories
INSERT INTO categories (brand_id, slug, name, display_order, active)
VALUES
  (
    (SELECT id FROM brands WHERE slug = 'alma-lifestyle'),
    'panjabi',
    'Panjabi',
    1,
    true
  ),
  (
    (SELECT id FROM brands WHERE slug = 'alma-lifestyle'),
    'electronics',
    'Electronics',
    2,
    true
  ),
  (
    (SELECT id FROM brands WHERE slug = 'alma-lifestyle'),
    'accessories',
    'Accessories',
    3,
    true
  ),
  (
    (SELECT id FROM brands WHERE slug = 'alma-lifestyle'),
    'home-decor',
    'Home & Decor',
    4,
    true
  )
ON CONFLICT (brand_id, slug) DO UPDATE
SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  active = EXCLUDED.active,
  updated_at = now();

-- Collections (published)
INSERT INTO collections (
  brand_id,
  slug,
  name,
  description,
  sort_order,
  published,
  published_at
)
VALUES
  (
    (SELECT id FROM brands WHERE slug = 'alma-lifestyle'),
    'new-arrivals',
    'New Arrivals',
    'Latest drops and fresh styles.',
    1,
    true,
    now()
  ),
  (
    (SELECT id FROM brands WHERE slug = 'alma-lifestyle'),
    'best-sellers',
    'Best Sellers',
    'Customer favorites and top-performing pieces.',
    2,
    true,
    now()
  )
ON CONFLICT (brand_id, slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  published = EXCLUDED.published,
  published_at = COALESCE(collections.published_at, EXCLUDED.published_at),
  updated_at = now();

-- Site config (settings only; homepage uses app defaults until admin saves)
INSERT INTO site_config (key, value)
VALUES
  (
    'settings',
    jsonb_build_object(
      'storeName', 'ALMA Lifestyle',
      'currency', 'BDT',
      'updatedAt', now()
    )
  )
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  updated_at = now();
