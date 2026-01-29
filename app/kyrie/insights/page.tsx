import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminMetricsCard } from "@/components/admin/admin-metrics-card"
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">AI Insights Center</h2>
           <p className="text-muted-foreground mt-1">Análise preditiva e monitoramento de saúde dos clientes.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
            Nova Análise Geral
        </Button>
      </div>

       {/* Metrics */}
       <div className="grid gap-4 md:grid-cols-3">
        <AdminMetricsCard 
            title="Saúde Geral"
            value="98%"
            icon={CheckCircle}
            trend="up"
            change="+2%"
        />
        <AdminMetricsCard 
            title="Risco de Churn"
            value="1"
            icon={AlertTriangle}
            trend="down"
            change="Baixo"
        />
        <AdminMetricsCard 
            title="Oportunidades"
            value="R$ 15k"
            icon={TrendingUp}
            trend="up"
            change="Upsell"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
         {/* Anomaly Detection */}
        <Card className="border-orange-500/30 bg-orange-950/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-400">
                    <AlertTriangle className="w-5 h-5" />
                    Anomalias Detectadas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-background/50 rounded-lg border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">Queda de Engajamento</span>
                        <span className="text-xs text-muted-foreground">Há 2 horas</span>
                    </div>
                    <p className="text-sm text-muted-foreground">O cliente <strong>Bakery Deluxe</strong> não acessa a plataforma há 7 dias, um desvio do padrão usual de 2 dias.</p>
                     <Button variant="link" className="text-orange-400 p-0 h-auto mt-2">Investigar Cliente &rarr;</Button>
                </div>
                 <div className="p-4 bg-background/50 rounded-lg border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">ROI Inconsistente</span>
                        <span className="text-xs text-muted-foreground">Há 1 dia</span>
                    </div>
                    <p className="text-sm text-muted-foreground">O projeto <strong>Consulting Web</strong> reportou ROI de 0% mesmo com 50h de trabalho.</p>
                     <Button variant="link" className="text-orange-400 p-0 h-auto mt-2">Verificar Dados &rarr;</Button>
                </div>
            </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="border-purple-500/30 bg-purple-950/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                    <Sparkles className="w-5 h-5" />
                    Recomendações da IA
                </CardTitle>
            </CardHeader>
             <CardContent className="space-y-4">
                <div className="p-4 bg-background/50 rounded-lg border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">Sugestão de Upsell</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Alta Confiança</span>
                    </div>
                    <p className="text-sm text-muted-foreground">O cliente <strong>TechCorp</strong> está usando 90% da cota de horas. Bom momento para oferecer o plano Enterprise.</p>
                    <Button variant="outline" className="w-full mt-3 border-purple-500/50 hover:bg-purple-500/10">Gerar Proposta via IA</Button>
                </div>
                 <div className="p-4 bg-background/50 rounded-lg border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">Otimização de Processo</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Média Confiança</span>
                    </div>
                    <p className="text-sm text-muted-foreground">3 projetos similares foram concluídos na semana passada. Sugiro criar um template de "Website Launch" para economizar 15% de tempo.</p>
                     <Button variant="outline" className="w-full mt-3 border-purple-500/50 hover:bg-purple-500/10">Criar Template</Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
