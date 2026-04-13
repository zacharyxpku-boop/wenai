-- Phase 3: Billing, SOP, and observability schema additions

-- 1. Add sop_stage column to jobs (ADMIN-06)
ALTER TABLE jobs ADD COLUMN sop_stage text NOT NULL DEFAULT 'client';
-- Valid values: client, brief, generation, qc, delivered

-- 2. Stripe events dedup table (BILL-03)
CREATE TABLE stripe_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id text NOT NULL UNIQUE,  -- Stripe's event.id
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: only service role can write stripe_events (webhook handler uses service role)
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
-- No user-facing policy needed; service role bypasses RLS

-- 3. Credit transactions audit table (BILL-02, BILL-05)
CREATE TABLE credit_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES orgs(id),
  delta int NOT NULL,           -- positive = add, negative = deduct
  reason text NOT NULL,         -- 'job_submission', 'refund', 'purchase', 'manual_adjustment'
  job_id uuid REFERENCES jobs(id),  -- nullable; only set for job-related transactions
  stripe_event_id text,         -- nullable; only set for purchase transactions
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can read own credit transactions"
  ON credit_transactions FOR SELECT
  USING (org_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid);

-- 4. Atomic credit deduction RPC (BILL-02)
CREATE OR REPLACE FUNCTION deduct_credits(p_org_id uuid, p_amount int)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance int;
BEGIN
  UPDATE orgs
  SET credit_balance = credit_balance - p_amount
  WHERE id = p_org_id AND credit_balance >= p_amount
  RETURNING credit_balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  INSERT INTO credit_transactions(org_id, delta, reason, created_at)
  VALUES (p_org_id, -p_amount, 'job_submission', now());

  RETURN v_new_balance;
END;
$$;

-- 5. Atomic credit addition RPC (BILL-05 refund, BILL-03 purchase)
CREATE OR REPLACE FUNCTION add_credits(p_org_id uuid, p_amount int, p_reason text DEFAULT 'purchase', p_stripe_event_id text DEFAULT NULL)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance int;
BEGIN
  UPDATE orgs
  SET credit_balance = credit_balance + p_amount
  WHERE id = p_org_id
  RETURNING credit_balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'org_not_found';
  END IF;

  INSERT INTO credit_transactions(org_id, delta, reason, stripe_event_id, created_at)
  VALUES (p_org_id, p_amount, p_reason, p_stripe_event_id, now());

  RETURN v_new_balance;
END;
$$;

-- 6. Add parent_job_id to jobs for regeneration lineage (CLI-05)
ALTER TABLE jobs ADD COLUMN parent_job_id uuid REFERENCES jobs(id);

-- 7. Index for daily cost aggregation (BILL-06)
CREATE INDEX idx_job_steps_created_cost ON job_steps(created_at, cost_usd) WHERE cost_usd IS NOT NULL;
