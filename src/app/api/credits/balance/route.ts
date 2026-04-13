import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orgId = user.app_metadata?.org_id as string | undefined
  if (!orgId) return NextResponse.json({ error: 'No org associated with user' }, { status: 400 })

  const { data: org } = await supabase
    .from('orgs')
    .select('credit_balance')
    .eq('id', orgId)
    .single()

  return NextResponse.json({ balance: org?.credit_balance ?? 0 })
}
