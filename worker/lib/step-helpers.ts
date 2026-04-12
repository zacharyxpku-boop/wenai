import { supabase } from './supabase.js'

export async function updateStepStatus(
  jobId: string,
  orgId: string,
  stepName: string,
  status: 'pending' | 'running' | 'complete' | 'failed' | 'waiting_external',
  data?: { metadata?: Record<string, unknown>; output?: Record<string, unknown>; error?: string },
) {
  const update: Record<string, unknown> = { status }
  if (status === 'running') update.started_at = new Date().toISOString()
  if (status === 'complete' || status === 'failed') update.completed_at = new Date().toISOString()
  if (data?.metadata) update.metadata = data.metadata
  if (data?.output) update.output = data.output
  if (data?.error) update.error = data.error

  await supabase
    .from('job_steps')
    .update(update)
    .eq('job_id', jobId)
    .eq('step', stepName)
}

export async function ensureStepExists(
  jobId: string,
  orgId: string,
  stepName: string,
) {
  await supabase
    .from('job_steps')
    .upsert(
      { job_id: jobId, org_id: orgId, step: stepName, status: 'pending' },
      { onConflict: 'job_id,step', ignoreDuplicates: true },
    )
}

export async function broadcastProgress(
  jobId: string,
  step: string,
  status: string,
  progress?: number,
  total?: number,
) {
  await supabase.channel(`job:${jobId}`).send({
    type: 'broadcast',
    event: 'step_update',
    payload: { step, status, progress, total },
  })
}

export async function logGenerationParams(
  jobId: string,
  stepName: string,
  params: Record<string, unknown>,
) {
  // QC-02: log prompt, seed, model version for reproducibility
  const { data: step } = await supabase
    .from('job_steps')
    .select('metadata')
    .eq('job_id', jobId)
    .eq('step', stepName)
    .single()
  const existing = (step?.metadata as object) ?? {}
  await supabase
    .from('job_steps')
    .update({ metadata: { ...existing, generation_params: params } })
    .eq('job_id', jobId)
    .eq('step', stepName)
}
