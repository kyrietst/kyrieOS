---
name: kyrie-role-routing
description: Single-app role-based routing for Kyrie OS (KYRIE_ADMIN and CLIENT_OWNER)
tags: [nextjs, routing, middleware, auth, roles]
version: 1.0.0
---

# Kyrie Role-Based Routing

## Overview
Implements role-based routing in Next.js 14 for Kyrie OS.
**Single app** with different views based on `user.role`.

## Roles
- `KYRIE_ADMIN` → Routes: `/kyrie/*` (Gilmar dashboard)
- `CLIENT_OWNER` → Routes: `/client/*` (Client portal)
- `CLIENT_VIEWER` → Routes: `/client/*` (Read-only)

## Architecture

```
app/
├── (auth)/
│   └── login/page.tsx          # Unified login
├── (kyrie)/                    # KYRIE_ADMIN only
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── clients/page.tsx
│   └── backlog/page.tsx
├── (client)/                   # CLIENT_OWNER/VIEWER
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── projects/page.tsx
│   └── reports/page.tsx
└── middleware.ts               # Role routing logic
```

## Middleware Implementation

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Not authenticated → redirect to login
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Authenticated → route by role
  if (session) {
    const { data: user } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('id', session.user.id)
      .single()

    const path = req.nextUrl.pathname

    // KYRIE_ADMIN routes
    if (user?.role === 'KYRIE_ADMIN') {
      // Block access to client routes
      if (path.startsWith('/client')) {
        return NextResponse.redirect(new URL('/kyrie/dashboard', req.url))
      }
      // Redirect root to admin dashboard
      if (path === '/') {
        return NextResponse.redirect(new URL('/kyrie/dashboard', req.url))
      }
    }

    // CLIENT_OWNER routes
    if (user?.role === 'CLIENT_OWNER' || user?.role === 'CLIENT_VIEWER') {
      // Block access to admin routes
      if (path.startsWith('/kyrie')) {
        return NextResponse.redirect(new URL('/client/dashboard', req.url))
      }
      // Redirect root to client dashboard
      if (path === '/') {
        return NextResponse.redirect(new URL('/client/dashboard', req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

## Layout Patterns

### Kyrie Admin Layout
```typescript
// app/(kyrie)/layout.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KyrieSidebar } from '@/components/kyrie/sidebar'
import { KyrieHeader } from '@/components/kyrie/header'

export default async function KyrieLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Double-check role (security)
  if (user?.role !== 'KYRIE_ADMIN') {
    redirect('/client/dashboard')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <KyrieSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <KyrieHeader user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Client Portal Layout
```typescript
// app/(client)/layout.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientSidebar } from '@/components/client/sidebar'
import { ClientHeader } from '@/components/client/header'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check role
  if (!['CLIENT_OWNER', 'CLIENT_VIEWER'].includes(user?.role)) {
    redirect('/kyrie/dashboard')
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <ClientSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ClientHeader user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

## Server Component Role Check

```typescript
// app/(kyrie)/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function KyrieDashboard() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Role check
  if (user?.role !== 'KYRIE_ADMIN') {
    redirect('/client/dashboard')
  }

  // Fetch data for admin
  const { data: clients } = await supabase
    .from('organizations')
    .select('*')

  return <DashboardView clients={clients} />
}
```

## Client Component with Role

```typescript
// components/kyrie/client-selector.tsx
'use client'

import { useUser } from '@/hooks/use-user'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ClientSelector() {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user?.role !== 'KYRIE_ADMIN') {
      router.push('/client/dashboard')
    }
  }, [user, router])

  if (user?.role !== 'KYRIE_ADMIN') {
    return null
  }

  return <SelectComponent />
}
```

## Database Schema

```sql
-- users table with role
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('KYRIE_ADMIN', 'KYRIE_TEAM', 'CLIENT_OWNER', 'CLIENT_VIEWER')),
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Kyrie admin can read all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'KYRIE_ADMIN'
    )
  );
```

## Best Practices

✅ **Double-check roles** - Middleware + layout + page
✅ **Use route groups** - (kyrie) and (client)
✅ **Separate layouts** - Different UI for each role
✅ **Server components** - Check role server-side
✅ **RLS policies** - Database-level security

❌ **Don't mix components** - Keep (kyrie) and (client) separate
❌ **Don't skip middleware** - First line of defense
❌ **Don't trust client** - Always check server-side
❌ **Don't hardcode redirects** - Use role-based logic

## Component Organization

```
components/
├── kyrie/                    # KYRIE_ADMIN only
│   ├── dashboard/
│   ├── clients/
│   └── shared/
│       ├── sidebar.tsx
│       └── header.tsx
└── client/                   # CLIENT_OWNER/VIEWER
    ├── dashboard/
    ├── projects/
    └── shared/
        ├── sidebar.tsx
        └── header.tsx
```

## Testing

```typescript
// __tests__/middleware.test.ts
import { describe, it, expect } from 'vitest'

describe('Role Routing', () => {
  it('redirects admin to /kyrie/dashboard', async () => {
    const user = { role: 'KYRIE_ADMIN' }
    const result = await middleware(user, '/')
    expect(result.url).toBe('/kyrie/dashboard')
  })

  it('redirects client to /client/dashboard', async () => {
    const user = { role: 'CLIENT_OWNER' }
    const result = await middleware(user, '/')
    expect(result.url).toBe('/client/dashboard')
  })
})
```
