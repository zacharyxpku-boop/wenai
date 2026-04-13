import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JobSubmitForm } from '@/components/dashboard/JobSubmitForm'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const orgId = user.app_metadata?.org_id as string | undefined
  let initialBalance = 0
  if (orgId) {
    const { data: org } = await supabase
      .from('orgs')
      .select('credit_balance')
      .eq('id', orgId)
      .single()
    initialBalance = org?.credit_balance ?? 0
  }

  return (
    <>
      <header className="h-14 border-b border-zinc-800 flex items-center px-6 sticky top-0 bg-zinc-950/80 backdrop-blur-sm z-10">
        <h1 className="text-base font-semibold text-zinc-50">New Job</h1>
      </header>

      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-zinc-400 mb-6">
            Submit a product video generation job. We&apos;ll clone the viral structure of your reference TikTok onto your product.
          </p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <JobSubmitForm initialBalance={initialBalance} />
          </div>
        </div>
      </div>
    </>
  )
}
