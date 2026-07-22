import { createClient as createServerClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/auth-check'
import CheckoutButton from './CheckoutButton'
import { FileText, Download } from 'lucide-react'

export default async function BillingPage() {
  const { tenantId } = await getUserWithRole()
  const supabase = await createServerClient()

  // Fetch tenant info
  const { data: tenant } = await supabase
    .from('tenants')
    .select('billing_tier, guard_capacity, site_capacity')
    .eq('id', tenantId)
    .single()

  // Fetch current usage
  const { count: guardsCount } = await supabase
    .from('guards')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  const { count: sitesCount } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  // Fetch real payment and invoice history from DB
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  const guardUsagePct = Math.min(100, Math.round(((guardsCount || 0) / (tenant?.guard_capacity || 1)) * 100))
  const siteUsagePct = Math.min(100, Math.round(((sitesCount || 0) / (tenant?.site_capacity || 1)) * 100))

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Billing & Plan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="glass-card p-6 rounded-2xl border border-border/50">
          <h2 className="text-lg font-bold text-foreground mb-2">Current Plan</h2>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold capitalize text-foreground">{tenant?.billing_tier || 'Free'}</span>
            <span className="text-muted-foreground font-medium">Tier</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <CheckoutButton currentTier={tenant?.billing_tier || 'free'} tenantId={tenantId} />
            <button className="px-4 py-2 bg-surface text-foreground hover:bg-surface/80 border border-border rounded-lg font-medium text-sm transition-colors cursor-pointer">
              Manage Payment Methods
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground italic">*Secure payments powered by Razorpay.</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-border/50">
          <h2 className="text-lg font-bold text-foreground mb-4">Capacity Usage</h2>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-foreground">Guards</span>
              <span className="text-muted-foreground font-mono">{guardsCount || 0} / {tenant?.guard_capacity || 0}</span>
            </div>
            <div className="w-full bg-surface-opaque rounded-full h-3 overflow-hidden border border-border/50 p-0.5">
              <div className={`h-full rounded-full transition-all duration-500 ${guardUsagePct > 90 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${guardUsagePct}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-foreground">Sites</span>
              <span className="text-muted-foreground font-mono">{sitesCount || 0} / {tenant?.site_capacity || 0}</span>
            </div>
            <div className="w-full bg-surface-opaque rounded-full h-3 overflow-hidden border border-border/50 p-0.5">
              <div className={`h-full rounded-full transition-all duration-500 ${siteUsagePct > 90 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${siteUsagePct}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-surface/30">
          <h2 className="text-lg font-bold text-foreground">Payment & Invoice History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-transparent">
              {invoices && invoices.length > 0 ? (
                invoices.map((inv: any) => {
                  const isPaid = inv.status === 'PAID'
                  const isPending = inv.status === 'PENDING'
                  const currencySymbol = inv.currency === 'INR' ? '₹' : '$'
                  const formattedAmount = `${currencySymbol}${Number(inv.amount || 0).toFixed(2)}`
                  const formattedDate = inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'N/A'

                  return (
                    <tr key={inv.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{formattedDate}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        Subscription Tier Upgrade - {inv.razorpay_order_id ? `Order ${inv.razorpay_order_id.slice(-8)}` : 'Monthly'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground font-semibold">{formattedAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${
                          isPaid 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : isPending 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                            : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isPaid ? (
                          <button className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline transition-colors cursor-pointer">
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-foreground">No Invoice History</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        You have not made any subscription payments yet. When you upgrade your plan, payment receipts will appear here.
                      </p>
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

