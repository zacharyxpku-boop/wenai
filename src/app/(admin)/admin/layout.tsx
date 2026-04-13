import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Kanban, Activity, BarChart2 } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/kanban', label: 'SOP Board', icon: Kanban },
  { href: '/admin/queues', label: 'Queue Health', icon: Activity },
  { href: '/admin/quality', label: 'Quality', icon: BarChart2 },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.app_metadata?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        {/* Logo + admin badge */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800">
          <span className="text-sm font-semibold text-zinc-50">Clico</span>
          <span className="text-xs font-medium bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded">
            Admin
          </span>
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
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
