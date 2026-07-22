import { createClient as createServerClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getUserWithRole } from '@/utils/auth-check'
import { OrgSidebar } from '@/components/org/OrgSidebar'
import { OrgTopNav } from '@/components/org/OrgTopNav'
import { OrgMobileBottomNav } from '@/components/org/OrgMobileBottomNav'

export default async function OrgLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const { user, role, tenantId } = await getUserWithRole()

  if (!user || role !== 'CLIENT_OWNER') {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Fetch real system alerts for top nav
  const { data: rawAlerts } = await supabase
    .from('alerts')
    .select('id, title, message, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(5)

  let systemAlerts: Array<{ id: string; title: string; message: string; created_at: string }> = []
  if (rawAlerts && rawAlerts.length > 0) {
    systemAlerts = rawAlerts
  } else {
    const { data: recentIncidents } = await supabase
      .from('incidents')
      .select('id, type, description, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentIncidents && recentIncidents.length > 0) {
      systemAlerts = recentIncidents.map(inc => ({
        id: inc.id,
        title: `Incident: ${inc.type}`,
        message: inc.description || 'Reported incident',
        created_at: inc.created_at,
      }))
    }
  }

  const fullName = profile?.full_name || 'Client Owner'
  const avatarUrl = profile?.avatar_url || null

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row antialiased selection:bg-primary/20">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0">
        <OrgSidebar userFullName={fullName} avatarUrl={avatarUrl} />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 lg:pb-0">
        {/* Top Header Navigation */}
        <OrgTopNav userFullName={fullName} avatarUrl={avatarUrl} systemAlerts={systemAlerts} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>

      {/* Touch-Friendly Mobile Bottom Navigation Bar */}
      <OrgMobileBottomNav />
    </div>
  )
}
