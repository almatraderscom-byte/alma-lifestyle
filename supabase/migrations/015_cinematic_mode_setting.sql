-- Cinematic homepage killswitch (site_config key-value)
INSERT INTO site_config (key, value)
VALUES ('cinematic_mode_enabled', '"true"'::jsonb)
ON CONFLICT (key) DO NOTHING;
