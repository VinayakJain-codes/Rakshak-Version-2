import { createClient as createServerClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/auth-check'
import ComplianceClient from './ComplianceClient'

export default async function CompliancePage() {
  const { tenantId } = await getUserWithRole()
  const supabase = await createServerClient()

  // Fetch recent attendance that acts as "shifts needing verification"
  const { data: attendance } = await supabase
    .from('guard_attendance')
    .select(`
      id,
      clock_in,
      status,
      profiles (full_name),
      sites (name)
    `)
    .eq('tenant_id', tenantId)
    .order('clock_in', { ascending: false })
    .limit(20)

  return <ComplianceClient attendanceRecords={attendance || []} />
}
