import { createClient } from '@/utils/supabase/server'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FolderKanban, Activity, BarChart2 } from 'lucide-react'

export default async function ClientProjectsPage() {
  const supabase = await createClient()

  // Fetch projects with tasks to calc ICE
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*, tasks(id, ice_impact, ice_confidence, ice_effort, status)')
    .order('created_at', { ascending: false })

  if (error) {
    return (
     <div className="p-4 border border-destructive/50 text-destructive bg-destructive/10 rounded-lg">
       Erro ao carregar projetos.
     </div>
    )
  }

  // Calculate stats per project
  const projectsWithStats = projects?.map(project => {
    const tasks = project.tasks || []
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t: any) => t.status === 'done').length
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    
    // Avg ICE
    let totalIce = 0
    let scorableTasks = 0
    tasks.forEach((t: any) => {
        if (t.ice_impact && t.ice_confidence && t.ice_effort) {
            totalIce += (t.ice_impact * t.ice_confidence) / t.ice_effort
            scorableTasks++
        }
    })
    const avgIce = scorableTasks > 0 ? totalIce / scorableTasks : 0

    return { ...project, progress, avgIce, totalTasks, completedTasks }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meus Projetos</h2>
          <p className="text-muted-foreground mt-1">
            Status dos projetos em andamento e priorização.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projectsWithStats?.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="capitalize">
                  {project.status === 'completed' ? 'Concluído' : 
                   project.status === 'in_progress' ? 'Em Andamento' : 
                   project.status === 'archived' ? 'Arquivado' :
                   project.status}
                </Badge>
                {project.avgIce > 0 && (
                    <div className="flex items-center text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                        <Activity className="w-3 h-3 mr-1" />
                        ICE: {project.avgIce.toFixed(1)}
                    </div>
                )}
              </div>
              <CardTitle className="mt-4">{project.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {project.description || "Sem descrição"}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progresso</span>
                        <span>{project.completedTasks}/{project.totalTasks} tarefas</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                 </div>
                 
                 <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex -space-x-2">
                        {/* Placeholder for team avatars if available */}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center">
                        <CalendarIcon date={project.created_at} />
                    </span>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!projectsWithStats?.length && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
                <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum projeto encontrado.</p>
            </div>
        )}
      </div>
    </div>
  )
}

function CalendarIcon({ date }: { date: string }) {
    if (!date) return null
    return (
        <>
            Iniciado em {new Date(date).toLocaleDateString('pt-BR')}
        </>
    )
}
