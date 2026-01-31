import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ActivityItem {
    id: string
    user_id: string
    user_name: string
    action_type: string
    action_title: string
    target_name: string
    created_at: string
}

interface RecentActivityFeedProps {
    activities?: ActivityItem[]
}

export function RecentActivityFeed({ activities = [] }: RecentActivityFeedProps) {
  if (activities.length === 0) {
      return (
          <div className="text-center py-8 text-muted-foreground">
              Nenhuma atividade recente.
          </div>
      )
  }

  return (
    <div className="space-y-8">
      {activities.map((item) => {
        // Initials logic
        const initials = item.user_name 
            ? item.user_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
            : 'S'
            
        return (
        <div key={item.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            {/* Logic for avatar image if available in future */}
            <AvatarFallback className="text-xs bg-primary/10 text-primary uppercase">{initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              <span className="text-foreground font-semibold">{item.user_name}</span>{" "}
              <span className="text-muted-foreground">{mapActionType(item.action_type)}</span>{" "}
              <span className="font-semibold text-primary">{item.target_name || item.action_title}</span>
            </p>
            <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </div>
      )})}
    </div>
  )
}

function mapActionType(type: string) {
    switch (type) {
        case 'report_generated': return 'gerou novo relatório'
        case 'project_created': return 'criou projeto'
        case 'task_completed': return 'concluiu tarefa'
        case 'client_updated': return 'atualizou cliente'
        default: return 'realizou ação em'
    }
}
