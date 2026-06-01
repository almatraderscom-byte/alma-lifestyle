-- Customer account helpers (Supabase Auth id = customers.id)
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS default_shipping_address JSONB;

COMMENT ON COLUMN customers.default_shipping_address IS 'Saved delivery address for logged-in checkout.';

CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders (customer_phone);
