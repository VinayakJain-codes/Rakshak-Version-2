import { getAdminClient } from '@/utils/supabase/admin'
import { getUserWithRole } from '@/utils/auth-check'
import ScheduleForm from './ScheduleForm'
import RecurringForm from './RecurringForm'
import { Calendar, Clock, RefreshCw, MapPin, CheckCircle2 } from 'lucide-react'

export default function SchedulePage() {
  return asyncSchedulePage()
}

async function asyncSchedulePage() {
  const { tenantId } = await getUserWithRole()
  const adminClient = getAdminClient()

  const { data: guards } = await adminClient
    .from('profiles')
    .select('id, full_name')
    .eq('tenant_id', tenantId)
    .eq('role', 'GUARD')

  const { data: sites } = await adminClient
    .from('sites')
    .select('id, name')
    .eq('tenant_id', tenantId)

  const { data: upcoming } = await adminClient
    .from('guard_schedules')
    .select('id, task_type, scheduled_time, is_completed, profiles:guard_id(full_name), sites:site_id(name)')
    .eq('tenant_id', tenantId)
    .order('scheduled_time', { ascending: true })
    .limit(20)

  const { data: rules } = await adminClient
    .from('guard_schedule_rules')
    .select('id, task_type, interval_minutes, is_active, profiles:guard_id(full_name), sites:site_id(name)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Guard Scheduling</h1>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
          Configure one-off patrol check-ins and recurring automated shift rules for officers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schedule Lists */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Schedules Card */}
          <div className="glass-card rounded-3xl overflow-hidden border border-border">
            <div className="p-5 border-b border-border/80 bg-surface/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-base font-extrabold text-foreground">Upcoming Check-ins</h2>
              </div>
              <span className="text-xs font-bold text-muted-foreground bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full border border-border">
                {upcoming?.length || 0} Scheduled
              </span>
            </div>

            <div className="divide-y divide-border/50">
              {upcoming && upcoming.length > 0 ? (
                upcoming.map((s: any) => {
                  const isDone = s.is_completed
                  return (
                    <div key={s.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface/30 transition-colors">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground truncate">{s.profiles?.full_name || 'Guard Officer'}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                            {s.task_type}
                          </span>
                        </div>
                        {s.sites?.name && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{s.sites.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-foreground">
                          {new Date(s.scheduled_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-1 ${
                          isDone 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                          {isDone ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-10 text-center text-xs text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="font-bold text-foreground">No Upcoming Check-in Schedules</p>
                  <p className="text-xs text-muted-foreground">Use the form on the right to schedule a patrol check.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recurring Rules Card */}
          <div className="glass-card rounded-3xl overflow-hidden border border-border">
            <div className="p-5 border-b border-border/80 bg-surface/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h2 className="text-base font-extrabold text-foreground">Active Recurring Rules</h2>
              </div>
              <span className="text-xs font-bold text-muted-foreground bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full border border-border">
                {rules?.length || 0} Rules
              </span>
            </div>

            <div className="divide-y divide-border/50">
              {rules && rules.length > 0 ? (
                rules.map((r: any) => (
                  <div key={r.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface/30 transition-colors">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{r.profiles?.full_name || 'Guard Officer'}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                          Every {r.interval_minutes}m
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {r.task_type} {r.sites?.name ? `@ ${r.sites.name}` : ''}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                      r.is_active 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      {r.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-xs text-muted-foreground">
                  <RefreshCw className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="font-bold text-foreground">No Recurring Rules Configured</p>
                  <p className="text-xs text-muted-foreground">Automate guard check-ins using the recurring form.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Forms Sidebar */}
        <div className="space-y-6">
          <ScheduleForm guards={guards || []} sites={sites || []} />
          <RecurringForm guards={guards || []} sites={sites || []} />
        </div>
      </div>
    </div>
  )
}
