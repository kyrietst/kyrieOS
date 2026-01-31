import { ApprovalsList } from "@/components/approvals/approvals-list"
import { ApprovalUploadModal } from "@/components/approvals/approval-upload-modal"
import { Button } from "@/components/ui/button"

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Aprovações</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe itens enviados para aprovação dos clientes.
          </p>
        </div>
        <ApprovalUploadModal>
            <Button>Nova Aprovação</Button>
        </ApprovalUploadModal>
      </div>
      <ApprovalsList />
    </div>
  )
}
