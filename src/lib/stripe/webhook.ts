import 'server-only'
import type Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function handleCheckoutCompleted(event: Stripe.Event) {
  const supabase = getSupabase()
  const session = event.data.object as Stripe.Checkout.Session
  const orgId = session.client_reference_id
  const credits = Number(session.metadata?.credits ?? 0)

  if (!orgId || credits <= 0) return

  // BILL-03: dedup — insert stripe_event_id; UNIQUE constraint catches duplicates
  const { error: dedupError } = await supabase
    .from('stripe_events')
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString(),
    })

  if (dedupError?.code === '23505') {
    // UNIQUE violation = already processed — idempotent return
    return
  }
  if (dedupError) throw dedupError

  // Add credits atomically via RPC
  const { error } = await supabase.rpc('add_credits', {
    p_org_id: orgId,
    p_amount: credits,
    p_reason: 'purchase',
    p_stripe_event_id: event.id,
  })
  if (error) throw error
}

export async function handlePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice
  // Log for admin visibility; no credit action needed
  console.error('[stripe] Payment failed:', invoice.id, invoice.customer)
}
