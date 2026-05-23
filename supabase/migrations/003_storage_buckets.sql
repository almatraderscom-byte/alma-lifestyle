-- =============================================================================
-- Storage buckets for product and homepage images
-- Migration: 003_storage_buckets.sql
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'product-images',
    'product-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  (
    'homepage-images',
    'homepage-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  )
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read
CREATE POLICY storage_public_read_product_images
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY storage_public_read_homepage_images
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'homepage-images');

-- Authenticated upload/update/delete
CREATE POLICY storage_auth_upload_product_images
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY storage_auth_update_product_images
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY storage_auth_delete_product_images
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY storage_auth_upload_homepage_images
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'homepage-images');

CREATE POLICY storage_auth_update_homepage_images
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'homepage-images');

CREATE POLICY storage_auth_delete_homepage_images
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'homepage-images');

-- Service role full access
CREATE POLICY storage_service_role_all
  ON storage.objects FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
