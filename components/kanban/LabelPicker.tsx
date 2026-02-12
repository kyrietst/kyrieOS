'use client'

import { useState, useEffect } from 'react'
import { Check, Plus, X, Tag as TagIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { createLabel, getOrganizationLabels, setCardLabels } from '@/actions/labels'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface LabelPickerProps {
    cardId: string
    organizationId: string
    selectedLabelIds?: string[]
    onLabelsChange?: (labelIds: string[]) => void
}

const PRESET_COLORS = [
    { name: 'Vermelho', value: 'bg-red-500' },
    { name: 'Azul', value: 'bg-blue-500' },
    { name: 'Verde', value: 'bg-green-500' },
    { name: 'Amarelo', value: 'bg-yellow-500' },
    { name: 'Roxo', value: 'bg-purple-500' },
    { name: 'Laranja', value: 'bg-orange-500' },
    { name: 'Cinza', value: 'bg-gray-500' },
    { name: 'Rosa', value: 'bg-pink-500' },
]

export function LabelPicker({ cardId, organizationId, selectedLabelIds = [], onLabelsChange }: LabelPickerProps) {
    const [labels, setLabels] = useState<Array<{ id: string, name: string, color: string }>>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedLabelIds))
    const [isCreating, setIsCreating] = useState(false)
    const [newLabelName, setNewLabelName] = useState('')
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        loadLabels()
    }, [organizationId])

    const loadLabels = async () => {
        try {
            setIsLoading(true)
            const data = await getOrganizationLabels(organizationId)
            setLabels(data || [])
        } catch (error) {
            console.error('Error loading labels:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleLabel = (labelId: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(labelId)) {
            newSelected.delete(labelId)
        } else {
            newSelected.add(labelId)
        }
        setSelectedIds(newSelected)
    }

    const handleCreateLabel = async () => {
        if (!newLabelName.trim()) return

        try {
            const newLabel = await createLabel(organizationId, newLabelName.trim(), selectedColor)
            setLabels(prev => [...prev, newLabel])
            setNewLabelName('')
            setIsCreating(false)
            toast.success('Label criada!')

            // Auto-select the new label
            setSelectedIds(prev => new Set([...prev, newLabel.id]))
        } catch (error: any) {
            if (error.message?.includes('duplicate')) {
                toast.error('Já existe uma label com esse nome')
            } else {
                toast.error('Erro ao criar label')
            }
        }
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)
            await setCardLabels(cardId, Array.from(selectedIds))
            if (onLabelsChange) onLabelsChange(Array.from(selectedIds))
            toast.success('Labels atualizadas!')
        } catch (error) {
            toast.error('Erro ao salvar labels')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <TagIcon className="h-4 w-4" />
                    Labels ({selectedIds.size})
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="start">
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-semibold text-sm">Labels</h4>
                        {!isCreating && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => setIsCreating(true)}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Criar
                            </Button>
                        )}
                    </div>

                    {isCreating && (
                        <div className="space-y-2 border rounded-md p-2 bg-muted/30">
                            <Input
                                value={newLabelName}
                                onChange={(e) => setNewLabelName(e.target.value)}
                                placeholder="Nome da label..."
                                className="h-8 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateLabel()
                                    if (e.key === 'Escape') setIsCreating(false)
                                }}
                            />
                            <div className="grid grid-cols-4 gap-1">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color.value}
                                        onClick={() => setSelectedColor(color.value)}
                                        className={cn(
                                            'h-6 rounded border-2 transition-all',
                                            color.value,
                                            selectedColor === color.value ? 'border-white ring-2 ring-offset-1 ring-primary' : 'border-transparent'
                                        )}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-1">
                                <Button size="sm" onClick={handleCreateLabel} className="h-7 flex-1">
                                    Criar
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)} className="h-7">
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-1 max-h-[240px] overflow-y-auto">
                            {labels.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                    Nenhuma label ainda. Crie uma!
                                </p>
                            ) : (
                                labels.map(label => (
                                    <button
                                        key={label.id}
                                        onClick={() => handleToggleLabel(label.id)}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors"
                                    >
                                        <div className={cn('h-3 w-3 rounded-sm', label.color)} />
                                        <span className="text-sm flex-1 text-left">{label.name}</span>
                                        {selectedIds.has(label.id) && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    <div className="border-t pt-2 flex justify-end">
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-8"
                        >
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                            Salvar
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
