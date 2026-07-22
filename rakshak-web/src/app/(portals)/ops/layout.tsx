import { createClient as createServerClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getUserWithRole } from '@/utils/auth-check'
import { OpsSidebar } from '@/components/ops/OpsSidebar'
import { OpsTopNav } from '@/components/ops/OpsTopNav'

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { user, role, tenantId } = await getUserWithRole()

  if (!user || !['SUPERVISOR', 'CLIENT_OWNER'].includes(role)) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const { data: openAlerts } = await supabase
    .from('alerts')
    .select('id, guard_name, description, severity, created_at')
    .eq('tenant_id', tenantId)
    .eq('status', 'OPEN')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row antialiased selection:bg-primary/20">
      {/* Desktop Fixed Sidebar */}
      <OpsSidebar 
        userFullName={profile?.full_name || 'Supervisor'} 
        avatarUrl={profile?.avatar_url || null}
        className="hidden lg:flex"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <OpsTopNav 
          userFullName={profile?.full_name || 'Supervisor'} 
          avatarUrl={profile?.avatar_url || null}
          alerts={openAlerts || []}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  )
}
