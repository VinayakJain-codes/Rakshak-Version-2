import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthRoute = pathname.startsWith('/auth')
  const isPublicRoute = pathname === '/'

  if (!user && !isAuthRoute && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Read role from JWT app_metadata (set by custom claims or triggers, not user_metadata)
    // If not present, default to nothing (no access)
    const role = user.app_metadata?.role

    if (!role && !isAuthRoute && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.rewrite(url)
    }

    if (pathname.startsWith('/admin') && role !== 'SUPER_ADMIN') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.rewrite(url)
    }

    if (pathname.startsWith('/org') && role !== 'CLIENT_OWNER') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.rewrite(url)
    }

    if (pathname.startsWith('/ops') && role !== 'SUPERVISOR') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.rewrite(url)
    }

    if (pathname.startsWith('/guard') && role !== 'GUARD') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.rewrite(url)
    }

    // Redirect authenticated users away from auth pages
    if (isAuthRoute) {
      const url = request.nextUrl.clone()
      if (role === 'SUPER_ADMIN') url.pathname = '/admin'
      else if (role === 'CLIENT_OWNER') url.pathname = '/org'
      else if (role === 'SUPERVISOR') url.pathname = '/ops'
      else if (role === 'GUARD') url.pathname = '/guard'
      else url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
