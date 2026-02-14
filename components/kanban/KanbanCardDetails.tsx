'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { useState, useRef, useEffect } from 'react'
import { updateCardDetails, toggleCardCompletion } from '@/actions/kanban'
import { toast } from 'sonner'
import {
    Loader2,
    X,
    AlignLeft,
    Check,
    User,
    Tag,
    CheckSquare,
    Calendar,
    Paperclip,
    MoveRight,
    Archive,
    Bold,
    Italic,
    List,
    Link as LinkIcon,
    Image as ImageIcon,
    Layout,
    Eye,
    Plus as PlusIcon,
    Copy,
    MoreHorizontal,
    MessageSquare,
    ChevronDown,
    Megaphone,
    Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { startTimer, stopTimer, getCardTimeLogs } from '@/actions/time-tracking'
import { TimeEntry } from '@/types/kanban'
import CardCoverSelector from './CardCoverSelector'
import { TimerBadge } from './TimerBadge'
import { LabelPicker } from './LabelPicker'
import { AvatarStack } from '@/components/ui/avatar-stack'
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from '@/components/ui/avatar'
import { Clock, Play, Square, History } from 'lucide-react'

interface KanbanCardDetailsProps {
    isOpen: boolean
    onClose: () => void
    card: any
    activeTimer?: TimeEntry | null
    onTimerUpdate?: (t: TimeEntry | null) => void
    // Assuming these will be passed or fetched
    attachments?: any[]
    fetchCard?: () => void
}

export function KanbanCardDetails({ isOpen, onClose, card, activeTimer, onTimerUpdate, attachments = [], fetchCard }: KanbanCardDetailsProps) {
    const [title, setTitle] = useState(card.title)
    const [description, setDescription] = useState(card.description || '')
    const [isSaving, setIsSaving] = useState(false)
    const [isEditingDesc, setIsEditingDesc] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Timer States
    const [isTimerLoading, setIsTimerLoading] = useState(false)
    const [timeLogs, setTimeLogs] = useState<TimeEntry[]>([])
    const isTimerActive = activeTimer?.card_id === card.id

    // Label State
    const [labelIds, setLabelIds] = useState<string[]>(
        card.kanban_card_labels?.map((cl: any) => cl.kanban_labels.id) || []
    )

    // ICE Score State
    const [impact, setImpact] = useState(card.impact || 5)
    const [confidence, setConfidence] = useState(card.confidence || 5)
    const [effort, setEffort] = useState(card.effort || 5)

    // Completion State (Optimistic)
    const [isCompleted, setIsCompleted] = useState(card.kanban_columns?.is_done_column || false)

    const handleToggleComplete = async () => {
        const newState = !isCompleted
        setIsCompleted(newState)
        try {
            await toggleCardCompletion(card.id, card.column_id, card.organization_id)
            toast.success(newState ? "Tarefa concluída" : "Tarefa reaberta")
        } catch (error) {
            setIsCompleted(!newState)
            toast.error("Erro ao atualizar status")
        }
    }

    const coverData = {
        type: card.cover_type as 'color' | 'image' | null,
        value: card.cover_value || null,
        mode: (card.cover_mode as 'header' | 'full') || 'header',
        size: (card.cover_size as 'small' | 'large') || 'small',
        textTheme: (card.cover_text_theme as 'light' | 'dark') || 'dark'
    }

    // Fetch Logs & Data on Open
    useEffect(() => {
        if (isOpen) {
            if (typeof fetchCard === 'function') {
                fetchCard()
            }
            getCardTimeLogs(card.id).then(setTimeLogs).catch(console.error)
        }
    }, [isOpen, card.id, fetchCard])

    const handleStartTimer = async () => {
        try {
            setIsTimerLoading(true)
            const newTimer = await startTimer(card.id)
            if (onTimerUpdate) onTimerUpdate(newTimer)
            // Logs will be refreshed on revalidation or manual add if needed
        } catch (error) {
            toast.error('Erro ao iniciar')
        } finally {
            setIsTimerLoading(false)
        }
    }

    const handleStopTimer = async () => {
        try {
            setIsTimerLoading(true)
            await stopTimer()
            if (onTimerUpdate) onTimerUpdate(null)

            // Refresh logs
            const logs = await getCardTimeLogs(card.id)
            setTimeLogs(logs)
        } catch (error) {
            toast.error('Erro ao parar')
        } finally {
            setIsTimerLoading(false)
        }
    }

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [description, isOpen, isEditingDesc])

    const handleSave = async () => {
        if (title.trim() === '') return

        setIsSaving(true)
        try {
            await updateCardDetails(card.id, {
                title,
                description: description === '' ? null : description,
                impact,
                confidence,
                effort
            })
            toast.success('Alterações salvas')
            setIsEditingDesc(false)
        } catch (error) {
            toast.error('Erro ao salvar alterações')
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    // Handle Ctrl+Enter to save
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'Enter') {
            handleSave()
        }
        // Blur on Escape if editing desc
        if (e.key === 'Escape' && isEditingDesc) {
            setIsEditingDesc(false)
            e.stopPropagation()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent hideCloseButton className="max-w-7xl h-[95vh] md:h-auto md:max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden bg-[#F4F5F7] dark:bg-zinc-900 border-none shadow-2xl [&>button]:hidden">
                {/* Header Area */}
                <div className="relative w-full shrink-0 group">
                    {/* Cover Image/Color */}
                    {coverData.type && (
                        <div
                            className={cn(
                                "w-full h-32 sm:h-40 shrink-0 relative flex items-end transition-all duration-300",
                                coverData.type === 'color' ? "" : "bg-muted"
                            )}
                            style={{
                                backgroundColor: coverData.type === 'color' ? coverData.value! : undefined,
                                backgroundImage: coverData.type === 'image' ? `url(${coverData.value})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-80" />
                        </div>
                    )}

                    <DialogHeader className="sr-only">
                        <DialogTitle>{card.title}</DialogTitle>
                    </DialogHeader>

                    {/* Controls Overlay */}
                    <div className={cn(
                        "flex justify-between items-start p-3 md:p-4 z-20 transition-all duration-200",
                        coverData.type
                            ? "absolute top-0 left-0 right-0"
                            : "relative border-b border-border/40 bg-background/50 backdrop-blur-sm"
                    )}>
                        {/* LEFT: Column Navigation */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-8 gap-2 font-semibold transition-colors border",
                                        coverData.type
                                            ? "text-white hover:text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm border-transparent"
                                            : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 border-transparent"
                                    )}
                                >
                                    <Layout className="w-4 h-4" />
                                    <span>{card.kanban_columns?.name || 'Sem coluna'}</span>
                                    <ChevronDown className="w-3 h-3 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-60 p-0" align="start">
                                <div className="p-2 text-xs font-medium text-muted-foreground border-b bg-muted/50">
                                    Mover cartão
                                </div>
                                <div className="p-2 space-y-1">
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-normal h-8">
                                        <Layout className="w-3 h-3 mr-2" /> Para outro Quadro...
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-normal h-8">
                                        <List className="w-3 h-3 mr-2" /> Para outra Lista...
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* RIGHT: Window Controls */}
                        <div className="flex items-center gap-1">
                            {/* Follow */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-8 w-8 transition-colors",
                                    coverData.type
                                        ? "text-white hover:text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                )}
                            >
                                <Megaphone className="w-4 h-4" />
                            </Button>

                            {/* Timer Toggle (Header) */}
                            <div className="flex items-center mx-1">
                                {isTimerActive && activeTimer ? (
                                    <div className="flex items-center bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-md px-2 py-1 gap-2 border border-red-200 dark:border-red-900/50 shadow-sm">
                                        <TimerBadge startTime={activeTimer.start_time} variant="minimal" className="bg-transparent text-inherit p-0 font-medium" />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300"
                                            onClick={handleStopTimer}
                                            disabled={isTimerLoading}
                                        >
                                            {isTimerLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3 fill-current" />}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant={coverData.type ? "ghost" : "outline"}
                                        size="sm"
                                        className={cn(
                                            "h-8 gap-2 border-dashed transition-all",
                                            coverData.type
                                                ? "text-white hover:text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm border-transparent"
                                                : "text-muted-foreground hover:text-foreground hover:border-solid hover:border-red-500 hover:text-red-600 dark:hover:text-red-400"
                                        )}
                                        onClick={handleStartTimer}
                                        disabled={isTimerLoading}
                                    >
                                        {isTimerLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                        <span className="hidden sm:inline text-xs">Iniciar Timer</span>
                                    </Button>
                                )}
                            </div>

                            {/* Card Cover Picker */}
                            <CardCoverSelector
                                cardId={card.id}
                                currentCover={coverData}
                                attachments={attachments}
                                onUpdate={fetchCard}
                                variant="icon"
                                organizationId={card.organization_id}
                                className={cn(
                                    coverData.type
                                        ? "text-white hover:text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm"
                                        : ""
                                )}
                            />

                            {/* More Actions Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 transition-colors",
                                            coverData.type
                                                ? "text-white hover:text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm"
                                                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem><MoveRight className="w-4 h-4 mr-2" /> Mover</DropdownMenuItem>
                                    <DropdownMenuItem><Copy className="w-4 h-4 mr-2" /> Copiar</DropdownMenuItem>
                                    <DropdownMenuItem><Layout className="w-4 h-4 mr-2" /> Criar modelo</DropdownMenuItem>
                                    <Separator className="my-1" />
                                    <DropdownMenuItem className="text-red-600"><Archive className="w-4 h-4 mr-2" /> Arquivar</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Close Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className={cn(
                                    "h-8 w-8 ml-1 transition-colors",
                                    coverData.type
                                        ? "text-white hover:text-white hover:bg-white/20 bg-black/20 hover:bg-black/30 backdrop-blur-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10"
                                )}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col md:flex-row min-h-full">

                        {/* Main Column (Left - Fluid) */}
                        <div className="flex-1 p-6 md:p-8 space-y-6 bg-background">

                            {/* Header: Title Only */}
                            <div className="flex gap-4">
                                {/* Circle/Icon for Title often used in Trello, can simulate 'status' or just icon */}
                                <div className="mt-2 text-muted-foreground bg-transparent">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-6 w-6 rounded-full border-2 p-0 transition-all",
                                            isCompleted
                                                ? "bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600"
                                                : "border-muted-foreground/30 hover:bg-green-500/10 hover:border-green-500 hover:text-green-600 text-transparent"
                                        )}
                                        onClick={handleToggleComplete}
                                    >
                                        <Check className={cn("w-3 h-3 font-bold", isCompleted ? "opacity-100" : "opacity-0 hover:opacity-100")} />
                                    </Button>
                                </div>

                                <div className="flex-1 space-y-1">
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        onBlur={handleSave} // Save title on blur
                                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                                        className="text-xl md:text-2xl font-bold border-none shadow-none px-2 h-auto rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 !bg-transparent dark:!bg-transparent hover:bg-transparent transition-colors -ml-2 w-full text-foreground"
                                        placeholder="Título da tarefa"
                                    />
                                    {/* Removed 'na coluna' text as it is now in Header */}
                                </div>
                            </div>

                            <div className="pl-10 flex flex-wrap gap-2">
                                <ActionButton icon={User} label="Membros" />
                                <LabelPicker
                                    cardId={card.id}
                                    organizationId={card.organization_id}
                                    selectedLabelIds={labelIds}
                                    onLabelsChange={setLabelIds}
                                />
                                <ActionButton icon={CheckSquare} label="Checklist" />
                                <ActionButton icon={Calendar} label="Datas" />
                                <ActionButton icon={Paperclip} label="Anexo" />
                            </div>

                            {/* Metadata (Members/Labels) if visible */}
                            <div className="pl-10 flex flex-wrap gap-8">
                                {/* Members Stack */}
                                <div className="space-y-1.5">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Membros</h3>
                                    <div className="flex items-center gap-2">
                                        <AvatarStack size={32}>
                                            {card.assigned_to_user && (
                                                <Avatar>
                                                    <AvatarImage src={card.assigned_to_user.avatar_url || undefined} />
                                                    <AvatarFallback>
                                                        {(card.assigned_to_user.full_name || 'U').substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </AvatarStack>
                                        <button className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 transition-colors text-muted-foreground">
                                            <PlusIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Labels */}
                                {card.kanban_card_labels?.length > 0 && (
                                    <div className="space-y-1.5">
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Etiquetas</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {card.kanban_card_labels.map((cl: any) => (
                                                <Badge
                                                    key={cl.kanban_labels.id}
                                                    variant="secondary"
                                                    style={{ backgroundColor: cl.kanban_labels.color + '20', color: cl.kanban_labels.color }}
                                                    className="h-9 px-3 text-sm font-semibold border-none"
                                                >
                                                    {cl.kanban_labels.name}
                                                </Badge>
                                            ))}
                                            <button className="h-9 w-9 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 transition-colors text-muted-foreground">
                                                <PlusIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Time Tracking Section */}
                            <div className="pl-10 pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Rastreamento de Tempo</h3>
                                </div>

                                <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-lg border border-slate-200 dark:border-zinc-800 p-4">
                                    <div className="flex flex-col gap-4">
                                        {/* Logs Table */}
                                        {timeLogs.length > 0 ? (
                                            <div className="space-y-2">
                                                {timeLogs.map(log => (
                                                    <div key={log.id} className="flex items-center justify-between text-sm py-1 border-b border-border/40 last:border-0 hover:bg-muted/50 px-2 -mx-2 rounded-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                                                {log.profiles?.full_name?.[0] || 'U'}
                                                            </div>
                                                            <span className="text-muted-foreground text-xs">
                                                                {new Date(log.start_time).toLocaleDateString()} {new Date(log.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                {' - '}
                                                                {log.end_time ? new Date(log.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Agora'}
                                                            </span>
                                                        </div>
                                                        <div className="font-mono font-medium">
                                                            {log.duration ? (
                                                                `${Math.floor(log.duration / 3600)}h ${Math.floor((log.duration % 3600) / 60)}m`
                                                            ) : (
                                                                <span className="text-green-600 dark:text-green-400 animate-pulse">Rodando...</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between items-center pt-2 text-sm font-bold border-t">
                                                    <span>Total</span>
                                                    <span>
                                                        {(() => {
                                                            const total = timeLogs.reduce((acc, curr) => acc + (curr.duration || 0), 0)
                                                            const h = Math.floor(total / 3600)
                                                            const m = Math.floor((total % 3600) / 60)
                                                            return `${h}h ${m}m`
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-center py-4 text-muted-foreground">
                                                Sem registros de tempo para este cartão.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ICE Score Section */}
                            <div className="pl-10 pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="font-mono font-semibold text-sm">ICE Score</div>
                                    {(impact && confidence && effort) && (
                                        <div className="text-lg font-bold text-primary">
                                            {((impact * confidence) / effort).toFixed(2)}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-lg border border-slate-200 dark:border-zinc-800 p-4 space-y-4">
                                    {/* Impact */}
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                                            Impact (1-10): {impact}
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={impact}
                                            onChange={(e) => setImpact(Number(e.target.value))}
                                            onMouseUp={handleSave}
                                            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-red-200 to-green-400 dark:from-red-900 dark:to-green-600"
                                        />
                                    </div>

                                    {/* Confidence */}
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                                            Confidence (1-10): {confidence}
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={confidence}
                                            onChange={(e) => setConfidence(Number(e.target.value))}
                                            onMouseUp={handleSave}
                                            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-yellow-200 to-blue-400 dark:from-yellow-900 dark:to-blue-600"
                                        />
                                    </div>

                                    {/* Effort */}
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                                            Effort (1-10): {effort}
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={effort}
                                            onChange={(e) => setEffort(Number(e.target.value))}
                                            onMouseUp={handleSave}
                                            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-purple-200 to-orange-400 dark:from-purple-900 dark:to-orange-600"
                                        />
                                    </div>

                                    <p className="text-xs text-muted-foreground mt-3">
                                        ICE = (Impact × Confidence) / Effort — Quanto maior, melhor a prioridade
                                    </p>
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="flex gap-4 pt-2">
                                <AlignLeft className="w-6 h-6 mt-1 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-semibold text-foreground">Descrição</h3>
                                        {!isEditingDesc && card.description && (
                                            <Button variant="ghost" size="sm" onClick={() => setIsEditingDesc(true)}>Editar</Button>
                                        )}
                                    </div>

                                    {isEditingDesc ? (
                                        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                                            <textarea
                                                ref={textareaRef}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Adicione uma descrição mais detalhada..."
                                                className="w-full min-h-[120px] p-3 text-sm rounded-md border border-input bg-background shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                                autoFocus
                                            />

                                            {/* Rich Editor Toolbar Mock */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Salvar
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setIsEditingDesc(false)}>
                                                        Cancelar
                                                    </Button>
                                                </div>

                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <ToolbarButton icon={Bold} />
                                                    <ToolbarButton icon={Italic} />
                                                    <ToolbarButton icon={List} />
                                                    <ToolbarButton icon={LinkIcon} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setIsEditingDesc(true)}
                                            className={cn(
                                                "min-h-[80px] p-3 rounded-md cursor-pointer transition-colors duration-200 text-sm leading-relaxed whitespace-pre-wrap",
                                                description
                                                    ? "hover:bg-black/5 dark:hover:bg-white/5"
                                                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground font-medium py-3 px-4"
                                            )}
                                        >
                                            {description || "Adicione uma descrição mais detalhada..."}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Activity & Comments (Fixed width on desktop, full on mobile) */}
                        <div className="w-full md:w-[350px] lg:w-[400px] border-t md:border-t-0 md:border-l border-border/50 bg-muted/30 p-6 md:p-8 space-y-6">

                            {/* Activity Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <List className="w-5 h-5 text-muted-foreground" />
                                    <h3 className="font-semibold text-foreground">Atividade</h3>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8">Mostrar detalhes</Button>
                            </div>

                            {/* New Comment Input */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground shadow-sm">EU</div>
                                <div className="flex-1">
                                    <div className="bg-white dark:bg-zinc-800 border rounded-md shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                        <textarea
                                            placeholder="Escrever um comentário..."
                                            className="w-full p-2.5 text-sm resize-none border-none focus:ring-0 bg-transparent min-h-[40px] appearance-none"
                                            rows={1}
                                        />
                                        <div className="px-2 pb-2 flex justify-end">
                                            {/* Hidden formatting tools or 'Save' button that appears on focus could go here */}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline / Feed */}
                            <div className="space-y-4 pt-2">
                                {/* Mock Item */}
                                <div className="flex gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">LF</div>
                                    <div className="text-sm">
                                        <span className="font-semibold">Lukke Ferreira</span> adicionou este cartão a <span className="underline decoration-dotted cursor-pointer hover:text-primary">Em Execução</span>
                                        <div className="text-xs text-muted-foreground mt-0.5">Há 12 minutos</div>
                                    </div>
                                </div>
                                <div className="flex gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground">EU</div>
                                    <div className="text-sm">
                                        <span className="font-semibold">Você</span> mudou o título do cartão
                                        <div className="text-xs text-muted-foreground mt-0.5">Há 2 minutos</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}

function ActionButton({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <Button variant="secondary" size="sm" className="h-8 px-3 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm">
            <Icon className="w-3.5 h-3.5 mr-1.5" />
            {label}
        </Button>
    )
}

function ToolbarButton({ icon: Icon }: { icon: any }) {
    return (
        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Icon className="w-4 h-4" />
        </Button>
    )
}
