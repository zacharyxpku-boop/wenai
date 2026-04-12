-- Clico AI Video Dashboard - Foundation Schema
-- Run via Supabase Dashboard SQL editor or `supabase db push`

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL,
  name        TEXT NOT NULL,
  plan        TEXT NOT NULL DEFAULT 'starter',
  credits     INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE jobs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL,
  client_id           UUID REFERENCES clients(id),
  status              TEXT NOT NULL DEFAULT 'queued',
  product_name        TEXT,
  reference_video_url TEXT,
  storyboard          JSONB,
  delivery_url        TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE job_steps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        UUID REFERENCES jobs(id) ON DELETE CASCADE,
  org_id        UUID NOT NULL,
  step          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  metadata      JSONB,
  output        JSONB,
  error         TEXT,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ
);

CREATE TABLE assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        UUID REFERENCES jobs(id) ON DELETE CASCADE,
  org_id        UUID NOT NULL,
  type          TEXT NOT NULL,
  storage_path  TEXT NOT NULL,
  shot_index    INT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY - Enable on ALL tables (INFRA-04)
-- ============================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TENANT ISOLATION POLICIES (AUTH-03)
-- Default deny: no policy = no access; these policies scope all
-- rows to the authenticated user's org_id from JWT app_metadata
-- ============================================================

CREATE POLICY "tenant_isolation" ON clients
  FOR ALL USING (org_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')::UUID);

CREATE POLICY "tenant_isolation" ON jobs
  FOR ALL USING (org_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')::UUID);

CREATE POLICY "tenant_isolation" ON job_steps
  FOR ALL USING (org_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')::UUID);

CREATE POLICY "tenant_isolation" ON assets
  FOR ALL USING (org_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')::UUID);

-- ============================================================
-- INDEXES - for RLS performance on org_id lookups
-- ============================================================

CREATE INDEX idx_clients_org ON clients(org_id);
CREATE INDEX idx_jobs_org ON jobs(org_id);
CREATE INDEX idx_job_steps_org ON job_steps(org_id);
CREATE INDEX idx_assets_org ON assets(org_id);
CREATE INDEX idx_job_steps_job ON job_steps(job_id);
CREATE INDEX idx_assets_job ON assets(job_id);

-- ============================================================
-- UPDATED_AT TRIGGER for jobs table
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ATOMIC CREDIT DEDUCTION FUNCTION (BILL-02 schema setup)
-- Single atomic Postgres UPDATE prevents race conditions
-- ============================================================

CREATE OR REPLACE FUNCTION deduct_credits(p_org_id UUID, p_cost INT)
RETURNS INT AS $$
DECLARE new_balance INT;
BEGIN
  UPDATE clients SET credits = credits - p_cost
  WHERE org_id = p_org_id AND credits >= p_cost
  RETURNING credits INTO new_balance;
  IF NOT FOUND THEN RAISE EXCEPTION 'insufficient_credits'; END IF;
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;
