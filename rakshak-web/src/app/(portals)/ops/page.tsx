import { getAdminClient } from '@/utils/supabase/admin'
import { getUserWithRole } from '@/utils/auth-check'
import Link from 'next/link'
import { 
  Users, 
  ShieldAlert, 
  Clock, 
  Building2, 
  ArrowUpRight, 
  Radio, 
  Plus, 
  CheckCircle2,
  Calendar,
  AlertTriangle,
  UserCheck
} from 'lucide-react'
import ResolveAlertButton from './alerts/ResolveAlertButton'

export default async function OpsDashboard() {
  const { tenantId } = await getUserWithRole()
  const adminClient = getAdminClient()

  const [guardsRes, alertsRes, schedulesRes, sitesRes] = await Promise.all([
    adminClient.from('guards').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    adminClient.from('alerts').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'OPEN'),
    adminClient.from('guard_schedules').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_completed', false),
    adminClient.from('sites').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
  ])

  const { data: recentAlerts } = await adminClient
    .from('alerts')
    .select('id, guard_name, description, severity, status, created_at, sites(name)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: activeGuards } = await adminClient
    .from('guards')
    .select(`
      id,
      shift_status,
      profiles:profile_id (full_name)
    `)
    .eq('tenant_id', tenantId)
    .limit(6)

  const guardsCount = guardsRes.count ?? 0
  const openAlertsCount = alertsRes.count ?? 0
  const pendingSchedulesCount = schedulesRes.count ?? 0
  const sitesCount = sitesRes.count ?? 0

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Operations Dashboard</h1>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
            Real-time command center for guard tracking, field alerts, and shift schedules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/ops/ping"
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Send Signal</span>
          </Link>
          <Link
            href="/ops/schedule"
            className="px-4 py-2.5 bg-surface text-foreground hover:bg-surface/80 border border-border font-bold text-xs rounded-2xl transition-all shadow-xs flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-primary" />
            <span>New Schedule</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Guards Card */}
        <div className="group glass-card rounded-3xl p-6 transition-all duration-300 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Guards
            </span>
          </div>
          <div className="mt-6">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              TOTAL GUARDS
            </div>
            <div className="text-3xl font-extrabold text-foreground mt-1 tracking-tight">
              {guardsCount}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>

        {/* Open Alerts Card */}
        <div className={`group glass-card rounded-3xl p-6 transition-all duration-300 relative overflow-hidden ${openAlertsCount > 0 ? 'border-red-500/40 bg-red-500/5' : ''}`}>
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-2xl ${openAlertsCount > 0 ? 'bg-red-500/20 text-red-500 animate-bounce' : 'bg-amber-500/10 text-amber-500'}`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              openAlertsCount > 0 
                ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' 
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }`}>
              {openAlertsCount > 0 ? 'Action Needed' : 'Channels Clear'}
            </span>
          </div>
          <div className="mt-6">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              OPEN ALERTS
            </div>
            <div className={`text-3xl font-extrabold mt-1 tracking-tight ${openAlertsCount > 0 ? 'text-red-500' : 'text-foreground'}`}>
              {openAlertsCount}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>

        {/* Pending Check-ins */}
        <div className="group glass-card rounded-3xl p-6 transition-all duration-300 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2.5 py-1 rounded-full border border-teal-500/20">
              Scheduled
            </span>
          </div>
          <div className="mt-6">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              PENDING CHECK-INS
            </div>
            <div className="text-3xl font-extrabold text-foreground mt-1 tracking-tight">
              {pendingSchedulesCount}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>

        {/* Active Sites Monitored */}
        <div className="group glass-card rounded-3xl p-6 transition-all duration-300 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20">
              Active Properties
            </span>
          </div>
          <div className="mt-6">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              MONITORED SITES
            </div>
            <div className="text-3xl font-extrabold text-foreground mt-1 tracking-tight">
              {sitesCount}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Alerts Stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-500">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Recent Emergency Alerts</h3>
                  <p className="text-xs text-muted-foreground">Live feed of security tickets raised by field guards</p>
                </div>
              </div>
              <Link
                href="/ops/alerts"
                className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1"
              >
                View Full Alert Log <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentAlerts && recentAlerts.length > 0 ? (
                recentAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-all"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{alert.guard_name}</span>
                        {(Array.isArray(alert.sites) ? alert.sites[0]?.name : (alert.sites as any)?.name) && (
                          <span className="text-[10px] font-semibold text-muted-foreground bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md border border-border">
                            @{Array.isArray(alert.sites) ? alert.sites[0]?.name : (alert.sites as any)?.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
                      <span className="text-[10px] text-slate-400 block pt-0.5">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        alert.severity === 'HIGH' 
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        alert.status === 'OPEN' 
                          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 animate-pulse' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {alert.status}
                      </span>

                      {alert.status === 'OPEN' && (
                        <ResolveAlertButton alertId={alert.id} />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-foreground">No Emergency Alerts Reported</p>
                  <p className="text-xs text-muted-foreground">All guard perimeter check-ins are clear and operational.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Roster & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Roster Brief */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
                  <UserCheck className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-sm font-extrabold text-foreground">Active Roster Brief</h3>
              </div>
              <Link href="/ops/guards" className="text-xs font-bold text-primary hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {activeGuards && activeGuards.length > 0 ? (
                activeGuards.map((g: any) => (
                  <div key={g.id} className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-border flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-foreground">{g.profiles?.full_name || 'Guard'}</p>
                      <span className="text-[10px] text-muted-foreground">{g.sites?.name || 'Unassigned'}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      g.shift_status === 'ON_DUTY'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      {g.shift_status || 'OFF_DUTY'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No active guards registered yet.</p>
              )}
            </div>
          </div>

          {/* Quick Signal Dispatch Banner */}
          <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white space-y-4 border border-emerald-700/40 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/15 text-white backdrop-blur-md">
                <Radio className="w-5 h-5 animate-pulse text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Broadcast Signal</h4>
                <p className="text-xs text-emerald-200/80">Dispatch operational notice to active guards</p>
              </div>
            </div>
            <Link
              href="/ops/ping"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Radio className="w-4 h-4" />
              <span>Open Signal Console</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
