"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Filter, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Database } from "@/types/supabase"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type Approval = Database['public']['Tables']['approvals']['Row'] & {
  organizations: { name: string } | null
}

const statusMap: Record<string, { label: string, color: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", color: "secondary" },
  approved: { label: "Aprovado", color: "default" }, // Greenish via class override usually, but default for now
  rejected: { label: "Rejeitado", color: "destructive" },
  revision: { label: "Revisão", color: "secondary" }, // Orange-ish
  expired: { label: "Expirado", color: "outline" }
}

export function ApprovalsList() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    try {
      const { data, error } = await supabase
        .from('approvals')
        .select('*, organizations(name)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setApprovals(data as unknown as Approval[])
    } catch (error) {
      console.error('Error fetching approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Todas as Aprovações</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
          <Button size="sm" asChild>
            <Link href="/kyrie/approvals/new">
              <Plus className="w-4 h-4 mr-2" />
              Nova Aprovação
            </Link>
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma aprovação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              approvals.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.organizations?.name || '-'}</TableCell>
                  <TableCell className="capitalize">{item.content_type}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[item.status || 'pending'].color as any}>
                      {statusMap[item.status || 'pending'].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(item.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/kyrie/approvals/${item.id}`)}>
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem><span className="text-destructive">Excluir</span></DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
