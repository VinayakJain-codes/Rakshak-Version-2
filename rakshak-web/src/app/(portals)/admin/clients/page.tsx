import { createClient as createServerClient } from '@/utils/supabase/server'
import { ProvisionClientModal } from './ProvisionClientModal'
import TenantList from '../TenantList'
import { Search, ChevronDown } from 'lucide-react'

export default async function AdminClientsPage() {
 const supabase = await createServerClient()

 // Fetch tenants with their guard counts
 const { data: tenants } = await supabase
 .from('tenants')
 .select(`
 *,
 guards(count)
 `)
 .order('created_at', { ascending: false })

 return (
 <div className="max-w-7xl mx-auto space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground">Tenant Provisioning</h1>
 <p className="text-sm text-muted-foreground mt-1">Manage client organizations, capacity limits, and subscriptions.</p>
 </div>
 <ProvisionClientModal />
 </div>

 <div className="bg-surface rounded-2xl shadow-xs border border-border overflow-hidden flex flex-col">
 {/* Toolbar */}
 <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center gap-4 justify-between bg-surface dark:bg-surface/5">
 <div className="relative w-full max-w-sm">
 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
 <input 
 type="text" 
 placeholder="Search organizations..."
 className="w-full pl-9 pr-4 py-2 text-sm bg-[#faf8f4] border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground transition-all"
 />
 </div>
 <div className="flex items-center gap-2 w-full sm:w-auto">
 <button className="flex items-center justify-between gap-2 px-4 py-2 text-sm bg-[#faf8f4] border border-border rounded-lg hover:bg-surface/5 transition-colors min-w-[120px]">
 All Tiers
 <ChevronDown className="w-4 h-4 text-muted-foreground" />
 </button>
 <button className="flex items-center justify-between gap-2 px-4 py-2 text-sm bg-[#faf8f4] border border-border rounded-lg hover:bg-surface/5 transition-colors min-w-[140px]">
 All Statuses
 <ChevronDown className="w-4 h-4 text-muted-foreground" />
 </button>
 </div>
 </div>

 {/* Table */}
 <TenantList tenants={tenants || []} />
 </div>
 </div>
 )
}
