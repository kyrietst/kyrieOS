import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  ListTodo, 
  FileCheck,
  Sparkles, 
  LogOut,
  Command,
  Inbox,
  ChevronDown,
  Book,
  KanbanSquare
} from 'lucide-react'
import { GlobalTimer } from '@/components/timer/GlobalTimer'
import { getInboxItems } from '@/actions/inbox'
import { getClients } from '@/actions/clients'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"

export default async function KyrieLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [inboxItems, clients] = await Promise.all([
    getInboxItems().catch((e) => { console.error("Inbox Error:", e); return [] }), 
    getClients().catch((e) => { console.error("Clients Error:", e); return [] })
  ])
  
  console.log("Layout Clients Fetched:", clients?.length)
  
  const unreadCount = (inboxItems as any[])?.filter((i: any) => !i.is_read).length || 0

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
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          
          <div className="px-3 mb-2 mt-4">
             <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace</span>
             <Separator className="mt-1 bg-border/40" />
          </div>

          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" asChild>
            <Link href="/kyrie/inbox">
              <Inbox className="w-4 h-4" />
              Inbox
              {unreadCount > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          </Button>

          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" asChild>
            <Link href="/kyrie/dashboard">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </Button>

           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" asChild>
            <Link href="/kyrie/ai">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Kyrie AI
            </Link>
          </Button>

          <div className="px-3 mb-2 mt-6">
             <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clientes</span>
             <Separator className="mt-1 bg-border/40" />
          </div>

          <Collapsible defaultOpen className="space-y-1">
             <CollapsibleTrigger asChild>
               <Button variant="ghost" className="w-full justify-between gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent group">
                 <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    Meus Clientes
                 </div>
                 <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
               </Button>
             </CollapsibleTrigger>
             <CollapsibleContent className="space-y-1 pl-4 border-l ml-3 border-border/50">
               {clients?.map((client: any) => (
                 <Collapsible key={client.id}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between h-8 text-sm gap-2 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 group/sub">
                        <span>{client.name}</span>
                        <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]/sub:rotate-180 opacity-50" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pl-2">
                       <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs text-muted-foreground hover:text-primary" asChild>
                         <Link href={`/kyrie/clients/${client.slug}/kanban`}>
                           <KanbanSquare className="w-3 h-3 mr-2" />
                           Kanban
                         </Link>
                       </Button>
                       <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs text-muted-foreground hover:text-primary" asChild>
                         <Link href={`/kyrie/clients/${client.slug}/wiki`}>
                           <Book className="w-3 h-3 mr-2" />
                           Wiki
                         </Link>
                       </Button>
                    </CollapsibleContent>
                 </Collapsible>
               ))}
               <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs text-muted-foreground hover:text-primary mt-2" asChild>
                  <Link href="/kyrie/clients">
                    + Ver todos
                  </Link>
               </Button>
             </CollapsibleContent>
          </Collapsible>

          <div className="px-3 mb-2 mt-6">
             <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operacional</span>
             <Separator className="mt-1 bg-border/40" />
          </div>

          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" asChild>
            <Link href="/kyrie/approvals">
              <FileCheck className="w-4 h-4" />
              Aprovações
            </Link>
          </Button>

        </nav>

        <div className="p-4 border-t border-border/40">
           <form action="/auth/signout" method="post">
             <Button variant="outline" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:border-destructive/50" type="submit">
              <LogOut className="w-4 h-4" />
              Sair do Sistema
            </Button>
           </form>
        </div>
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
