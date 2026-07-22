'use client'

import { toggleTenantStatus, toggleTenantFeature } from '@/app/actions/admin'

export default function TenantList({ tenants }: { tenants: any[] }) {
 return (
 <div className="w-full overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-black/5 dark:bg-surface/5">
 <th className="px-6 py-4">Organization</th>
 <th className="px-6 py-4">Tier & Pricing</th>
 <th className="px-6 py-4">Guards Usage</th>
 <th className="px-6 py-4">Features</th>
 <th className="px-6 py-4">Status</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/50 bg-background">
 {tenants.map((tenant) => (
 <tr key={tenant.id} className="hover:bg-black/5 dark:hover:bg-surface/5 transition-colors">
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="font-semibold text-foreground">{tenant.name}</div>
 <div className="text-xs text-muted-foreground mt-0.5">{tenant.owner_email}</div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm font-medium text-foreground capitalize">{tenant.billing_tier || 'Basic'}</div>
 <div className="text-xs text-muted-foreground mt-0.5">₹5000/mo</div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm font-medium text-foreground">{tenant.guards?.[0]?.count || 0} / {tenant.guard_capacity}</div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex flex-col gap-2">
 <label className="flex items-center space-x-2 text-xs cursor-pointer group">
 <input 
 type="checkbox" 
 checked={tenant.features?.ai_reports || false} 
 onChange={() => toggleTenantFeature(tenant.id, tenant.features, 'ai_reports')}
 className="rounded border-border bg-background/50 text-primary focus:ring-primary focus:ring-offset-background w-3.5 h-3.5"
 />
 <span className="text-muted-foreground group-hover:text-foreground transition-colors">AI Reports</span>
 </label>
 <label className="flex items-center space-x-2 text-xs cursor-pointer group">
 <input 
 type="checkbox" 
 checked={tenant.features?.custom_branding || false} 
 onChange={() => toggleTenantFeature(tenant.id, tenant.features, 'custom_branding')}
 className="rounded border-border bg-background/50 text-primary focus:ring-primary focus:ring-offset-background w-3.5 h-3.5"
 />
 <span className="text-muted-foreground group-hover:text-foreground transition-colors">Custom Branding</span>
 </label>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-md border ${
 tenant.status === 'ACTIVE' 
 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
 : 'bg-red-500/10 text-red-500 border-red-500/20'
 }`}>
 {tenant.status}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
 <button
 onClick={() => toggleTenantStatus(tenant.id, tenant.status)}
 className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs border border-border/50 hover:border-border rounded-lg px-3 py-1.5 bg-background shadow-sm"
 >
 {tenant.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
 </button>
 </td>
 </tr>
 ))}
 {tenants.length === 0 && (
 <tr>
 <td colSpan={6} className="px-6 py-24 text-center text-sm text-muted-foreground">
 No tenants provisioned yet.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 )
}
