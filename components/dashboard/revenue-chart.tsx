"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, TooltipProps } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RevenueChartProps {
  data: {
    name: string
    revenue: number
    roi: number
  }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Mês
            </span>
            <span className="font-bold text-muted-foreground">
              {label}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Faturamento
            </span>
            <span className="font-bold text-emerald-500">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(payload[0].value || 0)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              ROI
            </span>
            <span className="font-bold">
              {payload[1]?.value?.toFixed(1)}x
            </span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Faturamento vs ROI</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="revenue"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
            {/* ROI is in the data but maybe chart scaling is weird if I plot 4x vs 15000. 
                For now I only plot Revenue bars, but tooltip shows ROI.
                Alternatively, dual axis. Keeping it simple (Revenue Bars).
            */}
             <Bar
              dataKey="roi"
              hide={true} // Hidden from chart visual but available for tooltip
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
