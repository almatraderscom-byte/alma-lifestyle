-- Persistent log of every email / WhatsApp notification attempt (success or failure)

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  notification_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,

  success BOOLEAN NOT NULL,
  error_message TEXT,
  provider_response JSONB,
  provider_message_id TEXT,

  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  triggered_by TEXT,

  from_email TEXT,
  has_api_key BOOLEAN,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  attempted_at_date DATE GENERATED ALWAYS AS ((created_at AT TIME ZONE 'UTC')::date) STORED
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at
  ON notification_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_logs_order_id
  ON notification_logs(order_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_success
  ON notification_logs(success);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on notification_logs"
  ON notification_logs FOR ALL
  USING (auth.role() = 'service_role');
