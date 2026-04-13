import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { CREDIT_PACKS } from '@/lib/stripe/packs'
import { z } from 'zod'

const checkoutSchema = z.object({
  packId: z.enum(['starter', 'pro', 'agency']),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })

  const pack = CREDIT_PACKS[parsed.data.packId]
  const orgId = user.app_metadata?.org_id as string | undefined

  if (!orgId) {
    return NextResponse.json({ error: 'No org associated with user' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',  // BILL-01: one-time credit pack, NOT subscription
    line_items: [{ price: pack.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing`,
    client_reference_id: orgId,
    metadata: {
      orgId,
      credits: String(pack.credits),
      packId: parsed.data.packId,
    },
  })

  return NextResponse.json({ url: session.url })
}
