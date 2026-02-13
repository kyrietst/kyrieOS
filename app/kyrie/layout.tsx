import { Command } from 'lucide-react'
import { GlobalTimer } from '@/components/timer/GlobalTimer'
import { getUnreadInboxCount } from '@/actions/inbox'
import { getClients } from '@/actions/clients'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { HeaderActionsProvider } from '@/contexts/HeaderActionsContext'
import { TitleProvider } from '@/contexts/TitleContext'
import { Header } from '@/components/layout/Header'
import { PageTitle } from '@/components/layout/PageTitle'

export default async function KyrieLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [unreadInboxCount, clients] = await Promise.all([
    getUnreadInboxCount().catch((e) => { console.error("Inbox Error:", e); return 0 }),
    getClients().catch((e) => { console.error("Clients Error:", e); return [] })
  ])

  return (
    <HeaderActionsProvider>
      <TitleProvider>
        <div className="flex h-[100dvh] w-screen overflow-hidden bg-background text-foreground">
          {/* Sidebar */}
          <aside className="w-64 border-r border-border bg-sidebar hidden md:flex flex-col">
            <div className="p-6 flex items-center gap-2 border-b border-border/40">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                <Command className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">Kyrie Admin</span>
            </div>

            <SidebarNav unreadInboxCount={unreadInboxCount} clients={clients} />

          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/20">
            <Header />
            <div className="flex-1 relative overflow-hidden">
              {children}
            </div>
          </main>

          <GlobalTimer />
        </div>
      </TitleProvider>
    </HeaderActionsProvider>
  )
}

