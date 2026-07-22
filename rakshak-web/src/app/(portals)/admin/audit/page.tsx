import { createClient as createServerClient } from '@/utils/supabase/server'
import { Search, ChevronDown, Download } from 'lucide-react'

export default async function AdminAuditPage() {
 const supabase = await createServerClient()
 const { data: logs } = await supabase
 .from('audit_logs')
 .select('*, profiles(full_name), tenants(name)')
 .order('timestamp', { ascending: false })
 .limit(100)

 return (
 <div className="max-w-7xl mx-auto space-y-6">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground">Global Audit Log Streams</h1>
 <p className="text-sm text-muted-foreground mt-1">System-wide activity tracking for forensic review and compliance.</p>
 </div>

 <div className="bg-surface rounded-2xl shadow-xs border border-border overflow-hidden flex flex-col">
 {/* Toolbar */}
 <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center gap-4 justify-between bg-surface dark:bg-surface/5">
 <div className="relative w-full max-w-sm">
 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
 <input 
 type="text" 
 placeholder="Search by User, Action, or Resource..."
 className="w-full pl-9 pr-4 py-2 text-sm bg-[#faf8f4] border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground transition-all"
 />
 </div>
 <div className="flex items-center gap-2 w-full sm:w-auto">
 <button className="flex items-center justify-between gap-2 px-4 py-2 text-sm bg-[#faf8f4] border border-border rounded-lg hover:bg-surface/5 transition-colors min-w-[120px]">
 All Tenants
 <ChevronDown className="w-4 h-4 text-muted-foreground" />
 </button>
 <button className="flex items-center justify-between gap-2 px-4 py-2 text-sm bg-[#faf8f4] border border-border rounded-lg hover:bg-surface/5 transition-colors min-w-[120px]">
 All Actions
 <ChevronDown className="w-4 h-4 text-muted-foreground" />
 </button>
 <button className="flex items-center justify-between gap-2 px-4 py-2 text-sm font-semibold text-foreground bg-[#faf8f4] border border-border rounded-lg hover:bg-surface/5 transition-colors">
 <Download className="w-4 h-4" />
 Export CSV
 </button>
 </div>
 </div>

 {/* Table */}
 <div className="w-full overflow-x-auto">
 <table className="min-w-full divide-y divide-border/50">
 <thead>
 <tr className="border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-black/5 dark:bg-surface/5">
 <th className="px-6 py-4 text-left">Timestamp</th>
 <th className="px-6 py-4 text-left">Tenant</th>
 <th className="px-6 py-4 text-left">Actor (User)</th>
 <th className="px-6 py-4 text-left">Action</th>
 <th className="px-6 py-4 text-left">Target Resource</th>
 <th className="px-6 py-4 text-left">IP Address</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/50 bg-background">
 {logs?.map((log) => (
 <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-surface/5 transition-colors">
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {new Date(log.timestamp).toLocaleString()}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
 {log.tenants?.name || 'Platform'}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
 {log.profiles?.full_name || log.actor || 'System'}
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className="px-2.5 py-1 inline-flex text-[10px] uppercase tracking-wider font-semibold rounded-md bg-surface/5 border border-white/10 text-foreground">
 {log.action}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {log.target_resource}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
 {log.ip_address || '—'}
 </td>
 </tr>
 ))}
 {(!logs || logs.length === 0) && (
 <tr>
 <td colSpan={6} className="px-6 py-24 text-center text-sm text-muted-foreground">
 No audit entries found matching the filters.
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
