-- Alma Lifestyle — ERP order sync tracking columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS erp_order_id TEXT,
  ADD COLUMN IF NOT EXISTS erp_sync_status TEXT
    CHECK (erp_sync_status IS NULL OR erp_sync_status IN ('pending', 'synced', 'failed')),
  ADD COLUMN IF NOT EXISTS erp_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_erp_order_id ON orders(erp_order_id);
