import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface AdminMetricsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function AdminMetricsCard({
  title,
  value,
  description,
  icon: Icon,
  change,
  trend
}: AdminMetricsCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-purple-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || change) && (
            <p className="text-xs text-muted-foreground mt-1">
                {change && (
                    <span className={`font-medium mr-1 ${
                        trend === 'up' ? 'text-emerald-500' : 
                        trend === 'down' ? 'text-rose-500' : 'text-yellow-500'
                    }`}>
                        {change}
                    </span>
                )}
                {description}
            </p>
        )}
      </CardContent>
    </Card>
  )
}
