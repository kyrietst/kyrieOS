import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ClientHealthItem {
    id: string
    organization_name: string
    health_score: number
    churn_risk_level: 'low' | 'medium' | 'high'
    last_interaction?: string
}

interface ClientHealthListProps {
    clients: ClientHealthItem[]
}

export function ClientHealthList({ clients }: ClientHealthListProps) {
  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/40 hover:bg-accent/10 transition-colors">
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${
                 client.health_score >= 80 ? 'bg-emerald-500' :
                 client.health_score >= 60 ? 'bg-yellow-500' : 'bg-rose-500'
             }`} />
             <div>
                <p className="font-medium text-sm">{client.organization_name}</p>
                <p className="text-xs text-muted-foreground">
                    Score: {client.health_score} | Risco: <span className="capitalize">{client.churn_risk_level === 'low' ? 'Baixo' : client.churn_risk_level === 'medium' ? 'Médio' : 'Alto'}</span>
                </p>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             {client.health_score >= 80 ? (
                 <TrendingUp className="w-4 h-4 text-emerald-500" />
             ) : client.health_score >= 60 ? (
                 <Minus className="w-4 h-4 text-yellow-500" />
             ) : (
                 <TrendingDown className="w-4 h-4 text-rose-500" />
             )}
          </div>
        </div>
      ))}

      {clients.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
              Nenhum dado de saúde disponível.
          </p>
      )}
    </div>
  )
}
