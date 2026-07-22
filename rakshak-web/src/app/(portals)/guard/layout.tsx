import { getAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserWithRole } from '@/utils/auth-check'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ShieldCheck, LayoutDashboard, Bell, ShieldAlert, LogOut, User } from 'lucide-react'

export default async function GuardLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getUserWithRole()

  if (!user || role !== 'GUARD') {
    redirect('/auth/login')
  }

  const adminClient = getAdminClient()
  const { data: profile } = await adminClient.from('profiles').select('full_name').eq('id', user.id).single()

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col pb-20 sm:pb-8">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/80 px-4 sm:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-primary uppercase block leading-none">Rakshak Security</span>
              <h1 className="text-sm font-black text-foreground">{profile?.full_name || 'Security Officer'}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-border text-xs font-bold">
              <Link href="/guard" className="px-3 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all text-foreground">
                Dashboard
              </Link>
              <Link href="/guard/notifications" className="px-3 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all text-foreground">
                Signals
              </Link>
              <Link href="/guard/alerts" className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                Raise Alert
              </Link>
            </div>

            <ThemeToggle />

            <form action="/auth/logout" method="POST">
              <button 
                type="submit" 
                title="Sign Out"
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-8 py-6 flex-1">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-lg border-t border-border px-6 py-2.5 flex items-center justify-around">
        <Link href="/guard" className="flex flex-col items-center gap-1 text-primary">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">Duties</span>
        </Link>
        <Link href="/guard/notifications" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-bold">Signals</span>
        </Link>
        <Link href="/guard/alerts" className="flex flex-col items-center gap-1 text-red-500">
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[10px] font-bold">SOS</span>
        </Link>
      </nav>
    </div>
  )
}
