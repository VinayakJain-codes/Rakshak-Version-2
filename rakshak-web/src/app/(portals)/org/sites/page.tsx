import { createClient as createServerClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/auth-check'
import AddSiteForm from './AddSiteForm'
import SiteCard from './SiteCard'
import { MapPin } from 'lucide-react'

export default async function SitesPage() {
  const { tenantId } = await getUserWithRole()
  const supabase = await createServerClient()

  const { data: sites } = await supabase
    .from('sites')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Sites Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {(!sites || sites.length === 0) ? (
            <div className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-border bg-surface/50">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-foreground">No Sites Found</h3>
              <p className="text-muted-foreground mt-2">Create a new site to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {sites.map((site) => (
                <SiteCard key={site.id} site={site} />
              ))}
            </div>
          )}
        </div>
        
        <div className="lg:sticky lg:top-24 h-max">
          <AddSiteForm />
        </div>
      </div>
    </div>
  )
}
