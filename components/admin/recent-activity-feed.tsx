import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ActivityItem {
    id: string
    user: {
        name: string
        avatar?: string
        initials: string
    }
    action: string
    target: string
    time: string
}

const mockActivities: ActivityItem[] = [
    {
        id: '1',
        user: { name: 'Ana Silva', initials: 'AS' },
        action: 'solicitou',
        target: 'Relatório de SEO',
        time: 'há 10 min'
    },
    {
        id: '2',
        user: { name: 'Marcos Oliveira', initials: 'MO' },
        action: 'aprovou',
        target: 'Campanha Q1',
        time: 'há 45 min'
    },
    {
        id: '3',
        user: { name: 'Kyrie AI', initials: 'AI' },
        action: 'gerou',
        target: 'Insights Semanais',
        time: 'há 1 hora'
    },
    {
        id: '4',
        user: { name: 'Julia Santos', initials: 'JS' },
        action: 'comentou em',
        target: 'Landing Page V2',
        time: 'há 2 horas'
    },
]

export function RecentActivityFeed() {
  return (
    <div className="space-y-8">
      {mockActivities.map((item) => (
        <div key={item.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={item.user.avatar} alt={item.user.name} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{item.user.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              <span className="text-foreground">{item.user.name}</span>{" "}
              <span className="text-muted-foreground">{item.action}</span>{" "}
              <span className="font-semibold text-primary">{item.target}</span>
            </p>
            <p className="text-xs text-muted-foreground">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
