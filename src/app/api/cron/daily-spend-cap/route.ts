import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client — cron has no user session
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const DAILY_BUDGET_USD = Number(process.env.DAILY_AI_BUDGET_USD ?? 100)

export async function GET(req: NextRequest) {
  // Verify cron secret — Vercel passes this in the Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Aggregate today's AI spend from job_steps (UTC day boundary)
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('job_steps')
    .select('cost_usd')
    .gte('created_at', todayStart.toISOString())
    .not('cost_usd', 'is', null)

  if (error) throw error

  const totalSpend = (data ?? []).reduce((sum, row) => sum + (row.cost_usd ?? 0), 0)
  const threshold = DAILY_BUDGET_USD * 0.8  // BILL-06: cap at 80%

  const capReached = totalSpend >= threshold

  // Upsert config row — job submission API reads this before accepting new jobs
  const { error: upsertError } = await supabase
    .from('app_config')
    .upsert(
      {
        key: 'daily_spend_cap_reached',
        value: String(capReached),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' },
    )

  if (upsertError) throw upsertError

  const response = {
    totalSpend: Math.round(totalSpend * 100) / 100,
    daily_budget: DAILY_BUDGET_USD,
    threshold: Math.round(threshold * 100) / 100,
    capReached,
  }

  if (capReached) {
    console.warn('[spend-cap] Daily spend cap reached!', response)
  }

  return NextResponse.json(response)
}
