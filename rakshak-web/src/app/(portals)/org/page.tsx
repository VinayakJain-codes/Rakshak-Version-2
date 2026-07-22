import { createClient as createServerClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/auth-check'
import { OrgDashboardClient, SiteItem, SystemAlert } from './OrgDashboardClient'

export default async function OrgDashboard() {
  const supabase = await createServerClient()
  const { user, role, tenantId } = await getUserWithRole()

  if (!user || !tenantId) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tenant Account Pending</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No tenant profile is associated with this login. Please contact Rakshak Support or your Administrator.
        </p>
      </div>
    )
  }

  // 1. Fetch Tenant info
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, billing_tier, guard_capacity, site_capacity')
    .eq('id', tenantId)
    .single()

  // 2. Fetch Total Guards count
  const { count: guardsCount } = await supabase
    .from('guards')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  // 3. Fetch Total Sites count
  const { count: sitesCount } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  // 4. Fetch Active Schedules count
  const { count: schedulesCount } = await supabase
    .from('guard_schedules')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  // 5. Fetch Open Incidents count
  const { count: openIncidentsCount } = await supabase
    .from('incidents')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'OPEN')

  // 6. Fetch Raw Sites List
  const { data: rawSites } = await supabase
    .from('sites')
    .select('id, name, address, image_url, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  // 7. Fetch active attendance records for guard counts
  const { data: activeAttendance } = await supabase
    .from('guard_attendance')
    .select('site_id')
    .eq('tenant_id', tenantId)
    .is('clock_out', null)

  // 8. Fetch open incidents list for critical site mapping
  const { data: openIncidents } = await supabase
    .from('incidents')
    .select('site_id')
    .eq('tenant_id', tenantId)
    .eq('status', 'OPEN')

  // 9. Fetch System Alerts / Incident logs feed
  const { data: rawAlerts } = await supabase
    .from('alerts')
    .select('id, title, message, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(5)

  let systemAlerts: SystemAlert[] = []
  if (rawAlerts && rawAlerts.length > 0) {
    systemAlerts = rawAlerts.map(a => ({
      id: a.id,
      title: a.title,
      message: a.message,
      created_at: a.created_at,
    }))
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
        message: inc.description || 'Reported incident requiring attention',
        created_at: inc.created_at,
      }))
    }
  }

  // Aggregate active guard counts per site
  const activeSiteIdCounts: Record<string, number> = {}
  activeAttendance?.forEach(item => {
    if (item.site_id) {
      activeSiteIdCounts[item.site_id] = (activeSiteIdCounts[item.site_id] || 0) + 1
    }
  })

  const criticalSiteIds = new Set(openIncidents?.map(i => i.site_id).filter(Boolean))

  const processedSites: SiteItem[] = (rawSites || []).map((site, index) => {
    const guardsActive = activeSiteIdCounts[site.id] || 0
    const isCritical = criticalSiteIds.has(site.id)

    let status: SiteItem['status'] = 'PENDING'
    if (isCritical) {
      status = 'CRITICAL'
    } else if (guardsActive > 0) {
      status = 'ACTIVE'
    }

    return {
      id: site.id,
      name: site.name,
      address: site.address || 'Address not specified',
      status,
      guardsActive,
      imageUrl: site.image_url,
      createdAt: site.created_at,
    }
  })

  // Calculate dynamic compliance score
  const openIncCount = openIncidentsCount || 0
  const complianceScore = openIncCount > 0 ? Math.max(50, 100 - openIncCount * 10) : 98

  return (
    <OrgDashboardClient
      tenantName={tenant?.name || 'Organization'}
      billingTier={tenant?.billing_tier || 'FREE'}
      guardCapacity={tenant?.guard_capacity || 10}
      siteCapacity={tenant?.site_capacity || 5}
      guardsCount={guardsCount || 0}
      sitesCount={sitesCount || 0}
      schedulesCount={schedulesCount || 0}
      openIncidentsCount={openIncCount}
      complianceScore={complianceScore}
      sites={processedSites}
      systemAlerts={systemAlerts}
    />
  )
}
