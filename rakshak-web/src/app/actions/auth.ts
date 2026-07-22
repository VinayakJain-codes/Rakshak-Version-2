'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { getAdminClient } from '@/utils/supabase/admin'
import { writeAuditLog } from '@/utils/audit'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUserWithRole } from '@/utils/auth-check'

// Ensure the caller is authorized to perform the action
async function verifyAuthorization(allowedRoles: string[]) {
  const { user, role, tenantId } = await getUserWithRole()

  if (!user) {
    throw new Error('Not authenticated')
  }

  if (!role || !allowedRoles.includes(role)) {
    throw new Error('Unauthorized')
  }

  return { user, role, tenant_id: tenantId }
}

export async function createTenantAndClientOwner(formData: FormData) {
  const tenantName = formData.get('tenantName') as string
  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string
  const guardCapacity = parseInt((formData.get('guardCapacity') as string) || '10')
  const siteCapacity = parseInt((formData.get('siteCapacity') as string) || '5')

  const { user: actorUser } = await verifyAuthorization(['SUPER_ADMIN'])

  const adminClient = getAdminClient()

  // 1. Create the tenant
  const { data: tenant, error: tenantError } = await adminClient
    .from('tenants')
    .insert({ 
      name: tenantName,
      owner_email: email,
      guard_capacity: guardCapacity,
      site_capacity: siteCapacity,
    })
    .select()
    .single()

  if (tenantError) throw new Error(tenantError.message)

  // 2. Create the Auth User
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    // rollback tenant creation
    await adminClient.from('tenants').delete().eq('id', tenant.id)
    throw new Error(authError.message)
  }

  // 3. Create the Profile
  const { error: profileError } = await adminClient
    .from('profiles')
    .insert({
      id: authData.user.id,
      role: 'CLIENT_OWNER',
      tenant_id: tenant.id,
      full_name: fullName,
    })

  if (profileError) {
    await adminClient.auth.admin.deleteUser(authData.user.id)
    await adminClient.from('tenants').delete().eq('id', tenant.id)
    throw new Error(profileError.message)
  }

  await writeAuditLog({
    actor: actorUser.id,
    action: 'CREATE_TENANT',
    target_resource: `Tenant: ${tenant.id}, Owner: ${authData.user.id}`,
    tenant_id: tenant.id
  })

  revalidatePath('/admin')
  return { success: true }
}

export async function createSupervisor(formData: FormData) {
  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const password = crypto.randomUUID().slice(0, 12) + 'aA1!' // Auto-generated secure password

  const { tenant_id, user: actorUser } = await verifyAuthorization(['CLIENT_OWNER'])

  if (!tenant_id) throw new Error('No tenant ID found for caller')

  const adminClient = getAdminClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) throw new Error(authError.message)

  const { error: profileError } = await adminClient
    .from('profiles')
    .insert({
      id: authData.user.id,
      role: 'SUPERVISOR',
      tenant_id,
      full_name: fullName,
    })

  if (profileError) {
    await adminClient.auth.admin.deleteUser(authData.user.id)
    throw new Error(profileError.message)
  }

  await writeAuditLog({
    actor: actorUser.id,
    action: 'CREATE_SUPERVISOR',
    target_resource: `Profile: ${authData.user.id}`,
    tenant_id
  })

  revalidatePath('/org/supervisors')
  revalidatePath('/org', 'layout')
  return { success: true, generatedPassword: password }
}

export async function createGuard(formData: FormData) {
  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string

  const { tenant_id, user: actorUser } = await verifyAuthorization(['SUPERVISOR', 'CLIENT_OWNER'])

  if (!tenant_id) throw new Error('No tenant ID found for caller')

  const adminClient = getAdminClient()

  // --- CAPACITY CHECK ---
  // Get current tenant capacity and guard count
  const { data: tenantData, error: tenantQueryError } = await adminClient
    .from('tenants')
    .select('guard_capacity')
    .eq('id', tenant_id)
    .single()
    
  if (tenantQueryError) throw new Error('Could not fetch tenant capacity')

  const { count: currentGuards, error: guardCountError } = await adminClient
    .from('guards')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenant_id)

  if (guardCountError) throw new Error('Could not count current guards')

  if ((currentGuards || 0) >= tenantData.guard_capacity) {
    throw new Error(`Capacity exceeded. This tenant is limited to ${tenantData.guard_capacity} guards.`)
  }
  // ----------------------

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) throw new Error(authError.message)

  const { error: profileError } = await adminClient
    .from('profiles')
    .insert({
      id: authData.user.id,
      role: 'GUARD',
      tenant_id,
      full_name: fullName,
    })

  if (profileError) {
    await adminClient.auth.admin.deleteUser(authData.user.id)
    throw new Error(profileError.message)
  }

  const { error: guardError } = await adminClient
    .from('guards')
    .insert({
      profile_id: authData.user.id,
      tenant_id,
    })

  if (guardError) {
    await adminClient.from('profiles').delete().eq('id', authData.user.id)
    await adminClient.auth.admin.deleteUser(authData.user.id)
    throw new Error(guardError.message)
  }

  await writeAuditLog({
    actor: actorUser.id,
    action: 'CREATE_GUARD',
    target_resource: `Guard: ${authData.user.id}`,
    tenant_id
  })

  revalidatePath('/ops')
  revalidatePath('/ops/guards')
  revalidatePath('/org/supervisors')
  revalidatePath('/org')
  return { success: true }
}

export async function login({ email, password }: { email: string, password: string }) {
  console.log('--- login action triggered ---')
  console.log('Received email:', email, 'password:', password ? '***' : null)

  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Supabase Auth Error:', JSON.stringify(error, null, 2))
    return { error: `ERROR: ${JSON.stringify(error)}` }
  }

  // Role from JWT (set by hook or directly on app_metadata)
  let role = data.user?.app_metadata?.role

  // Fallback: if hook hasn't run, read directly from profiles table
  if (!role) {
    try {
      if (!data.user?.id) throw new Error('User object missing from Supabase auth response')
      
      const adminClient = getAdminClient()
      const { data: profile, error: dbError } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
        
      if (dbError) {
        console.error('DB Error fetching role:', dbError)
      }
      role = profile?.role
    } catch (e: any) {
      console.error('Error in auth fallback logic:', e)
      return { error: `Fallback Error: ${e.message}` }
    }
  }

  if (role === 'SUPER_ADMIN') return { redirectTo: '/admin' }
  if (role === 'CLIENT_OWNER') return { redirectTo: '/org' }
  if (role === 'SUPERVISOR') return { redirectTo: '/ops' }
  if (role === 'GUARD') return { redirectTo: '/guard' }
  return { error: 'No role assigned to this account. Please contact support.' }
}

export async function logout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}
