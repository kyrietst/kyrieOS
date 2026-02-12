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
import { AvatarStack } from './../ui/avatar-stack'
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from '@/components/ui/avatar'
import { TimerBadge } from './TimerBadge'
import { startTimer, stopTimer } from '@/actions/time-tracking'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { assignCard, archiveCard, updateCardDetails } from '@/actions/kanban'
import { createClient } from '@/utils/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import { triggerConfetti } from '@/utils/confetti'

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
    const [isHovered, setIsHovered] = useState(false)
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [editedTitle, setEditedTitle] = useState(card.title)
    const [isUpdatingTitle, setIsUpdatingTitle] = useState(false)

    // Master cards have 'card_id', Client cards have 'id'
    const validCardId = card.id || card.card_id

    // Strict check: activeTimer must exist AND match this card
    const isTimerActive = !!activeTimer && activeTimer.card_id === validCardId

    const handleQuickStart = async (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        if (isLoadingTimer) return

        try {
            setIsLoadingTimer(true)

            if (isTimerActive) {
                // STOP
                await stopTimer() // Imports need to be checked if stopTimer is imported
                if (onTimerUpdate) onTimerUpdate(null)
                toast.success("Cronômetro parado")
            } else {
                // START
                const newTimer = await startTimer(validCardId)
                if (onTimerUpdate) onTimerUpdate(newTimer)
                toast.success("Cronômetro iniciado")
            }
        } catch (err) {
            toast.error("Erro ao atualizar timer")
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

            // CELEBRATION
            if (!card.completed_at) { // If it was pending and now is complete
                triggerConfetti()
            }

            toast.success("Status do cartão atualizado")
        } catch (error) {
            toast.error("Erro ao atualizar status")
            console.error(error)
        } finally {
            setIsToggling(false)
        }
    }

    const handleSelfAssign = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const isCurrentlyAssigned = card.assigned_to === user.id
        const newAssignee = isCurrentlyAssigned ? null : user.id

        try {
            await assignCard(validCardId, newAssignee)
            toast.success(isCurrentlyAssigned ? "Desatribuído de você" : "Atribuído a você")
        } catch (err) {
            toast.error("Erro ao atualizar atribuição")
        }
    }

    const handleArchive = async () => {
        try {
            await archiveCard(validCardId)
            toast.success("Cartão arquivado", {
                action: {
                    label: "Desfazer",
                    onClick: () => {
                        // In Trello, archive is just is_archived = true. Undo would be setting it to false.
                        // We'd need an unarchiveCard action, but for now we follow the "Desfazer" pattern if requested.
                        toast.info("Unarchive não implementado no backend ainda.")
                    }
                }
            })
        } catch (err) {
            toast.error("Erro ao arquivar cartão")
        }
    }

    const handleUpdateTitle = async () => {
        if (!editedTitle.trim() || editedTitle === card.title) {
            setIsEditingTitle(false)
            setEditedTitle(card.title)
            return
        }

        try {
            setIsUpdatingTitle(true)
            await updateCardDetails(validCardId, { title: editedTitle.trim() })
            toast.success("Título atualizado")
            setIsEditingTitle(false)
        } catch (err) {
            toast.error("Erro ao atualizar título")
        } finally {
            setIsUpdatingTitle(false)
        }
    }

    useKeyboardShortcuts(isHovered, {
        onAssignSelf: handleSelfAssign,
        onArchive: handleArchive,
        onEscape: () => setIsEditingTitle(false)
    }, !isEditingTitle)

    const isCompletedColumn = card.kanban_columns?.is_done_column // This checks if the underlying column is done type

    return (
        <>
            <KanbanCardMenu card={card} onOpen={() => setShowDetails(true)}>
                <Card
                    className={cn(
                        "group cursor-pointer relative transition-all duration-200 hover:ring-2 hover:ring-primary/50 hover:shadow-md",
                        isToggling && "opacity-50 pointer-events-none",
                        isTimerActive && "ring-2 ring-red-500/50 shadow-red-100 dark:shadow-red-900/20"
                    )}
                    onClick={(e) => {
                        if (isEditingTitle) return;
                        e.stopPropagation(); // Prevent drag or parent click
                        setShowDetails(true);
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Pencil icon for Quick Edit */}
                    {!hideActions && !isEditingTitle && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingTitle(true);
                            }}
                            className="absolute top-2 right-2 p-1 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent z-40 shadow-sm border"
                            title="Edição rápida"
                        >
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                        </button>
                    )}

                    {/* Color Cover */}
                    <div className={cn("w-full transition-all", card.cover_color ? "h-2" : "h-0", card.cover_color)} />

                    <CardContent className={cn("p-3 space-y-2", card.cover_color ? "pt-2" : "pt-3")}>
                        {/* Header: Title */}
                        <div className="flex items-start justify-between gap-2">
                            {isEditingTitle ? (
                                <div className="w-full" onClick={(e) => e.stopPropagation()}>
                                    <Textarea
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        onBlur={handleUpdateTitle}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleUpdateTitle();
                                            }
                                            if (e.key === 'Escape') {
                                                setIsEditingTitle(false);
                                                setEditedTitle(card.title);
                                            }
                                        }}
                                        className="min-h-[60px] p-1 text-sm font-medium leading-tight resize-none focus-visible:ring-1"
                                        autoFocus
                                        disabled={isUpdatingTitle}
                                    />
                                </div>
                            ) : (
                                <div className="font-medium text-sm leading-tight break-words flex-1 pr-6">
                                    {card.title}
                                </div>
                            )}
                            {/* Timer Status */}
                            {isTimerActive && activeTimer && (
                                <TimerBadge startTime={activeTimer.start_time} />
                            )}
                        </div>

                        {/* Metadata Row */}
                        <div className="flex items-center justify-between mt-2">

                            {/* Left: ICE / Labels */}
                            <div className="flex gap-1 flex-wrap items-center">
                                {/* Assignee Avatar */}
                                <AvatarStack size={20}>
                                    {card.assigned_to_user && (
                                        <Avatar>
                                            <AvatarImage src={card.assigned_to_user.avatar_url || undefined} />
                                            <AvatarFallback>
                                                {(card.assigned_to_user.full_name || 'U').substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </AvatarStack>

                                {card.ice_score && (
                                    <div className="text-[10px] font-mono text-muted-foreground bg-muted px-1 rounded flex items-center">
                                        ICE {Number(card.ice_score).toFixed(1)}
                                    </div>
                                )}

                                {/* Unified Label Rendering for Master (JSONB) and Client (Joined) */}
                                {(() => {
                                    // 1. Master View Labels (Array of {name, color})
                                    if (Array.isArray(card.labels) && card.labels.length > 0 && typeof card.labels[0] === 'object') {
                                        return card.labels.map((l: any, i: number) => (
                                            <span
                                                key={i}
                                                className={cn(
                                                    "text-[10px] px-1.5 py-0.5 rounded text-white font-medium",
                                                    l.color || 'bg-gray-500' // Ensure fallback
                                                )}
                                            >
                                                {l.name}
                                            </span>
                                        ));
                                    }

                                    // 2. Client View Labels (kanban_card_labels relation)
                                    if (card.kanban_card_labels?.length) {
                                        return card.kanban_card_labels.map((cl: any) => (
                                            <span
                                                key={cl.kanban_labels.id}
                                                className={cn(
                                                    "text-[10px] px-1.5 py-0.5 rounded text-white font-medium",
                                                    cl.kanban_labels.color
                                                )}
                                            >
                                                {cl.kanban_labels.name}
                                            </span>
                                        ));
                                    }

                                    // 3. Deprecated Fallback (String array)
                                    if (Array.isArray(card.labels) && typeof card.labels[0] === 'string') {
                                        return card.labels.map((l: string) => (
                                            <span key={l} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-md">
                                                {l}
                                            </span>
                                        ));
                                    }
                                    return null;
                                })()}

                                {/* Organization Badge (Master View) */}
                                {isMasterView && card.organization_name && (
                                    <span
                                        className={cn(
                                            "text-[10px] px-1.5 py-0.5 rounded-md text-white font-bold tracking-wider",
                                            // Simple hased color generator based on name if no color provided
                                            card.organization_color ||
                                            (() => {
                                                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-rose-500'];
                                                let hash = 0;
                                                for (let i = 0; i < card.organization_name.length; i++) {
                                                    hash = card.organization_name.charCodeAt(i) + ((hash << 5) - hash);
                                                }
                                                return colors[Math.abs(hash % colors.length)];
                                            })()
                                        )}
                                        title={card.organization_name}
                                    >
                                        {card.organization_name.substring(0, 3).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Play/Stop Button */}
                            {!hideActions && !isCompletedColumn && (
                                <button
                                    onClick={handleQuickStart}
                                    disabled={isLoadingTimer}
                                    className={cn(
                                        "text-muted-foreground hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 z-30 pointer-events-auto mr-1",
                                        isTimerActive ? "opacity-100 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40" : "opacity-0 group-hover:opacity-100"
                                    )}
                                    title={isTimerActive ? "Parar cronômetro" : "Iniciar cronômetro"}
                                >
                                    {isLoadingTimer ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : isTimerActive ? (
                                        <div className="flex items-center justify-center w-4 h-4">
                                            <div className="bg-current rounded-sm w-2.5 h-2.5" />
                                        </div>
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
                    card={{ ...card, id: validCardId }} // Ensure ID is present for Details component
                    activeTimer={activeTimer}
                    onTimerUpdate={onTimerUpdate}
                />
            )}
        </>
    )
}
