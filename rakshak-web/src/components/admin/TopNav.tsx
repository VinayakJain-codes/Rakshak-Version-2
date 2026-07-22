'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Search, Bell, Settings, Home, ChevronRight } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'

export function AdminTopNav() {
  const pathname = usePathname()
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }) + ' IST')
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Generate breadcrumbs from pathname
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = segments.map((segment, index) => {
    // Capitalize first letter
    const title = segment.charAt(0).toUpperCase() + segment.slice(1)
    const href = '/' + segments.slice(0, index + 1).join('/')
    return { title: title === 'Admin' ? 'Admin' : title === 'Clients' ? 'Tenants' : title, href }
  })

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
      <div className="flex items-center gap-4">
        <button className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-foreground/5 transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        
        <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/admin" className="hover:text-foreground transition-colors flex items-center">
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              <Link 
                href={crumb.href} 
                className={`transition-colors ${i === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'hover:text-foreground'}`}
              >
                {crumb.title}
              </Link>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden lg:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Global system search..."
            className="w-64 pl-9 pr-4 py-2 text-sm bg-foreground/5 border border-border/50 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all"
          />
        </div>

        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-foreground/5 border border-border/50 rounded-full">
          <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
          <span className="text-xs font-medium font-mono text-foreground">{time}</span>
        </div>

        <div className="flex items-center gap-2 ml-2">
          <ThemeToggle />
          <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-foreground/5 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
          </button>
          <Link href="/admin/settings" className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-foreground/5 transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold ml-2 shrink-0 border border-primary/30">
            RS
          </div>
        </div>
      </div>
    </header>
  )
}
