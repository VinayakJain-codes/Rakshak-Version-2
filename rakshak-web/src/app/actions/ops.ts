'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/utils/supabase/admin'
import { writeAuditLog } from '@/utils/audit'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/auth-check'

// Helper to verify supervisor or admin permission & get tenant context
async function verifySupervisor() {
  const { user, role, tenantId } = await getUserWithRole()
  if (!user || !['SUPERVISOR', 'CLIENT_OWNER', 'SUPER_ADMIN'].includes(role || '')) {
    throw new Error('Unauthorized')
  }
  if (!tenantId) {
    throw new Error('No tenant ID context found for user')
  }
  return { user, tenant_id: tenantId }
}

// Helper to verify guard user
async function verifyGuard() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'GUARD') {
    throw new Error('Unauthorized')
  }
  return { user, tenant_id: profile.tenant_id as string }
}

// -------------------------------------------------------------
// 2.1 ONE-TIME CHECK-INS
// Schedule a single, specific check-in for a guard at a specific date/time
// -------------------------------------------------------------
export async function createSchedule(formData: FormData) {
  const { user, tenant_id } = await verifySupervisor()
  const guardId = formData.get('guardId') as string
  const siteId = formData.get('siteId') as string || null
  const taskType = formData.get('taskType') as string || 'CHECK_IN'
  const scheduledTime = formData.get('scheduledTime') as string

  if (!guardId) throw new Error('Guard officer selection is required')
  if (!scheduledTime) throw new Error('Scheduled date & time is required')

  const adminClient = getAdminClient()
  const { error } = await adminClient.from('guard_schedules').insert({
    guard_id: guardId,
    tenant_id,
    site_id: siteId,
    task_type: taskType,
    scheduled_time: scheduledTime,
    is_completed: false
  })
  if (error) throw new Error(error.message)

  await writeAuditLog({ actor: user.id, action: 'CREATE_SCHEDULE', target_resource: `Guard: ${guardId}`, tenant_id })
  revalidatePath('/ops/schedule')
  revalidatePath('/ops')
  return { success: true }
}

// -------------------------------------------------------------
// 2.2 RECURRING CHECK-INS
// Set a recurring interval (e.g. every 2 hours) and auto-generate initial & upcoming check-ins
// -------------------------------------------------------------
export async function createScheduleRule(formData: FormData) {
  const { user, tenant_id } = await verifySupervisor()
  const guardId = formData.get('guardId') as string
  const siteId = formData.get('siteId') as string || null
  const taskType = formData.get('taskType') as string || 'CHECK_IN'
  const intervalMinutes = parseInt(formData.get('intervalMinutes') as string || '60')

  if (!guardId) throw new Error('Guard officer selection is required')

  const adminClient = getAdminClient()

  // 1. Store the recurring rule
  const { data: rule, error } = await adminClient.from('guard_schedule_rules').insert({
    guard_id: guardId,
    tenant_id,
    site_id: siteId,
    task_type: taskType,
    interval_minutes: intervalMinutes,
    is_active: true
  }).select().single()

  if (error) throw new Error(error.message)

  // 2. Auto-generate the initial due check-in scheduled for (now + intervalMinutes)
  const initialDueTime = new Date(Date.now() + intervalMinutes * 60 * 1000).toISOString()
  await adminClient.from('guard_schedules').insert({
    guard_id: guardId,
    tenant_id,
    site_id: siteId,
    task_type: taskType,
    scheduled_time: initialDueTime,
    is_completed: false
  })

  await writeAuditLog({ actor: user.id, action: 'CREATE_SCHEDULE_RULE', target_resource: `Guard: ${guardId}, Rule: ${rule.id}`, tenant_id })
  revalidatePath('/ops/schedule')
  revalidatePath('/ops')
  return { success: true }
}

// -------------------------------------------------------------
// 2.3 MANUAL "SEND SIGNAL NOW"
// Manually & immediately ping a guard telling them to report in right now
// -------------------------------------------------------------
export async function sendNotification(formData: FormData) {
  const { user, tenant_id } = await verifySupervisor()
  const guardId = formData.get('guardId') as string
  const title = formData.get('title') as string || '⚡ Immediate Check-in Required'
  const message = formData.get('message') as string || 'Supervisor requested an immediate operational check-in.'

  if (!guardId) throw new Error('Target guard officer is required')

  const adminClient = getAdminClient()

  // 1. Insert real-time notification
  const { error: notifError } = await adminClient.from('guard_notifications').insert({
    guard_id: guardId,
    tenant_id,
    sent_by: user.id,
    title,
    message,
    is_read: false
  })
  if (notifError) throw new Error(notifError.message)

  // 2. Auto-generate immediate due check-in duty in guard_schedules for right now
  await adminClient.from('guard_schedules').insert({
    guard_id: guardId,
    tenant_id,
    task_type: 'CHECK_IN',
    scheduled_time: new Date().toISOString(),
    is_completed: false
  })

  await writeAuditLog({ actor: user.id, action: 'SEND_NOTIFICATION', target_resource: `Guard: ${guardId}`, tenant_id })
  revalidatePath('/ops')
  revalidatePath('/ops/ping')
  return { success: true }
}

