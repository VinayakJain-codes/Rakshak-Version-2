'use server'

import { getAdminClient } from '@/utils/supabase/admin'
import { writeAuditLog } from '@/utils/audit'
import { revalidatePath } from 'next/cache'
import { getUserWithRole } from '@/utils/auth-check'

async function verifyClientOwner() {
  const { user, role, tenantId } = await getUserWithRole()
  if (!user || role !== 'CLIENT_OWNER' || !tenantId) {
    throw new Error('Unauthorized. Only Client Owners can perform this action.')
  }
  return { user, tenantId }
}

export async function updateSite(siteId: string, name: string, address: string) {
  const { user, tenantId } = await verifyClientOwner()
  const adminClient = getAdminClient()

  const { error } = await adminClient
    .from('sites')
    .update({ name, address })
    .eq('id', siteId)
    .eq('tenant_id', tenantId)

  if (error) throw new Error(error.message)

  await writeAuditLog({
    actor: user.id,
    action: 'UPDATE_SITE',
    target_resource: `Site: ${siteId}`,
    tenant_id: tenantId
  })

  revalidatePath('/org/sites')
  return { success: true }
}

export async function deleteSite(siteId: string) {
  const { user, tenantId } = await verifyClientOwner()
  const adminClient = getAdminClient()

  const { error } = await adminClient
    .from('sites')
    .delete()
    .eq('id', siteId)
    .eq('tenant_id', tenantId)

  if (error) throw new Error(error.message)

  await writeAuditLog({
    actor: user.id,
    action: 'DELETE_SITE',
    target_resource: `Site: ${siteId}`,
    tenant_id: tenantId
  })

  revalidatePath('/org/sites')
  return { success: true }
}
