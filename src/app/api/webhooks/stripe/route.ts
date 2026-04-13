import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { handleCheckoutCompleted, handlePaymentFailed } from '@/lib/stripe/webhook'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // CRITICAL: use req.text() not req.json() — raw body required for signature verification
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('[stripe] Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // BILL-04: handle relevant event types
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event)
      break
    case 'invoice.payment_failed':
      await handlePaymentFailed(event)
      break
    default:
      // Unhandled event type — acknowledge silently
      break
  }

  return NextResponse.json({ received: true })
}
