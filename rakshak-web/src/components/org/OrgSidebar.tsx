'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Shield, 
  LayoutGrid, 
  MapPin, 
  Users, 
  ShieldCheck, 
  FileText, 
  CreditCard, 
  Headset, 
  LogOut, 
  Plus,
  X
} from 'lucide-react'
import { useState } from 'react'
import { NewPatrolModal } from './NewPatrolModal'

const navItems = [
  { href: '/org', label: 'Dashboard', icon: LayoutGrid },
  { href: '/org/sites', label: 'Sites', icon: MapPin },
  { href: '/org/supervisors', label: 'Schedules', icon: Users },
  { href: '/org/compliance', label: 'Compliance', icon: ShieldCheck },
  { href: '/org/reports', label: 'Reports', icon: FileText },
  { href: '/org/billing', label: 'Billing', icon: CreditCard },
  { href: '/org/tickets', label: 'Support', icon: Headset },
]

interface OrgSidebarProps {
  userFullName?: string
  avatarUrl?: string | null
  className?: string
  onItemClick?: () => void
  onCloseMobile?: () => void
}

export function OrgSidebar({ 
  userFullName = 'Client Owner', 
  avatarUrl = null,
  className = '', 
  onItemClick,
  onCloseMobile 
}: OrgSidebarProps) {
  const pathname = usePathname()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <aside className={`w-64 glass-panel border-r border-border flex flex-col h-screen sticky top-0 shadow-sm z-30 ${className}`}>
        {/* Brand Header */}
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0 animate-pulse-slow">
              <Shield className="w-5.5 h-5.5 fill-white/20 stroke-white stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-foreground tracking-tight leading-none">
                Rakshak Security
              </h1>
              <p className="text-[11px] font-semibold text-primary mt-1">
                Client Owner Portal
              </p>
            </div>
          </div>

          {/* Close Button for Mobile Drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Primary Call-to-Action */}
        <div className="p-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full relative group overflow-hidden flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            {/* Button Shimmer Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            
            <div className="p-1 bg-white/20 rounded-full">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span>New Patrol</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/org' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/20'
                    : 'text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-primary' : 'text-foreground/50 group-hover:text-foreground'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-scale-in" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Profile & Sign Out */}
        <div className="p-4 border-t border-border space-y-3 bg-black/5 dark:bg-white/5 mt-4 shrink-0">
          <Link href="/org/profile" onClick={onItemClick} className="flex items-center gap-3 px-2 py-1.5 rounded-xl glass-card shadow-xs hover:bg-surface/80 transition-colors">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={userFullName} className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-primary/30" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0 ring-2 ring-emerald-500/20">
                {userFullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{userFullName}</p>
              <span className="inline-block text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                CLIENT OWNER
              </span>
            </div>
          </Link>

          <form action="/auth/logout" method="POST">
            <button 
              type="submit"
              className="flex items-center gap-3 px-3 py-2 w-full text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Quick Action Modal */}
      <NewPatrolModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
