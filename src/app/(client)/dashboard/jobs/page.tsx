import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VideoLibrary } from '@/components/dashboard/VideoLibrary'

export default async function JobsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const orgId = user.app_metadata?.org_id as string | undefined

  let jobs: Array<{
    id: string
    product_name: string
    status: string
    created_at: string
    delivery_url: string | null
  }> = []

  if (orgId) {
    const { data } = await supabase
      .from('jobs')
      .select('id, product_name, status, created_at, delivery_url')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(20)
    jobs = data ?? []
  }

  return (
    <>
      <header className="h-14 border-b border-zinc-800 flex items-center px-6 sticky top-0 bg-zinc-950/80 backdrop-blur-sm z-10">
        <h1 className="text-base font-semibold text-zinc-50">My Videos</h1>
      </header>

      <div className="p-6">
        <VideoLibrary jobs={jobs} />
      </div>
    </>
  )
}
