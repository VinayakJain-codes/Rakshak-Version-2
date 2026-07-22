'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/utils/supabase/admin'
import { writeAuditLog } from '@/utils/audit'
import { getUserWithRole } from '@/utils/auth-check'

// Ensure caller is SUPER_ADMIN
async function verifySuperAdmin() {
  const { user, role } = await getUserWithRole()

  if (!user || role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized')
  }

  return user
}

export async function toggleTenantStatus(tenantId: string, currentStatus: string) {
  const user = await verifySuperAdmin()
  const adminClient = getAdminClient()

  const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'

  const { error } = await adminClient
    .from('tenants')
    .update({ status: newStatus })
    .eq('id', tenantId)

  if (error) throw new Error(error.message)

  await writeAuditLog({
    actor: user.id,
    action: `TENANT_${newStatus}`,
    target_resource: `Tenant: ${tenantId}`,
    tenant_id: tenantId
  })

  revalidatePath('/admin')
  return { success: true }
}

export async function toggleTenantFeature(tenantId: string, features: any, featureKey: string) {
  const user = await verifySuperAdmin()
  const adminClient = getAdminClient()

  const updatedFeatures = {
    ...features,
    [featureKey]: !features[featureKey]
  }

  const { error } = await adminClient
    .from('tenants')
    .update({ features: updatedFeatures })
    .eq('id', tenantId)

  if (error) throw new Error(error.message)

  await writeAuditLog({
    actor: user.id,
    action: `TOGGLE_FEATURE_${featureKey.toUpperCase()}`,
    target_resource: `Tenant: ${tenantId}`,
    tenant_id: tenantId
  })

  revalidatePath('/admin')
  return { success: true }
}

export async function updateTicketStatus(ticketId: string, newStatus: string) {
  const user = await verifySuperAdmin()
  const adminClient = getAdminClient()

  const { error } = await adminClient
    .from('support_tickets')
    .update({ status: newStatus })
    .eq('id', ticketId)

  if (error) throw new Error(error.message)

  await writeAuditLog({
    actor: user.id,
    action: `TICKET_${newStatus}`,
    target_resource: `Ticket: ${ticketId}`
  })

  revalidatePath('/admin/tickets')
  revalidatePath('/org/tickets')
  return { success: true }
}
