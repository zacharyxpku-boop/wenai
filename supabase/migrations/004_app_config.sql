-- app_config: simple key-value store for runtime flags (e.g., daily_spend_cap_reached)
-- Written by daily-spend-cap cron, read by job submission API

CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: only service role writes; no user policy needed (internal config)
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
