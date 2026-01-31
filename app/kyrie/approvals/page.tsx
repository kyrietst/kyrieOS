import { ApprovalsList } from "@/components/approvals/approvals-list"

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Aprovações</h1>
        <p className="text-muted-foreground">
          Gerencie e acompanhe itens enviados para aprovação dos clientes.
        </p>
      </div>
      <ApprovalsList />
    </div>
  )
}
