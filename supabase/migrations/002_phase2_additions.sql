-- Phase 2 schema additions

-- Unique constraint on job_steps(job_id, step) for upsert idempotency
ALTER TABLE job_steps ADD CONSTRAINT job_steps_job_step_unique UNIQUE (job_id, step);

-- Function to append cost entries to job_steps metadata (for cost-logger.ts)
CREATE OR REPLACE FUNCTION append_step_cost(
  p_job_id UUID,
  p_step TEXT,
  p_cost JSONB
) RETURNS VOID AS $$
BEGIN
  UPDATE job_steps
  SET metadata = COALESCE(metadata, '{}'::jsonb) ||
    jsonb_build_object('costs',
      COALESCE(metadata -> 'costs', '[]'::jsonb) || jsonb_build_array(p_cost)
    )
  WHERE job_id = p_job_id AND step = p_step;
END;
$$ LANGUAGE plpgsql;

-- Partial index for stalled job detection (poller queries by status + started_at)
CREATE INDEX idx_job_steps_stalled ON job_steps(status, started_at)
  WHERE status = 'waiting_external';

-- Service-role bypass policy for worker operations
-- Workers use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS by default
-- Explicit policies for clarity
CREATE POLICY "service_role_bypass" ON job_steps
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_bypass" ON jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_bypass" ON assets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
