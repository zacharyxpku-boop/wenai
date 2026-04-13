import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS for cross-org aggregation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// QC-06: Nightly reconciliation — compares org balances vs credit transaction history
export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Sum of all purchase credit transactions (credits sold via Stripe)
  const { data: purchaseTx } = await supabase
    .from('credit_transactions')
    .select('delta')
    .eq('reason', 'purchase')

  const totalPurchased = (purchaseTx ?? []).reduce((sum, r) => sum + (r.delta ?? 0), 0)

  // Net of all credit deltas: purchases (+) + deductions (-) + refunds (+)
  const { data: allTx } = await supabase
    .from('credit_transactions')
    .select('delta')

  const netCredits = (allTx ?? []).reduce((sum, r) => sum + (r.delta ?? 0), 0)

  // Sum of current credit balances across all orgs
  const { data: orgs } = await supabase
    .from('orgs')
    .select('credit_balance')

  const totalBalance = (orgs ?? []).reduce((sum, o) => sum + (o.credit_balance ?? 0), 0)

  // Reconcile: org balances should equal net credit transactions
  const mismatch = Math.abs(totalBalance - netCredits)
  const ok = mismatch === 0

  const result = {
    totalPurchased,
    netCredits,
    totalBalance,
    mismatch,
    ok,
    checkedAt: new Date().toISOString(),
  }

  if (!ok) {
    console.error('[reconciliation] MISMATCH detected!', result)
    // TODO: send alert via Resend email when mismatch > threshold
  } else {
    console.log('[reconciliation] OK — balances match', { netCredits, totalBalance, checkedAt: result.checkedAt })
  }

  return NextResponse.json(result)
}
