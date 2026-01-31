import { GenerateReportButton } from '@/components/ai/generate-report-button'
import { createClient } from '@/utils/supabase/server'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Activity, Briefcase } from "lucide-react"

async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Get Organization ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) return null

  // 2. Get Metrics (Last 6 months for chart)
  const { data: metrics } = await supabase
    .from('business_metrics')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('period_year', { ascending: true })
    .order('period_month', { ascending: true })
    .limit(6)

  // 3. Get Project Count
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', profile.organization_id)
    .eq('status', 'active')

  // 4. Get Latest Health (or derived from metrics)
  const latestMetric = metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null

  return {
    metrics: metrics || [],
    projectCount: projectCount || 0,
    latest: latestMetric
  }
}

export default async function ClientDashboard() {
  const data = await getDashboardData()

  // Fallback / Placeholder data if no real data exists
  // This is crucial for the "Audit" finding that DB might be empty.
  const chartData = data?.metrics.map(m => ({
    name: `${m.period_month}/${m.period_year ?? 24}`,
    revenue: Number(m.revenue),
    roi: Number(m.roi)
  })) || []

  // If no data, showing defaults or empty state is better than crash
  const currentInvestment = data?.latest?.ad_spend || 0
  const currentROI = data?.latest?.roi || 0
  const activeProjects = data?.projectCount || 0

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investimento (Mês Atual)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentInvestment)}
            </div>
            <p className="text-xs text-muted-foreground">
              +0% em relação ao mês anterior (Demo)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retorno (ROI)</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentROI >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {currentROI}x
            </div>
             <p className="text-xs text-muted-foreground">
              Performance do último período
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              Em progresso
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
             {chartData.length > 0 ? (
                <RevenueChart data={chartData} />
             ) : (
                <Card className="col-span-2 h-[350px] flex items-center justify-center text-muted-foreground">
                    Sem dados financeiros suficientes para o gráfico.
                </Card>
             )}
        </div>
        <div className="col-span-3">
             {/* Future: Recent Activity or Health Score */}
             <Card className="h-full">
                <CardHeader>
                    <CardTitle>Insights Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {data?.latest?.metadata ? 'Confira seus novos insights na aba Agentes.' : 'Nenhum insight gerado recentemente.'}
                    </p>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  )
}
