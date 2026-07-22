import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

async function handleLogout(request: Request) {
  const supabase = await createClient()

  // Sign out user session
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')

  const origin = new URL(request.url).origin
  return NextResponse.redirect(`${origin}/auth/login`, {
    status: 302,
  })
}

export async function POST(request: Request) {
  return handleLogout(request)
}

export async function GET(request: Request) {
  return handleLogout(request)
}
