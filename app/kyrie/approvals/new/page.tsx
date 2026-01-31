import { ApprovalForm } from "@/components/approvals/approval-form"

export default function NewApprovalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nova Aprovação</h1>
        <p className="text-muted-foreground">
          Envie novos itens para aprovação do cliente.
        </p>
      </div>
      <ApprovalForm />
    </div>
  )
}
