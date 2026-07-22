import { createClient as createServerClient } from '@/utils/supabase/server'
import { Banknote, Building2, Users, ShieldCheck, Download, Globe2 } from 'lucide-react'

export default async function AdminDashboard() {
 const supabase = await createServerClient()

 // Fetch real data
 const { count: tenantCount } = await supabase
 .from('tenants')
 .select('*', { count: 'exact', head: true })

 const { count: guardCount } = await supabase
 .from('guards')
 .select('*', { count: 'exact', head: true })

 const { count: criticalTickets } = await supabase
 .from('support_tickets')
 .select('*', { count: 'exact', head: true })
 .eq('status', 'OPEN')

 // Calculate MRR based on a simple heuristic for now (e.g., 5000 per tenant)
 // Per user request: if no custom pricing set to 0
 const estimatedMrr = 0

 return (
 <div className="max-w-7xl mx-auto space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground">Agency Command Center</h1>
 <p className="text-sm text-muted-foreground mt-1">Global platform telemetry and revenue tracking.</p>
 </div>
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
 <Globe2 className="w-3.5 h-3.5" />
 Platform Status: Healthy
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="bg-surface rounded-2xl p-6 shadow-xs border border-border relative overflow-hidden group">
 <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
 <Banknote className="w-5 h-5" />
 </div>
 <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Monthly Recurring Revenue</p>
 <div className="text-3xl font-bold text-foreground">₹{estimatedMrr.toLocaleString()}</div>
 <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 w-1/3"></div>
 </div>

 <div className="bg-surface rounded-2xl p-6 shadow-xs border border-border relative overflow-hidden group">
 <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
 <Building2 className="w-5 h-5" />
 </div>
 <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Active Tenants (Clients)</p>
 <div className="text-3xl font-bold text-foreground">{tenantCount || 0}</div>
 <div className="absolute bottom-0 left-0 h-1 bg-blue-500 w-1/2"></div>
 </div>

 <div className="bg-surface rounded-2xl p-6 shadow-xs border border-border relative overflow-hidden group">
 <div className="w-10 h-10 rounded-lg bg-slate-500/10 text-slate-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
 <Users className="w-5 h-5" />
 </div>
 <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Guards Monitored</p>
 <div className="text-3xl font-bold text-foreground">{guardCount || 0}</div>
 <div className="absolute bottom-0 left-0 h-1 bg-slate-500 w-1/4"></div>
 </div>

 <div className="bg-surface rounded-2xl p-6 shadow-xs border border-border relative overflow-hidden group">
 <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
 <ShieldCheck className="w-5 h-5" />
 </div>
 <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Global Compliance Rate</p>
 <div className="text-3xl font-bold text-foreground">100%</div>
 <div className="absolute bottom-0 left-0 h-1 bg-primary w-11/12"></div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <div className="bg-surface rounded-2xl border border-border shadow-xs flex flex-col h-80">
 <div className="p-4 border-b border-border flex items-center justify-between">
 <h2 className="text-sm font-semibold text-foreground">MRR Growth (Last 6 Months)</h2>
 <button className="text-muted-foreground hover:text-foreground transition-colors">
 <Download className="w-4 h-4" />
 </button>
 </div>
 <div className="flex-1 flex items-center justify-center p-6">
 <p className="text-sm text-muted-foreground">No MRR data available</p>
 </div>
 </div>

 <div className="bg-surface rounded-2xl border border-border shadow-xs flex flex-col h-80">
 <div className="p-4 border-b border-border flex items-center justify-between">
 <h2 className="text-sm font-semibold text-foreground">Critical Support Queue</h2>
 <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${criticalTickets && criticalTickets > 0 ? 'bg-red-500/10 text-red-500' : 'bg-red-500/10 text-red-500'}`}>
 {criticalTickets || 0} Open
 </div>
 </div>
 <div className="flex-1 flex items-center justify-center p-6 text-center">
 <p className="text-sm text-muted-foreground">
 {criticalTickets && criticalTickets > 0 ? `${criticalTickets} active critical tickets in the queue.` : 'No active critical tickets in the queue.'}
 </p>
 </div>
 </div>
 </div>
 </div>
 )
}
