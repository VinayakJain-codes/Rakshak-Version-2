'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, MapPin, Users, ShieldCheck, Headset } from 'lucide-react'

const mobileNavItems = [
  { href: '/org', label: 'Dashboard', icon: LayoutGrid },
  { href: '/org/sites', label: 'Sites', icon: MapPin },
  { href: '/org/supervisors', label: 'Schedules', icon: Users },
  { href: '/org/compliance', label: 'Compliance', icon: ShieldCheck },
  { href: '/org/tickets', label: 'Support', icon: Headset },
]

export function OrgMobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border/80 lg:hidden px-2 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/org' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all ${
                isActive
                  ? 'text-primary font-bold bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
