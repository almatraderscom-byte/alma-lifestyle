-- =============================================================================
-- Credential-based admin users (replaces auth.users-linked admin_users from 005)
-- Migration: 012_admin_users.sql
-- Run in Supabase SQL Editor after deploy.
-- Default owner password: TempPassword123! — change immediately after first login.
-- =============================================================================

DROP POLICY IF EXISTS admin_users_select_self ON admin_users;
DROP POLICY IF EXISTS service_role_all_admin_users ON admin_users;
DROP TABLE IF EXISTS admin_users;

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES admin_users (id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE admin_users IS 'Admin panel users with bcrypt passwords and role-based access.';

CREATE INDEX idx_admin_users_email ON admin_users (email) WHERE active = TRUE;

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_role_all_admin_users
  ON admin_users FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE admin_audit_log
  ADD COLUMN IF NOT EXISTS performed_by_id UUID REFERENCES admin_users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS performed_by_email TEXT,
  ADD COLUMN IF NOT EXISTS performed_by_name TEXT;

CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by_id
  ON admin_audit_log (performed_by_id);

-- Initial owner (Maruf) — bcrypt hash for TempPassword123!
INSERT INTO admin_users (email, password_hash, name, role, active)
VALUES (
  'maruf@almatraders.com',
  '$2b$10$KpY/XmrCkxFK0XMQ/nuRouCG8FvVZ6lEaJv5VXBj.M8FWXHxGB/wu',
  'Maruf Chowdhury',
  'owner',
  TRUE
) ON CONFLICT (email) DO NOTHING;
