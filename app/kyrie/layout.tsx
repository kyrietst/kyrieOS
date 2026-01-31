import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  ListTodo, 
  FileCheck,
  Sparkles, 
  LogOut,
  Command
} from 'lucide-react'
import { GlobalTimer } from '@/components/timer/GlobalTimer'

export default function KyrieLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" asChild>
            <Link href="/kyrie/dashboard">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" asChild>
            <Link href="/kyrie/clients">
              <Users className="w-4 h-4" />
              Gestão de Clientes
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" asChild>
            <Link href="/kyrie/approvals">
              <FileCheck className="w-4 h-4" />
              Aprovações
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" asChild>
            <Link href="/kyrie/backlog">
              <ListTodo className="w-4 h-4" />
              Backlog Inteligente
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" asChild>
            <Link href="/kyrie/insights">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI Insights
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
