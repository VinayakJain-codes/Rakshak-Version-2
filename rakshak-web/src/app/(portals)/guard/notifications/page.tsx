import { getAdminClient } from '@/utils/supabase/admin'
import { getUserWithRole } from '@/utils/auth-check'
import NotificationsClient from './NotificationsClient'
import { redirect } from 'next/navigation'

export default async function NotificationsPage() {
  const { user, role } = await getUserWithRole()

  if (!user || role !== 'GUARD') {
    redirect('/auth/login')
  }

  const adminClient = getAdminClient()

  const { data: notifications } = await adminClient
    .from('guard_notifications')
    .select('id, title, message, is_read, created_at')
    .eq('guard_id', user.id)
    .order('created_at', { ascending: false })

  return <NotificationsClient notifications={notifications || []} guardId={user.id} />
}
