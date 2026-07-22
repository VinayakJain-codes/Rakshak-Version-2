'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LineChart, Building2, Headset, FileText, LogOut, ShieldCheck } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Real-Time MRR/ARR', icon: LineChart },
  { href: '/admin/clients', label: 'Tenant Registration', icon: Building2 },
  { href: '/admin/tickets', label: 'Global Support Queues', icon: Headset },
  { href: '/admin/audit', label: 'System-Wide Audit Log', icon: FileText },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-screen sticky top-0 shadow-sm">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Rakshak Admin</h1>
        <p className="text-xs font-medium text-muted-foreground mt-0.5">System Oversight</p>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-4">
        <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>SUPER ADMIN</span>
        </div>
        <form action="/auth/logout" method="POST">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Log out</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
