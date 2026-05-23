-- =============================================================================
-- Admin users linked to Supabase Auth
-- Migration: 005_admin_users.sql
-- =============================================================================

CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

COMMENT ON TABLE admin_users IS 'Users allowed to access the admin panel.';
COMMENT ON COLUMN admin_users.role IS 'admin | editor | viewer';

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_role_all_admin_users
  ON admin_users FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY admin_users_select_self
  ON admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());
