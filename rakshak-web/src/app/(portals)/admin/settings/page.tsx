import { createClient as createServerClient } from '@/utils/supabase/server'

export default async function AdminSettingsPage() {
 const supabase = await createServerClient()
 const { data: { user } } = await supabase.auth.getUser()

 return (
 <div className="max-w-4xl mx-auto space-y-8">
 <div>
 <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
 <p className="text-muted-foreground">Manage your personal Super Admin account preferences.</p>
 </div>

 <div className="bg-background rounded-2xl shadow-sm border border-border/50 overflow-hidden p-6 space-y-6">
 <div>
 <h2 className="text-lg font-semibold text-foreground mb-4">Account Information</h2>
 <div className="grid gap-4">
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
 <input 
 type="email" 
 disabled 
 value={user?.email || ''} 
 className="w-full max-w-md px-3 py-2 bg-surface/5 border border-border rounded-lg text-foreground cursor-not-allowed opacity-70" 
 />
 <p className="text-xs text-muted-foreground mt-1">Super Admin emails cannot be changed directly via the portal for security reasons.</p>
 </div>
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-1">Role</label>
 <div className="inline-flex items-center px-2.5 py-1 rounded-full border bg-accent/10 text-accent border-accent/20 text-sm font-medium">
 SUPER_ADMIN
 </div>
 </div>
 </div>
 </div>

 <div className="pt-6 border-t border-border/50">
 <h2 className="text-lg font-semibold text-foreground mb-4">Security</h2>
 <button className="px-4 py-2.5 bg-primary text-on-primary hover:bg-primary/90 transition-colors rounded-lg font-medium border border-white/10">
 Request Password Reset
 </button>
 </div>
 </div>
 </div>
 )
}
