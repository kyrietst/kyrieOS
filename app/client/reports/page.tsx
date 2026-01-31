import { createClient } from '@/utils/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Calendar, ArrowRight } from 'lucide-react'

export default async function ClientReportsPage() {
  const supabase = await createClient()
  
  // Fetch reports (RLS handles filtering by user's org)
  const { data: reports, error } = await supabase
    .from('reports')
    .select('id, title, created_at, status, report_type, period_start, period_end')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Relatórios</h2>
        <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-lg">
          Erro ao carregar relatórios: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe o desempenho e progresso dos seus projetos.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports?.map((report) => (
          <Card key={report.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Badge variant={report.status === 'generated' ? 'default' : 'secondary'}>
                  {report.status === 'generated' ? 'Disponível' : report.status}
                </Badge>
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg mt-2">{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(report.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {report.period_start && (
                  <div className="text-xs">
                    Período: {new Date(report.period_start).toLocaleDateString('pt-BR')} - {new Date(report.period_end).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/client/reports/${report.id}`}>
                  Ler Relatório
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {!reports?.length && (
           <div className="col-span-full p-12 text-center border border-dashed rounded-lg">
             <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
             <h3 className="text-lg font-medium">Nenhum relatório encontrado</h3>
             <p className="text-muted-foreground">
               Os relatórios serão gerados semanalmente pela nossa IA.
             </p>
           </div>
        )}
      </div>
    </div>
  )
}
