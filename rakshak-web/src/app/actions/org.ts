'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/utils/supabase/admin'
import { writeAuditLog } from '@/utils/audit'
import { getUserWithRole } from '@/utils/auth-check'

async function verifyClientOwner() {
  const { user, role, tenantId } = await getUserWithRole()

  if (!user || role !== 'CLIENT_OWNER') {
    throw new Error('Unauthorized')
  }

  return { user, tenant_id: tenantId as string }
}

export async function createSite(formData: FormData) {
  const { user, tenant_id } = await verifyClientOwner()
  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const image = formData.get('image') as File | null

  if (!tenant_id) throw new Error('No tenant ID found')

  const adminClient = getAdminClient()

  // Capacity check
  const { data: tenantData, error: tenantError } = await adminClient
    .from('tenants')
    .select('site_capacity')
    .eq('id', tenant_id)
    .single()

  if (tenantError) throw new Error('Could not fetch tenant capacity')

  const { count: currentSites, error: siteCountError } = await adminClient
    .from('sites')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenant_id)

  if (siteCountError) throw new Error('Could not count current sites')

  if ((currentSites || 0) >= tenantData.site_capacity) {
    throw new Error(`Capacity exceeded. This tenant is limited to ${tenantData.site_capacity} sites.`)
  }

  let image_url: string | null = null;
  
  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const fileName = `${tenant_id}/${Date.now()}.${fileExt}`
    const { error: uploadError } = await adminClient.storage
      .from('site_images')
      .upload(fileName, image, {
        cacheControl: '3600',
        upsert: false
      })
      
    if (uploadError) {
      console.error("Image upload failed:", uploadError);
      throw new Error('Failed to upload image')
    }
    
    const { data: { publicUrl } } = adminClient.storage
      .from('site_images')
      .getPublicUrl(fileName)
      
    image_url = publicUrl
  }

  const { data: site, error: insertError } = await adminClient
    .from('sites')
    .insert({
      name,
      address,
      tenant_id,
      image_url
    })
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)

  await writeAuditLog({
    actor: user.id,
    action: 'CREATE_SITE',
    target_resource: `Site: ${site.id}`,
    tenant_id
  })

  revalidatePath('/org/sites')
  return { success: true }
}

export async function assignSupervisorToSite(formData: FormData) {
  const { user, tenant_id } = await verifyClientOwner()
  const supervisorId = formData.get('supervisorId') as string
  const siteId = formData.get('siteId') as string

  if (!tenant_id) throw new Error('No tenant ID found')

  const adminClient = getAdminClient()

  const { error } = await adminClient
    .from('supervisor_sites')
    .insert({
      supervisor_id: supervisorId,
      site_id: siteId,
      tenant_id
    })

  if (error) throw new Error(error.message)

  await writeAuditLog({
    actor: user.id,
    action: 'ASSIGN_SUPERVISOR_TO_SITE',
    target_resource: `Supervisor: ${supervisorId}, Site: ${siteId}`,
    tenant_id
  })

  revalidatePath('/org/supervisors')
  return { success: true }
}

export async function updateSupervisorSites(supervisorId: string, siteIds: string[]) {
  const { user, tenant_id } = await verifyClientOwner()

  if (!tenant_id) throw new Error('No tenant ID found')

  const adminClient = getAdminClient()

  // Clear existing
  await adminClient
    .from('supervisor_sites')
    .delete()
    .eq('supervisor_id', supervisorId)
    .eq('tenant_id', tenant_id)

  if (siteIds.length > 0) {
    const toInsert = siteIds.map(siteId => ({
      supervisor_id: supervisorId,
      site_id: siteId,
      tenant_id
    }))

    const { error } = await adminClient
      .from('supervisor_sites')
      .insert(toInsert)

    if (error) throw new Error(error.message)
  }

  await writeAuditLog({
    actor: user.id,
    action: 'UPDATE_SUPERVISOR_SITES',
    target_resource: `Supervisor: ${supervisorId}, Sites: [${siteIds.join(',')}]`,
    tenant_id
  })

  revalidatePath('/org/supervisors')
  return { success: true }
}