// Send broadcast notification to all active guards
export async function broadcastNotification(formData: FormData) {
  const { user, tenant_id } = await verifySupervisor()
  const title = formData.get('title') as string || '⚡ Priority Operational Dispatch'
  const message = formData.get('message') as string || 'Broadcast instruction from Supervisor.'

  const adminClient = getAdminClient()
  const { data: guards } = await adminClient
    .from('profiles')
    .select('id')
    .eq('tenant_id', tenant_id)
    .eq('role', 'GUARD')

  if (!guards || guards.length === 0) {
    throw new Error('No guards registered in this organization')
  }

  const notifications = guards.map((g) => ({
    guard_id: g.id,
    tenant_id,
    sent_by: user.id,
    title,
    message,
    is_read: false
  }))

  const { error: insertError } = await adminClient.from('guard_notifications').insert(notifications)
  if (insertError) throw new Error(insertError.message)

  // Also create immediate check-in duties for all guards
  const immediateSchedules = guards.map((g) => ({
    guard_id: g.id,
    tenant_id,
    task_type: 'CHECK_IN',
    scheduled_time: new Date().toISOString(),
    is_completed: false
  }))
  await adminClient.from('guard_schedules').insert(immediateSchedules)

  await writeAuditLog({ actor: user.id, action: 'BROADCAST_NOTIFICATION', target_resource: `Guards: ${guards.length}`, tenant_id })
  revalidatePath('/ops')
  revalidatePath('/ops/ping')
  return { success: true }
}

// -------------------------------------------------------------
// GUARD ACTIONS
// Guard completes a schedule & system auto-schedules next recurring interval if applicable
// -------------------------------------------------------------
export async function completeSchedule(formData: FormData) {
  const { user, tenant_id } = await verifyGuard()
  const scheduleId = formData.get('scheduleId') as string

  const adminClient = getAdminClient()

  // 1. Mark current schedule as completed
  const { data: completedItem, error } = await adminClient
    .from('guard_schedules')
    .update({ is_completed: true })
    .eq('id', scheduleId)
    .eq('guard_id', user.id)
    .select('guard_id, site_id, task_type')
    .single()

  if (error) throw new Error(error.message)

  // 2. Check if guard has an active recurring rule, and auto-schedule next check-in!
  const { data: rule } = await adminClient
    .from('guard_schedule_rules')
    .select('interval_minutes, site_id, task_type')
    .eq('guard_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (rule) {
    const nextDueTime = new Date(Date.now() + rule.interval_minutes * 60 * 1000).toISOString()
    await adminClient.from('guard_schedules').insert({
      guard_id: user.id,
      tenant_id,
      site_id: rule.site_id || completedItem?.site_id,
      task_type: rule.task_type || completedItem?.task_type || 'CHECK_IN',
      scheduled_time: nextDueTime,
      is_completed: false
    })
  }

  revalidatePath('/guard')
  revalidatePath('/ops')
  revalidatePath('/ops/schedule')
  return { success: true }
}

// Guard raises an emergency alert
export async function raiseAlert(formData: FormData) {
  const { user, tenant_id } = await verifyGuard()
  const description = formData.get('description') as string
  const severity = formData.get('severity') as string || 'HIGH'

  const adminClient = getAdminClient()
  const { data: profile } = await adminClient.from('profiles').select('full_name').eq('id', user.id).single()

  const { error } = await adminClient.from('alerts').insert({
    guard_id: user.id,
    tenant_id,
    guard_name: profile?.full_name || 'Unknown Officer',
    description,
    severity,
    status: 'OPEN'
  })
  if (error) throw new Error(error.message)

  revalidatePath('/guard')
  revalidatePath('/ops')
  revalidatePath('/ops/alerts')
  return { success: true }
}

// Supervisor resolves an emergency alert
export async function resolveAlert(alertId: string) {
  const { user, tenant_id } = await verifySupervisor()
  const adminClient = getAdminClient()
  const { error } = await adminClient
    .from('alerts')
    .update({ status: 'RESOLVED' })
    .eq('id', alertId)
    .eq('tenant_id', tenant_id)

  if (error) throw new Error(error.message)

  await writeAuditLog({ actor: user.id, action: 'RESOLVE_ALERT', target_resource: `Alert: ${alertId}`, tenant_id })
  revalidatePath('/ops/alerts')
  revalidatePath('/ops')
  return { success: true }
}

// Guard marks a notification as read
export async function markNotificationRead(notificationId: string) {
  const { user } = await verifyGuard()
  const adminClient = getAdminClient()
  await adminClient.from('guard_notifications').update({ is_read: true }).eq('id', notificationId).eq('guard_id', user.id)
  revalidatePath('/guard')
  return { success: true }
}
