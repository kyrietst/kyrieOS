import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminMetricsCard } from "@/components/admin/admin-metrics-card"
import { RecentActivityFeed } from "@/components/admin/recent-activity-feed"
import { ClientHealthList } from "@/components/admin/client-health-list"
import { Users, DollarSign, Activity, Zap, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { GenerateReportButton } from "@/components/admin/generate-report-button"
import { TitleSetter } from "@/components/layout/TitleSetter"
import { PageContainer } from "@/components/layout/PageContainer"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. Fetch Metrics Data in Parallel
  const [
    orgsResponse,
    projectsResponse,
    reportsResponse,
    activitiesResponse,
    healthResponse
  ] = await Promise.all([
    supabase.from('organizations').select('id, monthly_fee, status'),
    supabase.from('projects').select('id, status'),
    supabase.from('reports').select('id', { count: 'exact' }),
    supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('client_health').select('*, organizations(name)').order('churn_risk_percentage', { ascending: false }).limit(5)
  ])

  // 2. Calculate KPIs
  const activeOrgs = orgsResponse.data?.filter(o => o.status === 'active') || []
  const mrr = activeOrgs.reduce((sum, org) => sum + (org.monthly_fee || 0), 0)

  const activeProjects = projectsResponse.data?.filter(p => p.status === 'active' || p.status === 'in_progress').length || 0
  const totalReports = reportsResponse.count || 0

  // 3. Prepare Lists
  const recentActivities = activitiesResponse.data || []

  const healthList = healthResponse.data?.map(h => ({
    id: h.id,
    organization_name: h.organizations?.name || 'Desconhecido',
    health_score: h.health_score,
    churn_risk_level: h.churn_risk_level
  })) || []

  return (
    <PageContainer>
      <TitleSetter title="Dashboard Geral" />

      {/* Header Actions */}
      <div className="flex items-center justify-end mb-8">
        <div className="flex items-center gap-2">
          <Button variant="outline">Baixar Relatório Geral</Button>
          <GenerateReportButton />
        </div>
      </div>

      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AdminMetricsCard
            title="Clientes Ativos"
            value={activeOrgs.length}
            icon={Users}
            change="+1 este mês (simulado)"
            trend="up"
          />
          <AdminMetricsCard
            title="MRR (Recorrente)"
            value={`R$ ${mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            change="+5% vs mês anterior"
            trend="up"
          />
          <AdminMetricsCard
            title="Projetos em Execução"
            value={activeProjects}
            icon={Activity}
            description="Projetos ativos ou em andamento"
          />
          <AdminMetricsCard
            title="Relatórios Gerados"
            value={totalReports}
            icon={FileText}
            change="Total acumulado"
            trend="neutral"
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
              <RecentActivityFeed activities={recentActivities} />
            </CardContent>
          </Card>

          {/* Client Health & Insights (Right/Small) */}
          <Card className="col-span-3 border-purple-500/20 bg-purple-950/5 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Saúde dos Clientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <ClientHealthList clients={healthList} />

              <div className="pt-4 mt-auto">
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/kyrie/clients">Ver todos os Clientes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
