import { ClientTable } from "@/components/admin/client-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function ClientsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h2>
           <p className="text-muted-foreground mt-1">Gerencie as organizações e seus contratos.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <ClientTable />
      </div>
    </div>
  )
}
