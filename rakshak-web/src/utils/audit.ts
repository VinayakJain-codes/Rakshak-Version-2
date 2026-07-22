import { getAdminClient } from '@/utils/supabase/admin'

export async function writeAuditLog({
  actor,
  action,
  target_resource,
  tenant_id,
}: {
  actor?: string
  action: string
  target_resource: string
  tenant_id?: string
}) {
  const adminClient = getAdminClient()
  
  const { error } = await adminClient.from('audit_logs').insert({
    actor,
    action,
    target_resource,
    tenant_id,
  })

  if (error) {
    console.error('Failed to write audit log:', error)
  }
}
