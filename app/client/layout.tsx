import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  FolderKanban, 
  FileText, 
  FileCheck,
  GraduationCap, 
  LogOut,
  Building2
} from 'lucide-react'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar - Client Theme */}
      <aside className="w-64 border-r border-border bg-sidebar hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-border/40">
           <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Portal do Cliente</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" asChild>
            <Link href="/client/dashboard">
              <BarChart3 className="w-4 h-4" />
              Visão Geral (ROI)
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" asChild>
            <Link href="/client/projects">
              <FolderKanban className="w-4 h-4" />
              Meus Projetos
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" asChild>
            <Link href="/client/approvals">
              <FileCheck className="w-4 h-4" />
              Aprovações
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" asChild>
            <Link href="/client/reports">
              <FileText className="w-4 h-4" />
              Relatórios Semanais
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" asChild>
            <Link href="/client/tutorials">
              <GraduationCap className="w-4 h-4" />
              Tutoriais & Treinamentos
            </Link>
          </Button>
        </nav>

        <div className="p-4 border-t border-border/40">
           <form action="/auth/signout" method="post">
             <Button variant="outline" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:border-destructive/50" type="submit">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
           </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <header className="h-16 flex items-center px-6 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-xl font-semibold">Área do Cliente</h1>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
