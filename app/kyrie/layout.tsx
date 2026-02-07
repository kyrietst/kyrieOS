import { Command } from 'lucide-react'
import { GlobalTimer } from '@/components/timer/GlobalTimer'
import { getUnreadInboxCount } from '@/actions/inbox'
import { getClients } from '@/actions/clients'
import { SidebarNav } from '@/components/layout/sidebar-nav'

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
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
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
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <header className="h-16 flex items-center px-6 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-xl font-semibold">Kyrie Performance OS</h1>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>

      <GlobalTimer />
    </div>
  )
}

