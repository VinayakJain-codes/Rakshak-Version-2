import { createClient as createServerClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/auth-check'
import { AlertCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react'

export default async function ReportsPage() {
  const { tenantId } = await getUserWithRole()
  const supabase = await createServerClient()

  // Fetch recent incidents
  const { data: incidents } = await supabase
    .from('incidents')
    .select(`
      id, 
      description, 
      status, 
      severity, 
      created_at,
      sites (name),
      profiles (full_name)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  // Fetch recent attendance
  const { data: attendance } = await supabase
    .from('guard_attendance')
    .select(`
      id,
      clock_in,
      clock_out,
      status,
      profiles (full_name),
      sites (name)
    `)
    .eq('tenant_id', tenantId)
    .order('clock_in', { ascending: false })

  // Calculations for KPIs
  const totalShifts = attendance?.length || 0
  const presentShifts = attendance?.filter((a: any) => a.status === 'PRESENT' || a.status === 'ON_TIME').length || 0
  const complianceRate = totalShifts > 0 ? Math.round((presentShifts / totalShifts) * 100) : 100
  
  const totalIncidents = incidents?.length || 0
  const highSeverityIncidents = incidents?.filter((i: any) => i.severity === 'HIGH').length || 0

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Reports & Analytics</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">Aggregated insights across your organization.</p>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-border/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-sm font-bold text-muted-foreground mb-1 relative z-10">Global Compliance</p>
          <div className="text-4xl font-extrabold text-foreground relative z-10">{complianceRate}%</div>
          <div className="mt-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 inline-block px-2 py-1 rounded-md border border-emerald-500/20 relative z-10">
            Based on {totalShifts} shifts
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-border/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-500">
            <Clock className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-sm font-bold text-muted-foreground mb-1 relative z-10">Completed Shifts</p>
          <div className="text-4xl font-extrabold text-foreground relative z-10">{presentShifts}</div>
          <div className="mt-2 text-xs font-semibold text-blue-500 bg-blue-500/10 inline-block px-2 py-1 rounded-md border border-blue-500/20 relative z-10">
            Across all sites
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-border/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
            <ShieldAlert className="w-16 h-16 text-amber-500" />
          </div>
          <p className="text-sm font-bold text-muted-foreground mb-1 relative z-10">Total Incidents</p>
          <div className="text-4xl font-extrabold text-foreground relative z-10">{totalIncidents}</div>
          <div className="mt-2 text-xs font-semibold text-amber-500 bg-amber-500/10 inline-block px-2 py-1 rounded-md border border-amber-500/20 relative z-10">
            Recorded historically
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-border/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-500">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <p className="text-sm font-bold text-muted-foreground mb-1 relative z-10">High Severity</p>
          <div className="text-4xl font-extrabold text-foreground relative z-10">{highSeverityIncidents}</div>
          <div className="mt-2 text-xs font-semibold text-red-500 bg-red-500/10 inline-block px-2 py-1 rounded-md border border-red-500/20 relative z-10">
            Requires attention
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Incidents Section */}
        <section className="glass-card rounded-3xl border border-border/50 overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-border/50 bg-surface/30">
            <h2 className="text-lg font-bold text-foreground">Recent Incidents Log</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface/50 sticky top-0 backdrop-blur-md z-20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Site & Guard</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 bg-transparent">
                {incidents?.slice(0, 10).map((inc: any) => (
                  <tr key={inc.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground" suppressHydrationWarning>
                      {new Date(inc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-foreground">{inc.sites?.name}</div>
                      <div className="text-xs text-muted-foreground">{inc.profiles?.full_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        inc.severity === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!incidents || incidents.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No recent incidents
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Attendance Section */}
        <section className="glass-card rounded-3xl border border-border/50 overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-border/50 bg-surface/30">
            <h2 className="text-lg font-bold text-foreground">Recent Attendance Log</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface/50 sticky top-0 backdrop-blur-md z-20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Guard & Site</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clock In</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 bg-transparent">
                {attendance?.slice(0, 10).map((att: any) => (
                  <tr key={att.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-foreground">{att.profiles?.full_name}</div>
                      <div className="text-xs text-muted-foreground">{att.sites?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground" suppressHydrationWarning>
                      {new Date(att.clock_in).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        att.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-surface text-muted-foreground border-border'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!attendance || attendance.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No recent attendance records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
