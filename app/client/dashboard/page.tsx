import { GenerateReportButton } from '@/components/ai/generate-report-button'

export default function ClientDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
            <p className="text-muted-foreground mt-1">Bem vindo ao Kyrie Portal</p>
        </div>
        <GenerateReportButton clientId="demo-client-123" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Investimento Mensal</h3>
          <p className="text-2xl font-bold mt-2">R$ 1.500,00</p>
        </div>
        <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Retorno (ROI)</h3>
          <p className="text-2xl font-bold mt-2 text-emerald-400">4.2x</p>
        </div>
        <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Projetos Ativos</h3>
          <p className="text-2xl font-bold mt-2">3</p>
        </div>
      </div>
    </div>
  )
}
