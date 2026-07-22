import { getAdminClient } from '@/utils/supabase/admin'
import { getUserWithRole } from '@/utils/auth-check'
import { ShieldAlert, CheckCircle2, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react'
import ResolveAlertButton from './ResolveAlertButton'

export default async function AlertsPage() {
  const { tenantId } = await getUserWithRole()
  const adminClient = getAdminClient()

  const { data: alerts } = await adminClient
    .from('alerts')
    .select('id, guard_name, description, severity, status, created_at, sites:site_id(name)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  const openCount = alerts?.filter(a => a.status === 'OPEN').length || 0
  const highSeverityCount = alerts?.filter(a => a.severity === 'HIGH' && a.status === 'OPEN').length || 0

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Emergency Alerts Stream</h1>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
            Real-time emergency tickets and SOS dispatches raised by field security personnel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border ${
            openCount > 0 
              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' 
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${openCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
            {openCount} Open Tickets ({highSeverityCount} High Severity)
          </span>
        </div>
      </div>

      {/* Alerts Table Card */}
      <div className="glass-card rounded-3xl overflow-hidden border border-border">
        <div className="p-5 border-b border-border/80 bg-surface/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-foreground">Active & Historic Emergency Tickets</h2>
          </div>
          <span className="text-xs font-bold text-muted-foreground bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full border border-border">
            {alerts?.length || 0} Total Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface/50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Guard Officer</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Incident Details</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Property Site</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-transparent">
              {alerts && alerts.length > 0 ? (
                alerts.map((a: any) => {
                  const isOpen = a.status === 'OPEN'
                  const isHigh = a.severity === 'HIGH'
                  return (
                    <tr key={a.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-sm text-foreground">
                        {a.guard_name || 'Unknown Officer'}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-foreground max-w-xs leading-relaxed">
                        {a.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{a.sites?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                          isHigh 
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 ${
                          isOpen 
                            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 animate-pulse' 
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-muted-foreground">
                        {new Date(a.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                        {isOpen ? (
                          <ResolveAlertButton alertId={a.id} />
                        ) : (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span>Resolved</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-foreground">Zero Active Emergency Alerts</p>
                      <p className="text-xs text-muted-foreground max-w-sm">All security perimeter channels are operational and clear.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
