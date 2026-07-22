import { getAdminClient } from '@/utils/supabase/admin'
import { getUserWithRole } from '@/utils/auth-check'
import GuardDashboardClient from './GuardDashboardClient'
import { redirect } from 'next/navigation'

export default async function GuardDashboard() {
  const { user, role } = await getUserWithRole()

  if (!user || role !== 'GUARD') {
    redirect('/auth/login')
  }

  const adminClient = getAdminClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Fetch all pending schedules for this guard OR schedules completed today
  const { data: schedules, error } = await adminClient
    .from('guard_schedules')
    .select(`
      id,
      task_type,
      scheduled_time,
      is_completed,
      sites:site_id (name)
    `)
    .eq('guard_id', user.id)
    .or(`is_completed.eq.false,scheduled_time.gte.${today.toISOString()}`)
    .order('scheduled_time', { ascending: true })

  if (error) {
    console.error('GuardDashboard schedules query error:', error)
  }

  // Fetch unread notifications count
  const { count: unreadCount } = await adminClient
    .from('guard_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('guard_id', user.id)
    .eq('is_read', false)

  return (
    <GuardDashboardClient
      schedules={schedules || []}
      unreadCount={unreadCount || 0}
      guardId={user.id}
    />
  )
}
