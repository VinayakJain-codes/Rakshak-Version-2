'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Settings, 
  Menu, 
  Calendar, 
  BellOff,
  User,
  LogOut
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'
import { OrgSidebar } from './OrgSidebar'

interface SystemAlertItem {
  id: string
  title: string
  message: string
  created_at: string
}

interface OrgTopNavProps {
  userFullName?: string
  avatarUrl?: string | null
  systemAlerts?: SystemAlertItem[]
}

export function OrgTopNav({ 
  userFullName = 'Client Owner', 
  avatarUrl = null,
  systemAlerts = [] 
}: OrgTopNavProps) {
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
              placeholder="Search assets, sites, or guards..."
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
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-black/5 dark:bg-white/5 text-xs font-semibold text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer">
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
              {systemAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl p-4 z-50 animate-scale-in">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">System Alerts</h4>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">Live Monitor</span>
                </div>
                <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto">
                  {systemAlerts.length > 0 ? (
                    systemAlerts.map(alert => (
                      <div key={alert.id} className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border text-xs">
                        <div className="font-bold text-foreground">{alert.title}</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{alert.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{new Date(alert.created_at).toLocaleString()}</div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                      <BellOff className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                      <p>No active system alerts</p>
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
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Tenant Owner</div>
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl p-2 z-50 shadow-2xl border border-border animate-fade-in-up origin-top-right">
                <div className="px-3 py-2 border-b border-border/50">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userFullName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Client Owner Account</p>
                </div>
                <div className="py-1 space-y-0.5">
                  <Link 
                    href="/org/profile" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4 text-emerald-500" /> Personal Profile
                  </Link>
                  <Link 
                    href="/org/billing" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4 text-teal-500" /> Billing & Plan
                  </Link>
                  <Link 
                    href="/org/tickets" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-emerald-500" /> Support & Help
                  </Link>
                </div>
                <div className="pt-1 border-t border-border/50">
                  <form action="/auth/logout" method="POST">
                    <button 
                      type="submit"
                      className="flex items-center gap-3 px-3 py-2 w-full text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Opaque Blurred Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Opaque Solid Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-surface-opaque h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <OrgSidebar 
              userFullName={userFullName} 
              className="w-full border-r-0 h-full" 
              onItemClick={() => setIsMobileMenuOpen(false)}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
