import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Create Supabase Client
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
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. Check Auth User
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Public Routes (Login)
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. Role-Based Routing
  if (user) {
    // Buscar perfil para ver a role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const path = request.nextUrl.pathname
    const role = profile?.role || 'CLIENT_VIEWER'

    // Regras de Redirecionamento
    
    // Admin Routes
    if (role === 'KYRIE_ADMIN' || role === 'KYRIE_TEAM') {
      // Admin tentando acessar área de cliente? (Opcional: permitir ou redirecionar)
      // Por enquanto, vamos manter separado para clareza
      if (path.startsWith('/client')) {
        return NextResponse.redirect(new URL('/kyrie/dashboard', request.url))
      }
    }

    // Client Routes
    if (role === 'CLIENT_OWNER' || role === 'CLIENT_VIEWER') {
      // Cliente tentando acessar área admin
      if (path.startsWith('/kyrie')) {
        return NextResponse.redirect(new URL('/client/dashboard', request.url))
      }
    }

    // Root path redirect
    if (path === '/') {
      if (role === 'KYRIE_ADMIN' || role === 'KYRIE_TEAM') {
        return NextResponse.redirect(new URL('/kyrie/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/client/dashboard', request.url))
      }
    }
    
    // Logged in user at login page
    if (path.startsWith('/login')) {
        if (role === 'KYRIE_ADMIN' || role === 'KYRIE_TEAM') {
            return NextResponse.redirect(new URL('/kyrie/dashboard', request.url))
          } else {
            return NextResponse.redirect(new URL('/client/dashboard', request.url))
          }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
