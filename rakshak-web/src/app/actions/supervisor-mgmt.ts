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

export async function toggleSupervisorStatus(supervisorId: string, isActive: boolean) {
  const { user, tenantId } = await verifyClientOwner()
  const adminClient = getAdminClient()

  // 1. Update the profile
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', supervisorId)
    .eq('tenant_id', tenantId)

  if (profileError) throw new Error(profileError.message)

  // 2. Ban/unban auth user
  const { error: authError } = await adminClient.auth.admin.updateUserById(supervisorId, {
    ban_duration: isActive ? 'none' : '876000h' // ban for 100 years if suspending
  })
  
  if (authError) throw new Error(authError.message)

  await writeAuditLog({
    actor: user.id,
    action: isActive ? 'ACTIVATE_SUPERVISOR' : 'SUSPEND_SUPERVISOR',
    target_resource: `Profile: ${supervisorId}`,
    tenant_id: tenantId
  })

  revalidatePath('/org/supervisors')
  return { success: true }
}

export async function changeSupervisorPassword(supervisorId: string, newPassword: string) {
  const { user, tenantId } = await verifyClientOwner()
  const adminClient = getAdminClient()
  
  // Verify supervisor belongs to tenant
  const { data: profile, error: checkError } = await adminClient
    .from('profiles')
    .select('id')
    .eq('id', supervisorId)
    .eq('tenant_id', tenantId)
    .single()
    
  if (checkError || !profile) throw new Error('Supervisor not found in your organization.')

  const { error: authError } = await adminClient.auth.admin.updateUserById(supervisorId, {
    password: newPassword
  })
  
  if (authError) throw new Error(authError.message)

  await writeAuditLog({
    actor: user.id,
    action: 'CHANGE_SUPERVISOR_PASSWORD',
    target_resource: `Profile: ${supervisorId}`,
    tenant_id: tenantId
  })

  return { success: true }
}

export async function sendSupervisorMessage(supervisorId: string, message: string, type: 'INFO' | 'ALERT' = 'INFO') {
  const { user, tenantId } = await verifyClientOwner()
  const adminClient = getAdminClient()
  
  const { error } = await adminClient
    .from('notifications')
    .insert({
      tenant_id: tenantId,
      user_id: supervisorId,
      message,
      type
    })
    
  if (error) {
    // If the table doesn't exist yet, we catch it smoothly
    if (error.code === '42P01') {
       throw new Error('Notifications table not found. Please run the SQL migration first.')
    }
    throw new Error(error.message)
  }

  await writeAuditLog({
    actor: user.id,
    action: 'SEND_SUPERVISOR_MESSAGE',
    target_resource: `Profile: ${supervisorId}`,
    tenant_id: tenantId
  })

  return { success: true }
}
