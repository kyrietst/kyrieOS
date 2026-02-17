'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
    CheckSquare,
    Plus,
    Trash2,
    X,
    Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CardActionButton } from './CardActionButton'
import { toast } from 'sonner'
import type { KanbanChecklist, KanbanChecklistItem } from '@/types/kanban'
import {
    addChecklist,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    deleteChecklist
} from '@/actions/kanban'

interface ChecklistSectionProps {
    cardId: string
    organizationId: string
    checklists: KanbanChecklist[]
    onUpdate: () => void
}

export function ChecklistSection({ cardId, organizationId, checklists, onUpdate }: ChecklistSectionProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [newTitle, setNewTitle] = useState('Checklist')

    const handleCreateChecklist = async () => {
        if (!newTitle.trim()) return
        try {
            await addChecklist(cardId, organizationId, newTitle.trim())
            setNewTitle('Checklist')
            setIsCreating(false)
            onUpdate()
            toast.success('Checklist criada')
        } catch {
            toast.error('Erro ao criar checklist')
        }
    }

    return (
        <div className="space-y-4">
            {checklists.map(checklist => (
                <SingleChecklist
                    key={checklist.id}
                    checklist={checklist}
                    organizationId={organizationId}
                    onUpdate={onUpdate}
                />
            ))}

            {isCreating ? (
                <div className="flex gap-2 items-center">
                    <Input
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCreateChecklist()}
                        placeholder="Nome da checklist"
                        className="h-8 text-sm"
                        autoFocus
                    />
                    <Button size="sm" onClick={handleCreateChecklist} className="h-8 shrink-0">
                        Criar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)} className="h-8 w-8 p-0 shrink-0">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex justify-start">
                    <CardActionButton
                        icon={Plus}
                        label="Adicionar checklist"
                        onClick={() => setIsCreating(true)}
                    />
                </div>
            )}
        </div>
    )
}

function SingleChecklist({
    checklist,
    organizationId,
    onUpdate
}: {
    checklist: KanbanChecklist
    organizationId: string
    onUpdate: () => void
}) {
    const [newItemContent, setNewItemContent] = useState('')
    const [isAddingItem, setIsAddingItem] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Optimistic items state
    const items = checklist.items || []
    const [optimisticItems, setOptimisticItems] = useOptimistic(
        items,
        (state: KanbanChecklistItem[], update: { id: string; is_completed: boolean }) =>
            state.map(item =>
                item.id === update.id ? { ...item, is_completed: update.is_completed } : item
            )
    )
    const [, startTransition] = useTransition()

    const completedCount = optimisticItems.filter(i => i.is_completed).length
    const totalCount = optimisticItems.length
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    const handleToggle = (item: KanbanChecklistItem) => {
        const newState = !item.is_completed
        startTransition(async () => {
            setOptimisticItems({ id: item.id, is_completed: newState })
            try {
                await toggleChecklistItem(item.id, newState)
                onUpdate()
            } catch {
                toast.error('Erro ao atualizar item')
                onUpdate() // Revert by refetching
            }
        })
    }

    const handleAddItem = async () => {
        if (!newItemContent.trim()) return
        try {
            await addChecklistItem(checklist.id, organizationId, newItemContent.trim())
            setNewItemContent('')
            onUpdate()
        } catch {
            toast.error('Erro ao adicionar item')
        }
    }

    const handleDeleteItem = async (itemId: string) => {
        try {
            await deleteChecklistItem(itemId)
            onUpdate()
        } catch {
            toast.error('Erro ao excluir item')
        }
    }

    const handleDeleteChecklist = async () => {
        try {
            setIsDeleting(true)
            await deleteChecklist(checklist.id)
            onUpdate()
            toast.success('Checklist excluída')
        } catch {
            toast.error('Erro ao excluir checklist')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold">{checklist.title}</h4>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteChecklist}
                    disabled={isDeleting}
                    className="h-7 text-xs text-muted-foreground hover:text-red-600"
                >
                    {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Excluir'}
                </Button>
            </div>

            {/* Progress */}
            {totalCount > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-8">{progress}%</span>
                    <Progress value={progress} className="h-1.5 flex-1" />
                </div>
            )}

            {/* Items */}
            <div className="space-y-0.5">
                {optimisticItems.map(item => (
                    <div
                        key={item.id}
                        className="flex items-start gap-2 group py-1 px-1 -mx-1 rounded hover:bg-muted/50 transition-colors"
                    >
                        <button
                            onClick={() => handleToggle(item)}
                            className={cn(
                                "mt-0.5 h-4 w-4 rounded-sm border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer",
                                item.is_completed
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-muted-foreground/40 hover:border-primary"
                            )}
                        >
                            {item.is_completed && (
                                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                                    <path d="M2.5 6L5 8.5L9.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </button>
                        <span className={cn(
                            "text-sm flex-1 leading-snug",
                            item.is_completed && "line-through text-muted-foreground"
                        )}>
                            {item.content}
                        </span>
                        <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity p-0.5"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Item */}
            {isAddingItem ? (
                <div className="flex gap-2 items-center pt-1">
                    <Input
                        value={newItemContent}
                        onChange={e => setNewItemContent(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleAddItem()
                            if (e.key === 'Escape') setIsAddingItem(false)
                        }}
                        placeholder="Adicionar item..."
                        className="h-7 text-sm"
                        autoFocus
                    />
                    <Button size="sm" onClick={handleAddItem} className="h-7 text-xs shrink-0">
                        Adicionar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsAddingItem(false)} className="h-7 w-7 p-0 shrink-0">
                        <X className="w-3.5 h-3.5" />
                    </Button>
                </div>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground h-7"
                    onClick={() => setIsAddingItem(true)}
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar item
                </Button>
            )}
        </div>
    )
}
