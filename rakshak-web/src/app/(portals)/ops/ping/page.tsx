import { getAdminClient } from '@/utils/supabase/admin'
import { getUserWithRole } from '@/utils/auth-check'
import PingForm from './PingForm'
import { Radio, CheckCircle2, Clock, MailCheck, MailWarning } from 'lucide-react'

export default async function PingPage() {
  const { tenantId } = await getUserWithRole()
  const adminClient = getAdminClient()

  const { data: guards } = await adminClient
    .from('profiles')
    .select('id, full_name')
    .eq('tenant_id', tenantId)
    .eq('role', 'GUARD')

  const { data: recentPings } = await adminClient
    .from('guard_notifications')
    .select('id, title, message, is_read, created_at, profiles!guard_notifications_guard_id_fkey(full_name)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(15)

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Signal Dispatch Console</h1>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
          Transmit real-time operational pings, safety checks, and emergency notices to field officers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Pings Stream */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card rounded-3xl overflow-hidden border border-border">
            <div className="p-5 border-b border-border/80 bg-surface/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <h2 className="text-base font-extrabold text-foreground">Recent Signal Dispatch History</h2>
              </div>
              <span className="text-xs font-bold text-muted-foreground bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full border border-border">
                {recentPings?.length || 0} Signals Logged
              </span>
            </div>

            <div className="divide-y divide-border/50">
              {recentPings && recentPings.length > 0 ? (
                recentPings.map((p: any) => {
                  const isRead = p.is_read
                  return (
                    <div key={p.id} className="p-4 sm:p-5 space-y-2 hover:bg-surface/30 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-sm text-foreground truncate">
                            {p.profiles?.full_name || 'Guard Officer'}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-xs font-extrabold text-primary truncate">
                            {p.title}
                          </span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 shrink-0 ${
                          isRead 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {isRead ? <MailCheck className="w-3 h-3 text-emerald-500" /> : <MailWarning className="w-3 h-3 text-amber-500" />}
                          <span>{isRead ? 'Read' : 'Unread'}</span>
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">{p.message}</p>

                      <div className="text-[10px] font-mono text-slate-400 pt-1">
                        Dispatched {new Date(p.created_at).toLocaleString()}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <Radio className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="font-bold text-foreground">No Signals Sent Yet</p>
                  <p className="text-xs text-muted-foreground">Use the console form to send your first operational signal.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Signal Dispatch Form */}
        <div>
          <PingForm guards={guards || []} />
        </div>
      </div>
    </div>
  )
}
