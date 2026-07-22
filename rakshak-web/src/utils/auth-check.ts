import { createClient as createServerClient } from '@/utils/supabase/server'

export async function getUserWithRole() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { user: null, role: null, tenantId: null }

  let role = user.app_metadata?.role
  let tenantId = user.app_metadata?.tenant_id

  if (!role || (!tenantId && role !== 'SUPER_ADMIN')) {
    const { data } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single()
    role = role || data?.role
    tenantId = tenantId || data?.tenant_id
  }

  // Fallback for SUPER_ADMIN viewing tenant portals
  if (role === 'SUPER_ADMIN' && !tenantId) {
    const { data: tenant } = await supabase.from('tenants').select('id').limit(1).maybeSingle()
    tenantId = tenant?.id || null
  }

  return { user, role, tenantId }
}
