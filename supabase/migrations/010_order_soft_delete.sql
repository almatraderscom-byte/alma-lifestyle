-- Order soft delete (archive) + admin audit log
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS archived_by TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_archived_at
ON orders(archived_at)
WHERE archived_at IS NULL;

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_data JSONB,
  performed_by TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON admin_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_at ON admin_audit_log(performed_at DESC);
