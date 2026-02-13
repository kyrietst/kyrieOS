import { ClientTable } from "@/components/admin/client-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TitleSetter } from "@/components/layout/TitleSetter"
import { PageContainer } from "@/components/layout/PageContainer"

export default function ClientsPage() {
  return (
    <PageContainer>
      <TitleSetter title="Gestão de Clientes" />
      <div className="flex items-center justify-end mb-8">
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <ClientTable />
      </div>
    </PageContainer>
  )
}
