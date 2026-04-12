import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.app_metadata?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="mt-2 text-gray-600">Operations dashboard</p>
    </div>
  )
}
