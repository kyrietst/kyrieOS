'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, addDays, isSameDay, getISOWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Briefcase
} from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
// ScrollArea removed as it is not in components/ui
import { cn } from '@/lib/utils'
import { getCapacityCalendarData } from '@/actions/master-calendar'
import KanbanCardModal from '@/components/kanban/KanbanCardModal'

export default function StrategicCalendarPage() {
    usePageTitle('Master Strategic Calendar')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [data, setData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCard, setSelectedCard] = useState<any>(null)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setIsLoading(true)
        try {
            const result = await getCapacityCalendarData()
            setData(result)
        } finally {
            setIsLoading(false)
        }
    }

    // --- Calculations ---

    const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const currentWeekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })

    const weeklyLoad = useMemo(() => {
        return data
            .filter(item => {
                if (!item.due_date) return false
                const date = new Date(item.due_date)
                return date >= currentWeekStart && date <= currentWeekEnd
            })
            .reduce((acc, curr) => acc + (curr.remaining_load_minutes || 0), 0)
    }, [data, currentWeekStart, currentWeekEnd])

    const weeklyLoadHours = Math.round(weeklyLoad / 60)

    const healthStatus = useMemo(() => {
        if (weeklyLoadHours < 40) return { label: 'Saudável', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle2 }
        if (weeklyLoadHours <= 50) return { label: 'Carga Alta', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Clock }
        return { label: 'Sobrecarga', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle }
    }, [weeklyLoadHours])

    // --- Render Helpers ---

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    })

    return (
        <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto min-h-screen bg-background font-sans">

            {/* Header: Weekly Health */}
            <Card className="border-border/60 bg-card/50 backdrop-blur-md shadow-xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-pink-500 via-fuchsia-500 to-cyan-500" />
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center gap-2 font-mono">
                                <Briefcase className="h-6 w-6 text-pink-500" />
                                Strategic Capacity Center
                            </CardTitle>
                            <CardDescription className="text-muted-foreground mt-1">
                                Monitoramento de carga líquida (burn-down) da agência.
                            </CardDescription>
                        </div>
                        <div className={cn("px-4 py-2 rounded-xl border flex items-center gap-2", healthStatus.bg, healthStatus.border)}>
                            <healthStatus.icon className={cn("h-5 w-5", healthStatus.color)} />
                            <div>
                                <p className={cn("text-xs font-bold uppercase tracking-widest", healthStatus.color)}>{healthStatus.label}</p>
                                <p className="text-xl font-black font-mono">{weeklyLoadHours}h / 50h</p>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1 mt-4">
                            <span>Semana {getISOWeek(currentDate)}</span>
                            <span>{Math.min(100, Math.round((weeklyLoadHours / 50) * 100))}% da capacidade semal utilizada</span>
                        </div>
                        <Progress value={(weeklyLoadHours / 50) * 100} className="h-2.5 bg-muted/50" />
                    </div>
                </CardContent>
            </Card>

            {/* Calendar Navigation & Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Main Grid: month view */}
                <Card className="lg:col-span-3 border-border/60 shadow-lg bg-card/30">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold capitalize">
                                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                            </h2>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -30))}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 30))}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Hoje</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                <div key={day} className="bg-muted/30 p-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}

                            {/* Add empty cells for start of month */}
                            {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                                <div key={`empty-${i}`} className="bg-background/20 h-32" />
                            ))}

                            {daysInMonth.map(day => {
                                const dayCards = data.filter(item => item.due_date && isSameDay(new Date(item.due_date), day))
                                const totalMinutes = dayCards.reduce((acc, curr) => acc + (curr.remaining_load_minutes || 0), 0)
                                const intensity = totalMinutes > 480 ? 'bg-pink-500/20' : totalMinutes > 240 ? 'bg-pink-500/10' : totalMinutes > 0 ? 'bg-pink-500/5' : ''

                                return (
                                    <div key={day.toISOString()} className={cn("bg-background h-32 p-1 border-border/20 transition-all hover:bg-accent/5 cursor-default relative group", intensity)}>
                                        <span className={cn(
                                            "text-xs font-mono p-1 rounded-md",
                                            isSameDay(day, new Date()) ? "bg-pink-500 text-white font-bold" : "text-muted-foreground"
                                        )}>
                                            {format(day, 'd')}
                                        </span>

                                        <div className="h-[90px] mt-1 pr-1 overflow-y-auto custom-scrollbar">
                                            <div className="space-y-1">
                                                {dayCards.map(card => (
                                                    <div
                                                        key={card.card_id}
                                                        onClick={() => setSelectedCard(card)}
                                                        className="text-[10px] p-1.5 rounded border border-border/60 bg-card/80 shadow-sm cursor-pointer hover:border-pink-500/50 hover:shadow-md transition-all flex flex-col gap-0.5"
                                                    >
                                                        <span className="font-bold truncate leading-tight">{card.title}</span>
                                                        <div className="flex items-center justify-between text-[8px] font-mono opacity-70">
                                                            <span className="text-pink-600">{Math.round(card.remaining_load_minutes)}m rest.</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Side Panel: Quick Stats / Next week */}
                <div className="flex flex-col gap-6">
                    <Card className="border-border/60 shadow-lg bg-card/60">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <Clock className="h-4 w-4 text-pink-500" />
                                Próximas Prioridades
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.filter(c => !c.due_date && c.estimated_minutes > 0).slice(0, 3).map(card => (
                                    <div key={card.card_id} className="p-3 rounded-lg border bg-background/40 hover:border-pink-500/30 transition-all cursor-pointer group" onClick={() => setSelectedCard(card)}>
                                        <div className="flex justify-between items-start mb-1">
                                            <Badge variant="outline" className="text-[9px] font-bold border-pink-100 text-pink-600">ICE {card.ice_score || 'N/A'}</Badge>
                                            <span className="text-[10px] text-muted-foreground font-mono">{card.estimated_minutes}m est.</span>
                                        </div>
                                        <p className="text-xs font-semibold truncate group-hover:text-pink-600 transition-colors">{card.title}</p>
                                    </div>
                                ))}
                                <div className="pt-2 text-center">
                                    <p className="text-[10px] text-muted-foreground">Total de {data.filter(c => !c.due_date).length} tarefas sem agendamento.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal Reuso */}
            {selectedCard && (
                <KanbanCardModal
                    isOpen={!!selectedCard}
                    onClose={() => setSelectedCard(null)}
                    columnId={selectedCard.column_id}
                    organizationId={selectedCard.organization_id}
                    onCardCreated={fetchData}
                />
            )}
        </div>
    )
}
