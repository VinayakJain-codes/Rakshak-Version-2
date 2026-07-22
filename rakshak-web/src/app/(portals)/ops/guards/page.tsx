import { getAdminClient } from '@/utils/supabase/admin'
import { getUserWithRole } from '@/utils/auth-check'
import AddGuardForm from './AddGuardForm'
import { Shield, Users, Radio, MapPin, Search } from 'lucide-react'
import Link from 'next/link'

export default async function GuardsPage() {
  const { tenantId } = await getUserWithRole()
  const adminClient = getAdminClient()

  const { data: guards, error } = await adminClient
    .from('guards')
    .select(`
      id,
      shift_status,
      created_at,
      profiles:profile_id (
        id,
        full_name
      )
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('GuardsPage query error:', error)
  }

  const totalGuards = guards?.length || 0
  const onDutyCount = guards?.filter((g: any) => g.shift_status === 'ON_DUTY').length || 0

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Guard Roster</h1>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
            Manage personnel, assign properties, and monitor shift status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {onDutyCount} / {totalGuards} On Duty
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Guard List Table */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card rounded-3xl overflow-hidden border border-border">
            <div className="p-5 border-b border-border/80 bg-surface/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-base font-extrabold text-foreground">Registered Security Officers</h2>
              </div>
              <span className="text-xs font-bold text-muted-foreground bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full border border-border">
                {totalGuards} Guards
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-surface/50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Guard Officer</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Assigned Property</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Shift Status</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 bg-transparent">
                  {guards && guards.length > 0 ? (
                    guards.map((g: any) => {
                      const isOnDuty = g.shift_status === 'ON_DUTY'
                      return (
                        <tr key={g.id} className="hover:bg-surface/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                                {(g.profiles?.full_name || 'G').charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-sm text-foreground">{g.profiles?.full_name || 'Unnamed Guard'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-medium">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{g.sites?.name || 'Unassigned'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 ${
                              isOnDuty 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isOnDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                              {g.shift_status || 'OFF_DUTY'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                            <Link 
                              href="/ops/ping" 
                              className="inline-flex items-center gap-1 text-primary hover:underline font-bold transition-colors"
                            >
                              <Radio className="w-3.5 h-3.5" />
                              <span>Signal</span>
                            </Link>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-xs text-muted-foreground">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Users className="w-8 h-8 text-slate-400" />
                          <p className="font-bold text-foreground">No Guards Enrolled</p>
                          <p className="text-xs text-muted-foreground">Register your first security officer using the form on the right.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Guard Form Sidebar */}
        <div>
          <AddGuardForm />
        </div>
      </div>
    </div>
  )
}
