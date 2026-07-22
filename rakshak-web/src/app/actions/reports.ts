'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { getAdminClient } from '@/utils/supabase/admin'

export async function generateAIReport() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')
  
  const tenant_id = user.app_metadata?.tenant_id
  if (!tenant_id) throw new Error('No tenant ID')

  // Feature Gating Check
  const adminClient = getAdminClient()
  const { data: tenant } = await adminClient
    .from('tenants')
    .select('features')
    .eq('id', tenant_id)
    .single()

  const hasAIReports = tenant?.features?.ai_reports === true

  if (!hasAIReports) {
    throw new Error('Upgrade to Pro tier to access AI Reports.')
  }

  // Generate report logic would go here...
  return { success: true, reportUrl: 'https://example.com/mock-report.pdf' }
}
