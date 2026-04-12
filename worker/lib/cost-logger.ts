import { supabase } from './supabase.js'

interface CostEntry {
  model: string
  inputTokens?: number
  outputTokens?: number
  videoSeconds?: number
  estimatedCostUsd?: number
}

export async function logCost(jobId: string, stepName: string, cost: CostEntry) {
  // Try RPC first for atomic append
  const { error } = await supabase.rpc('append_step_cost', {
    p_job_id: jobId,
    p_step: stepName,
    p_cost: cost,
  })
  // Fallback: direct metadata update if RPC not available
  if (error) {
    const { data: step } = await supabase
      .from('job_steps')
      .select('metadata')
      .eq('job_id', jobId)
      .eq('step', stepName)
      .single()
    const existing = (step?.metadata as any)?.costs ?? []
    await supabase
      .from('job_steps')
      .update({ metadata: { ...(step?.metadata as object), costs: [...existing, cost] } })
      .eq('job_id', jobId)
      .eq('step', stepName)
  }
}
