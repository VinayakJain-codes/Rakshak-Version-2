'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { getAdminClient } from '@/utils/supabase/admin'
import { getUserWithRole } from '@/utils/auth-check'
import { revalidatePath } from 'next/cache'
import { writeAuditLog } from '@/utils/audit'

export async function updateProfileDetails(formData: FormData) {
  const { user, tenantId } = await getUserWithRole()
  if (!user || !tenantId) throw new Error('Unauthorized')

  const fullName = formData.get('fullName') as string
  const avatar = formData.get('avatar') as File | null

  if (!fullName || fullName.trim() === '') {
    throw new Error('Full name is required.')
  }

  const supabase = await createServerClient()
  const adminClient = getAdminClient()

  let avatarUrl: string | null = null

  // If a new avatar image was uploaded
  if (avatar && avatar.size > 0) {
    const ext = avatar.name.split('.').pop() || 'png'
    const fileName = `${user.id}-${Date.now()}.${ext}`

    const { error: uploadError } = await adminClient.storage
      .from('avatars')
      .upload(fileName, avatar, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      throw new Error(`Failed to upload avatar: ${uploadError.message}`)
    }

    const { data: publicUrlData } = adminClient.storage
      .from('avatars')
      .getPublicUrl(fileName)

    avatarUrl = publicUrlData.publicUrl
  }

  const updateData: any = { full_name: fullName }
  if (avatarUrl) {
    updateData.avatar_url = avatarUrl
  }

  const { error: updateError } = await adminClient
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (updateError) {
    throw new Error(updateError.message)
  }

  await writeAuditLog({
    actor: user.id,
    action: 'UPDATE_PROFILE',
    target_resource: `Profile: ${user.id}`,
    tenant_id: tenantId
  })

  revalidatePath('/org', 'layout')
  revalidatePath('/org/profile')
  return { success: true, avatarUrl }
}

export async function updateUserPassword(password: string) {
  const { user, tenantId } = await getUserWithRole()
  if (!user) throw new Error('Unauthorized')

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.')
  }

  const adminClient = getAdminClient()
  const { error } = await adminClient.auth.admin.updateUserById(user.id, {
    password
  })

  if (error) {
    throw new Error(error.message)
  }

  await writeAuditLog({
    actor: user.id,
    action: 'UPDATE_PASSWORD',
    target_resource: `User: ${user.id}`,
    tenant_id: tenantId || user.id
  })

  return { success: true }
}
