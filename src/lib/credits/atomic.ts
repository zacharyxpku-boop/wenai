import { SupabaseClient } from '@supabase/supabase-js'

export async function deductCredits(
  supabase: SupabaseClient,
  orgId: string,
  amount: number,
): Promise<{ balance: number } | { error: 'insufficient_credits' }> {
  const { data, error } = await supabase.rpc('deduct_credits', {
    p_org_id: orgId,
    p_amount: amount,
  })

  if (error) {
    if (error.message.includes('insufficient_credits')) {
      return { error: 'insufficient_credits' }
    }
    throw error
  }

  return { balance: data }
}

export async function refundCredits(
  supabase: SupabaseClient,
  orgId: string,
  amount: number,
): Promise<{ balance: number }> {
  const { data, error } = await supabase.rpc('add_credits', {
    p_org_id: orgId,
    p_amount: amount,
    p_reason: 'refund',
  })

  if (error) throw error
  return { balance: data }
}
