import { createClient as createServerClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/auth-check'
import AddSupervisorForm from './AddSupervisorForm'
import AssignSupervisorForm from './AssignSupervisorForm'
import SupervisorCard from './SupervisorCard'

export default async function SupervisorsPage() {
  const { tenantId } = await getUserWithRole()
  const supabase = await createServerClient()

  const { data: supervisors } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      is_active,
      supervisor_sites (
        site_id,
        sites (
          id,
          name
        )
      )
    `)
    .eq('tenant_id', tenantId)
    .eq('role', 'SUPERVISOR')

  const { data: sites } = await supabase
    .from('sites')
    .select('id, name')
    .eq('tenant_id', tenantId)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Supervisors Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {(!supervisors || supervisors.length === 0) ? (
            <div className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-border bg-surface/50">
              <h3 className="text-lg font-bold text-foreground">No Supervisors Found</h3>
              <p className="text-muted-foreground mt-2">Create a new supervisor to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {supervisors.map((sup) => (
                <SupervisorCard key={sup.id} supervisor={sup} />
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <AddSupervisorForm />
          {sites && sites.length > 0 && supervisors && supervisors.length > 0 && (
            <AssignSupervisorForm supervisors={supervisors} sites={sites} />
          )}
        </div>
      </div>
    </div>
  )
}
