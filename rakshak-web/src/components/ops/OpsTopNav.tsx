'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Bell, 
  Menu, 
  Calendar, 
  BellOff,
  User,
  ShieldAlert
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'
import { OpsSidebar } from './OpsSidebar'

interface AlertItem {
  id: string
  guard_name: string
  description: string
  severity: string
  created_at: string
}

interface OpsTopNavProps {
  userFullName?: string
  avatarUrl?: string | null
  alerts?: AlertItem[]
}

export function OpsTopNav({ 
  userFullName = 'Supervisor', 
  avatarUrl = null,
  alerts = [] 
}: OpsTopNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [time, setTime] = useState('')
  const [showNotifMenu, setShowNotifMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const currentDateHeader = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <header className="h-16 glass-panel border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shadow-sm">
        {/* Left: Mobile Menu Toggle & Search Bar */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>

          {/* Search Input Container */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guards, schedules, alerts, or signals..."
              className="w-full pl-9 pr-12 py-2 text-xs sm:text-sm bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            />
            <div className="hidden sm:flex items-center gap-1 absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              ⌘K
            </div>
          </div>
        </div>

        {/* Right Section Controls */}
        <div className="flex items-center gap-2 sm:gap-3 ml-2">
          {/* Date Selector Pill (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-black/5 dark:bg-white/5 text-xs font-semibold text-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span suppressHydrationWarning>{currentDateHeader}</span>
          </div>

          {/* Live Clock Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{time || 'LIVE'}</span>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifMenu(!showNotifMenu); setShowUserMenu(false); }}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl p-4 z-50 animate-scale-in">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Field Alerts Stream</h4>
                  <span className="text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                    {alerts.length} Active
                  </span>
                </div>
                <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto">
                  {alerts.length > 0 ? (
                    alerts.map(a => (
                      <Link 
                        key={a.id} 
                        href="/ops/alerts" 
                        onClick={() => setShowNotifMenu(false)}
                        className="block p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-primary/5 border border-border text-xs transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground truncate">{a.guard_name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">{a.severity}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">{a.description}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{new Date(a.created_at).toLocaleTimeString()}</div>
                      </Link>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                      <BellOff className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                      <p>All emergency channels clear</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Avatar Pill with Dropdown */}
          <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifMenu(false); }}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={userFullName} className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-primary/30" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0 ring-2 ring-emerald-500/20">
                  {userFullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left pr-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{userFullName}</div>
                <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">Field Supervisor</div>
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl p-2 z-50 shadow-2xl border border-border animate-fade-in-up origin-top-right">
                <div className="px-3 py-2 border-b border-border/50">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userFullName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Supervisor Account</p>
                </div>
                <div className="py-1 space-y-0.5">
                  <Link 
                    href="/ops/guards" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4 text-emerald-500" /> Guard Roster
                  </Link>
                  <Link 
                    href="/ops/alerts" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-500" /> Open Alerts
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <OpsSidebar 
            userFullName={userFullName} 
            avatarUrl={avatarUrl} 
            onItemClick={() => setIsMobileMenuOpen(false)}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            className="relative z-10 w-72 h-full"
          />
        </div>
      )}
    </>
  )
}
