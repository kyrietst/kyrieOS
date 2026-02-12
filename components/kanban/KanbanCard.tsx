'use client'

import { Pencil, CheckCircle2, Circle, Loader2, Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toggleCardCompletion } from '@/actions/kanban'
import { toast } from 'sonner'
import { useState } from 'react'

import { KanbanCardMenu } from './KanbanCardMenu'
import { KanbanCardDetails } from './KanbanCardDetails'
import { TimeEntry } from '@/types/kanban'
import { TimerBadge } from './TimerBadge'
import { startTimer } from '@/actions/time-tracking'

// Define interfaces locally if not available globally, or rely on usage
interface KanbanCardProps {
    card: any // Typing broadly to accept Master and Client cards
    onClick: () => void // This onClick is used for LEFT CLICK on the card itself, likely for drag or simple selection? Or maybe it WAS intended to open details?
    isMasterView: boolean
    hideActions?: boolean
    activeTimer?: TimeEntry | null
    onTimerUpdate?: (t: TimeEntry | null) => void
}

export default function KanbanCard({ card, onClick, isMasterView, hideActions = false, activeTimer, onTimerUpdate }: KanbanCardProps) {
    const [isToggling, setIsToggling] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [isLoadingTimer, setIsLoadingTimer] = useState(false)

    const isTimerActive = activeTimer?.card_id === card.id

    const handleQuickStart = async (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        if (isLoadingTimer) return

        try {
            setIsLoadingTimer(true)
            const newTimer = await startTimer(card.id)
            if (onTimerUpdate) onTimerUpdate(newTimer)
            toast.success("Cronômetro iniciado")
        } catch (err) {
            toast.error("Erro ao iniciar timer")
        } finally {
            setIsLoadingTimer(false)
        }
    }

    const handleToggleComplete = async (e: React.MouseEvent) => {
        // CRITICAL: Stop propagation to prevent drag or parent click
        e.preventDefault()
        e.stopPropagation()

        // In Master View, we need the real organization ID, which should be on the card object
        const orgId = card.organization_id || card.organizations?.id

        if (!orgId) {
            toast.error("Erro: Organização não identificada para este cartão.")
            return
        }

        try {
            setIsToggling(true)
            await toggleCardCompletion(card.id, card.column_id, orgId)
            toast.success("Status do cartão atualizado")
        } catch (error) {
            toast.error("Erro ao atualizar status")
            console.error(error)
        } finally {
            setIsToggling(false)
        }
    }

    const isCompletedColumn = card.kanban_columns?.is_done_column // This checks if the underlying column is done type

    return (
        <>
            <KanbanCardMenu card={card} onOpen={() => setShowDetails(true)}>
                <Card
                    className={cn(
                        "group cursor-pointer relative transition-all duration-200 hover:ring-2 hover:ring-primary/50 hover:shadow-md",
                        isToggling && "opacity-50 pointer-events-none"
                    )}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent drag or parent click
                        setShowDetails(true);
                        // We are NOT calling props.onClick here anymore as requested
                    }}
                >
                    {/* Color Cover */}
                    <div className={cn("w-full transition-all", card.cover_color ? "h-2" : "h-0", card.cover_color)} />

                    <CardContent className={cn("p-3 space-y-2", card.cover_color ? "pt-2" : "pt-3")}>
                        {/* Header: Title */}
                        <div className="flex items-start justify-between gap-2">
                            <div className="font-medium text-sm leading-tight break-words flex-1">
                                {card.title}
                            </div>
                            {/* Timer Status */}
                            {isTimerActive && activeTimer && (
                                <TimerBadge startTime={activeTimer.start_time} />
                            )}
                        </div>

                        {/* Metadata Row */}
                        <div className="flex items-center justify-between mt-2">

                            {/* Left: ICE / Labels */}
                            <div className="flex gap-1 flex-wrap items-center">
                                {card.ice_score && (
                                    <div className="text-[10px] font-mono text-muted-foreground bg-muted px-1 rounded flex items-center">
                                        ICE {Number(card.ice_score).toFixed(1)}
                                    </div>
                                )}

                                {/* Normalized Labels (PRIORITY) */}
                                {card.kanban_card_labels?.map((cl: any) => (
                                    <span
                                        key={cl.kanban_labels.id}
                                        className={cn(
                                            "text-[10px] px-1.5 py-0.5 rounded text-white font-medium",
                                            cl.kanban_labels.color
                                        )}
                                    >
                                        {cl.kanban_labels.name}
                                    </span>
                                ))}

                                {/* Fallback: Deprecated labels (if no normalized) */}
                                {!card.kanban_card_labels?.length && card.labels?.map((l: string) => (
                                    <span key={l} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-md">
                                        {l}
                                    </span>
                                ))}

                                {/* Organization Badge (Master View) */}
                                {isMasterView && card.organization_name && (
                                    <span
                                        className={cn(
                                            "text-[10px] px-1.5 py-0.5 rounded-md text-white font-bold tracking-wider",
                                            card.organization_color || 'bg-gray-500'
                                        )}
                                        title={card.organization_name}
                                    >
                                        {card.organization_name.substring(0, 3).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Play Button (Hover Only) */}
                            {!hideActions && !isTimerActive && !isCompletedColumn && (
                                <button
                                    onClick={handleQuickStart}
                                    disabled={isLoadingTimer}
                                    className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 z-30 pointer-events-auto mr-1"
                                    title="Iniciar cronômetro rápido"
                                >
                                    {isLoadingTimer ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Play className="h-4 w-4 fill-current" />
                                    )}
                                </button>
                            )}

                            {/* Right: Actions (Complete) */}
                            {!hideActions && (
                                <button
                                    onClick={handleToggleComplete}
                                    disabled={isToggling}
                                    type="button"
                                    className={cn(
                                        "text-muted-foreground hover:text-green-600 transition-colors opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-green-100 z-30 pointer-events-auto",
                                        isToggling && "opacity-100 animate-pulse"
                                    )}
                                    title={isCompletedColumn ? "Reabrir tarefa" : "Concluir tarefa"}
                                >
                                    {isToggling ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : isCompletedColumn ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Circle className="h-4 w-4" />
                                    )}
                                </button>
                            )}

                        </div>
                    </CardContent>
                </Card>
            </KanbanCardMenu>

            {showDetails && (
                <KanbanCardDetails
                    isOpen={showDetails}
                    onClose={() => setShowDetails(false)}
                    card={card}
                    activeTimer={activeTimer}
                    onTimerUpdate={onTimerUpdate}
                />
            )}
        </>
    )
}
