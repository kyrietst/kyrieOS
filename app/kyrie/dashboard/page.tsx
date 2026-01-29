import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminMetricsCard } from "@/components/admin/admin-metrics-card"
import { RecentActivityFeed } from "@/components/admin/recent-activity-feed"
import { Users, DollarSign, Activity, Zap, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Dashboard Geral</h2>
           <p className="text-muted-foreground mt-1">Visão completa do ecossistema Kyrie OS.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline">Baixar Relatório Geral</Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
                <Zap className="mr-2 h-4 w-4" />
                Ações Rápidas IA
            </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminMetricsCard 
            title="Clientes Ativos"
            value="12"
            icon={Users}
            change="+2 este mês"
            trend="up"
        />
        <AdminMetricsCard 
            title="MRR (Estimado)"
            value="R$ 48.500"
            icon={DollarSign}
            change="+15% vs mês anterior"
            trend="up"
        />
        <AdminMetricsCard 
            title="Projetos em Execução"
            value="34"
            icon={Activity}
            description="5 entregas esta semana"
        />
         <AdminMetricsCard 
            title="Relatórios Gerados"
            value="128"
            icon={FileText}
            change="+12% produtividade"
            trend="up"
        />
      </div>

      {/* Main Grid: Activity & Insights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Activity (Left/Large) */}
        <Card className="col-span-4 border-border/60 bg-card/40">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityFeed />
          </CardContent>
        </Card>

        {/* AI Quick Actions / Anomalies (Right/Small) */}
        <Card className="col-span-3 border-purple-500/20 bg-purple-950/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Insights da IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <h4 className="font-semibold text-orange-200 text-sm mb-1">Atenção Necessária</h4>
                <p className="text-xs text-orange-200/80">O cliente <strong>TechCorp</strong> teve queda de 15% no engajamento esta semana.</p>
            </div>
             <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="font-semibold text-emerald-200 text-sm mb-1">Oportunidade</h4>
                <p className="text-xs text-emerald-200/80">3 clientes atingiram ROI &gt; 5x. Sugestão: Oferecer upgrade de plano.</p>
            </div>
            
            <div className="pt-4">
                <Button variant="secondary" className="w-full">Ver todos os Insights</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
