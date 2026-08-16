import { getAdminClient } from '@/utils/supabase/admin'
import { getUserWithRole } from '@/utils/auth-check'
import CheckInsClient from './CheckInsClient'

export default function SupervisorCheckInsPage() {
  return asyncSupervisorCheckInsPage()
}

async function asyncSupervisorCheckInsPage() {
  const { tenantId } = await getUserWithRole()
  const adminClient = getAdminClient()

  // Fetch guard checkins with profiles, sites, and schedule info
  const { data: rawCheckins, error } = await adminClient
    .from('guard_checkins')
    .select(`
      id,
      photo_url,
      verification_result,
      verification_score,
      model_version,
      failure_reason,
      created_at,
      profiles:guard_id(full_name),
      sites:site_id(name),
      guard_schedules:schedule_id(task_type)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching checkins:', error)
  }

  // Generate signed URLs for storage photo images
  const checkins = await Promise.all(
    (rawCheckins || []).map(async (c: any) => {
      let signed_url: string | undefined = undefined
      if (c.photo_url) {
        const { data: signedData } = await adminClient.storage
          .from('checkin_photos')
          .createSignedUrl(c.photo_url, 3600)
        signed_url = signedData?.signedUrl
      }

      return {
        id: c.id,
        photo_url: c.photo_url,
        signed_url,
        verification_result: c.verification_result || 'PASS',
        verification_score: c.verification_score,
        model_version: c.model_version,
        failure_reason: c.failure_reason,
        created_at: c.created_at,
        guard_name: c.profiles?.full_name || 'Guard Officer',
        site_name: c.sites?.name || 'Assigned Site',
        task_type: c.guard_schedules?.task_type || 'PATROL_CHECK'
      }
    })
  )

  return <CheckInsClient checkins={checkins} />
}
