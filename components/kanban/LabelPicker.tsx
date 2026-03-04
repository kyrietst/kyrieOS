import { PickerLayout } from './PickerLayout'
import { useState, useEffect, useMemo } from 'react'
import { Check, Plus, X, Tag as TagIcon, Loader2, Pencil, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { createLabel, getOrganizationLabels, setCardLabels } from '@/actions/labels'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'


interface LabelPickerProps {
    cardId: string
    organizationId: string
    selectedLabelIds: string[]
    onLabelsChange?: (labelIds: string[]) => void
    trigger?: React.ReactNode
}

const PRESET_COLORS = [
    { name: 'Vermelho', value: 'bg-red-500' },
    { name: 'Laranja', value: 'bg-orange-500' },
    { name: 'Amarelo', value: 'bg-yellow-500' },
    { name: 'Verde', value: 'bg-green-500' },
    { name: 'Azul', value: 'bg-blue-500' },
    { name: 'Roxo', value: 'bg-purple-500' },
    { name: 'Rosa', value: 'bg-pink-500' },
    { name: 'Cinza', value: 'bg-gray-500' },
]

const COLOR_MAP: Record<string, string> = {
    'bg-red-500': 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20',
    'bg-orange-500': 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20',
    'bg-yellow-500': 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    'bg-green-500': 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20',
    'bg-blue-500': 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20',
    'bg-purple-500': 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20',
    'bg-pink-500': 'bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-500/20',
    'bg-gray-500': 'bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/20',
}

export function LabelPicker({ cardId, organizationId, selectedLabelIds = [], onLabelsChange, trigger }: LabelPickerProps) {
    // ... existing state ...
    const [labels, setLabels] = useState<Array<{ id: string, name: string, color: string }>>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedLabelIds))
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (isOpen) {
            loadLabels()
        }
    }, [isOpen, organizationId])

    // Sync prop changes
    useEffect(() => {
        setSelectedIds(new Set(selectedLabelIds))
    }, [selectedLabelIds])

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

    const filteredLabels = useMemo(() => {
        if (!searchQuery) return labels
        return labels.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }, [labels, searchQuery])

    const handleToggleLabel = async (labelId: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(labelId)) {
            newSelected.delete(labelId)
        } else {
            newSelected.add(labelId)
        }

        // Optimistic update
        setSelectedIds(newSelected)

        try {
            // Save immediately on toggle (Trello style)
            await setCardLabels(cardId, Array.from(newSelected))
            if (onLabelsChange) onLabelsChange(Array.from(newSelected))
        } catch (error) {
            toast.error('Erro ao atualizar etiqueta')
            // Revert changes on error? 
            // Ideally yes, but keeping plain for now.
        }
    }

    const handleCreateLabel = async () => {
        // Use search query as name if not empty
        const nameToCreate = searchQuery.trim()
        if (!nameToCreate) return

        try {
            setIsSaving(true)
            const newLabel = await createLabel(organizationId, nameToCreate, selectedColor)
            setLabels(prev => [...prev, newLabel])
            setSearchQuery('')
            setIsCreating(false)
            toast.success('Etiqueta criada!')

            // Auto-select
            handleToggleLabel(newLabel.id)
        } catch (error: unknown) {
            if (error instanceof Error && error.message?.includes('duplicate')) {
                toast.error('Já existe uma etiqueta com esse nome')
            } else {
                toast.error('Erro ao criar etiqueta')
            }
        } finally {
            setIsSaving(false)
        }
    }

    // Helper to render label pill
    const renderLabelPill = (label: { id: string; name: string; color: string }) => {
        const colorClass = COLOR_MAP[label.color]
        const isHex = label.color?.startsWith('#')

        return (
            <div
                className={cn(
                    "h-6 flex-1 rounded text-xs font-medium px-2 flex items-center transition-all",
                    colorClass || "bg-secondary text-secondary-foreground"
                )}
                style={isHex ? {
                    backgroundColor: label.color + '25',
                    color: label.color
                } : (!colorClass ? {
                    backgroundColor: 'rgba(100,100,100,0.1)',
                    color: 'inherit'
                } : {})}
            >
                {label.name}
            </div>
        )
    }

    const startCreating = () => {
        setIsCreating(true)
        if (searchQuery) setSearchQuery(searchQuery)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2 h-7 text-xs">
                        <TagIcon className="h-3.5 w-3.5" />
                        Etiquetas
                    </Button>
                )}
            </PopoverTrigger>

            <PickerLayout
                title={isCreating ? 'Criar etiqueta' : 'Etiquetas'}
                onClose={() => {
                    if (isCreating) setIsCreating(false)
                    else setIsOpen(false)
                }}
                onBack={isCreating ? () => setIsCreating(false) : undefined}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                loading={isLoading}
                showSearch={!isCreating}
                searchPlaceholder="Buscar etiquetas..."
            >
                {!isCreating ? (
                    <div className="space-y-3">
                        <div className="space-y-1 pr-1">
                            <div className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Etiquetas</div>

                            {filteredLabels.length > 0 ? (
                                filteredLabels.map(label => (
                                    <div key={label.id} className="group flex items-center gap-2 mb-1">
                                        <button
                                            onClick={() => handleToggleLabel(label.id)}
                                            className="flex-1 flex items-center gap-2 group/btn text-left"
                                        >
                                            <div className={cn(
                                                "h-4 w-4 rounded-[4px] border border-muted-foreground/30 flex items-center justify-center transition-colors shrink-0",
                                                selectedIds.has(label.id) ? "bg-primary border-primary text-primary-foreground" : "group-hover/btn:border-primary/50"
                                            )}>
                                                {selectedIds.has(label.id) && <Check className="h-3 w-3" />}
                                            </div>

                                            {renderLabelPill(label)}
                                        </button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Pencil className="h-3 w-3 text-muted-foreground" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-4 text-center">
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Nenhuma etiqueta encontrada.
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-7 w-full text-xs"
                                        onClick={startCreating}
                                    >
                                        Criar "{searchQuery || 'nova'}"
                                    </Button>
                                </div>
                            )}
                        </div>

                        {filteredLabels.length > 0 && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full h-8 text-xs bg-muted/50 hover:bg-muted"
                                onClick={startCreating}
                            >
                                <Plus className="h-3.5 w-3.5 mr-2" />
                                Criar uma nova etiqueta
                            </Button>
                        )}
                    </div>
                ) : (
                    // Create Mode - Kept mostly same but wrapped
                    <div className="space-y-4 pt-1 animate-in slide-in-from-right-5 fade-in duration-200">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Nome</label>
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Nome da etiqueta"
                                className="h-8 text-xs"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Cor</label>
                            <div className="grid grid-cols-5 gap-1.5">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color.value}
                                        onClick={() => setSelectedColor(color.value)}
                                        className={cn(
                                            'aspect-video rounded transition-all hover:scale-110 focus:scale-110 focus:outline-none',
                                            COLOR_MAP[color.value]?.split(' ')[0] || color.value,
                                            selectedColor === color.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-popover' : 'hover:ring-1 hover:ring-ring/50'
                                        )}
                                        title={color.name}
                                    >
                                        {selectedColor === color.value && <Check className="h-3.5 w-3.5 mx-auto text-foreground/80" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2">
                            <Button
                                size="sm"
                                onClick={handleCreateLabel}
                                disabled={!searchQuery.trim() || isSaving}
                                className="w-full"
                            >
                                {isSaving && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                                Criar
                            </Button>
                        </div>
                    </div>
                )}
            </PickerLayout>
        </Popover>
    )
}
