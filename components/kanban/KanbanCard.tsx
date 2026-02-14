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
import { motion, AnimatePresence } from 'framer-motion'
import { KanbanColumn } from '@/types/kanban'

interface KanbanCardProps {
    card: any // Typing broadly to accept Master and Client cards
    onClick: () => void
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

    const isCompletedColumn = card.kanban_columns?.is_done_column || card.is_done_column

    // Cover Data
    const coverType = card.cover_type as 'color' | 'image' | null
    const coverValue = card.cover_value || null
    const coverMode = (card.cover_mode as 'header' | 'full') || 'header'
    const textTheme = (card.cover_text_theme as 'light' | 'dark') || 'dark'

    const isFullCover = coverType && (card.cover_size === 'large' || coverMode === 'full')
    const isHeaderCover = coverType && (card.cover_size === 'small' || coverMode === 'header') && !isFullCover

    return (
        <>
            <KanbanCardMenu card={card} onOpen={() => setShowDetails(true)}>
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                >
                    <Card
                        className={cn(
                            "group cursor-pointer relative transition-all duration-200 !border-0 ring-1 ring-transparent hover:ring-white/60 shadow-none overflow-hidden !p-0 !gap-0",
                            isFullCover ? "bg-transparent" : "bg-card",
                            isToggling && "opacity-50 pointer-events-none",
                            isTimerActive && "ring-2 ring-red-500/50 shadow-red-100 dark:shadow-red-900/20",
                            card.justDropped && "animate-success-flash"
                        )}
                        style={isFullCover ? {
                            backgroundColor: coverType === 'color' ? coverValue! : undefined,
                            backgroundImage: coverType === 'image' ? `url(${coverValue})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        } : {}}
                        onClick={(e) => {
                            if (isEditingTitle) return;
                            setShowDetails(true);
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {/* Scrim for Full Cover */}
                        {isFullCover && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                        )}

                        {/* Pencil icon for Quick Edit */}
                        {!hideActions && !isEditingTitle && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditingTitle(true);
                                }}
                                className={cn(
                                    "absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all z-40 shadow-sm border",
                                    isFullCover ? "bg-black/20 text-white border-white/20 hover:bg-black/40" : "bg-background/90 text-muted-foreground hover:bg-accent border-border/60"
                                )}
                                title="Edição rápida"
                            >
                                <Pencil className="h-3 w-3" />
                            </button>
                        )}

                        {/* Top Cover (Header Mode) */}
                        {isHeaderCover && (
                            <div
                                className="w-full h-24 shrink-0 transition-all bg-muted"
                                style={{
                                    backgroundColor: coverType === 'color' ? coverValue! : undefined,
                                    backgroundImage: coverType === 'image' ? `url(${coverValue})` : undefined,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            />
                        )}

                        {/* Deprecated legacy cover color strip (if no new cover is active) */}
                        {!coverType && card.cover_color && (
                            <div className={cn("w-full transition-all h-2.5", card.cover_color)} />
                        )}

                        <CardContent className={cn(
                            "px-2.5 py-1.5 relative z-10 w-full flex flex-col gap-1",
                            isHeaderCover ? "pt-1" : "pt-2",
                            isFullCover && "min-h-[150px] justify-end !pb-1.5"
                        )}>
                            {/* Header: Title */}
                            <div className="flex items-start justify-between gap-1.5">
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
                                            className="min-h-[50px] p-2 text-[15px] font-medium leading-tight resize-none focus-visible:ring-1"
                                            autoFocus
                                            disabled={isUpdatingTitle}
                                        />
                                    </div>
                                ) : (
                                    <div className={cn(
                                        "font-medium text-[15px] leading-snug break-words flex-1 pr-4 flex items-center gap-1.5",
                                        isFullCover
                                            ? (textTheme === 'light' ? "text-white" : "text-zinc-900")
                                            : "text-foreground"
                                    )}>
                                        {/* Trello-Style Checkbox (Visible on hover or when completed) */}
                                        {(isHovered || card.completed_at) && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={cn(
                                                    "shrink-0 transition-all hover:scale-110 active:scale-95",
                                                    card.completed_at ? "text-emerald-500" : (isFullCover ? (textTheme === 'light' ? "text-white/80 hover:text-white" : "text-zinc-900/80 hover:text-zinc-900") : "text-muted-foreground/40 hover:text-primary")
                                                )}
                                                onClick={handleToggleComplete}
                                                disabled={isToggling}
                                            >
                                                {isToggling ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : card.completed_at ? (
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                ) : (
                                                    <Circle className="h-3.5 w-3.5 stroke-[2.5px]" />
                                                )}
                                            </motion.button>
                                        )}
                                        <span className={cn(isFullCover && "font-semibold")}>{card.title}</span>
                                    </div>
                                )}
                                {/* Timer Status */}
                                {isTimerActive && activeTimer && (
                                    <TimerBadge startTime={activeTimer.start_time} />
                                )}
                            </div>

                            {/* Metadata Row (Conditional to avoid gap-1 when empty) */}
                            {(() => {
                                const labels = Array.isArray(card.labels) && card.labels.length > 0 && typeof card.labels[0] === 'object'
                                    ? card.labels
                                    : (card.kanban_card_labels?.map((cl: any) => cl.kanban_labels) || []);

                                const hasLabels = labels.length > 0;
                                const hasAssignee = !!card.assigned_to_user;
                                const hasTimer = isTimerActive && activeTimer;

                                if (!hasLabels && !hasAssignee && !hasTimer) return null;

                                return (
                                    <div className="flex items-center justify-between pb-0.5">
                                        <div className="flex gap-1 flex-wrap items-center">
                                            {/* Assignee Avatar */}
                                            {hasAssignee && (
                                                <AvatarStack size={18}>
                                                    <Avatar className="border-1.5 border-background">
                                                        <AvatarImage src={card.assigned_to_user.avatar_url || undefined} />
                                                        <AvatarFallback className="text-[6px]">
                                                            {(card.assigned_to_user.full_name || 'U').substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </AvatarStack>
                                            )}

                                            {/* Labels */}
                                            {labels.map((l: any, i: number) => (
                                                <span
                                                    key={i}
                                                    className={cn(
                                                        "text-[8px] px-1.5 py-0 rounded-full text-white font-bold shadow-sm",
                                                        isFullCover ? "bg-white/20 backdrop-blur-sm" : (l.color || 'bg-gray-500')
                                                    )}
                                                >
                                                    {l.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </motion.div>
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
