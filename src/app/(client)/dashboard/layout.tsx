import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Video, CreditCard } from 'lucide-react'
import { CreditMeter } from '@/components/dashboard/CreditMeter'
import { QueryProvider } from '@/components/dashboard/QueryProvider'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/jobs', label: 'My Videos', icon: Video },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    <QueryProvider>
      <div className="flex h-screen bg-zinc-950 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">
          {/* Logo */}
          <div className="h-14 flex items-center px-4 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-50">Clico</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 text-sm transition-colors"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Credit meter at bottom of sidebar */}
          <div className="p-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Balance</p>
            <CreditMeter initialBalance={initialBalance} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </QueryProvider>
  )
}
