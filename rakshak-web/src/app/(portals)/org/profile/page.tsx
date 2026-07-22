import { createClient as createServerClient } from '@/utils/supabase/server'
import { getUserWithRole } from '@/utils/auth-check'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const { user, role, tenantId } = await getUserWithRole()
  if (!user) redirect('/auth/login')

  const supabase = await createServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, created_at')
    .eq('id', user.id)
    .single()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name')
    .eq('id', tenantId)
    .single()

  const initialProfile = {
    fullName: profile?.full_name || 'Client Owner',
    avatarUrl: profile?.avatar_url || null,
    email: user.email || '',
    role: role || 'CLIENT_OWNER',
    tenantName: tenant?.name || 'Rakshak Organization',
    createdAt: profile?.created_at || new Date().toISOString()
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Personal Profile & Account Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your personal information, security credentials, and profile picture.</p>
      </div>

      <ProfileForm initialProfile={initialProfile} />
    </div>
  )
}
