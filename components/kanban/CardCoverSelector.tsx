'use client'

import { useState } from 'react'
import { Check, Image as ImageIcon, Layout, Maximize2, Moon, Sun, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { updateCardCover } from '@/actions/kanban'
import { toast } from 'sonner'

const TRELLO_COLORS = [
    { name: 'Green', value: '#7BC86C' },
    { name: 'Yellow', value: '#F5DD29' },
    { name: 'Orange', value: '#FFAF3F' },
    { name: 'Red', value: '#EF7564' },
    { name: 'Purple', value: '#CD8DE5' },
    { name: 'Blue', value: '#5BA4CF' },
    { name: 'Sky', value: '#29CCE5' },
    { name: 'Lime', value: '#6DECA9' },
    { name: 'Pink', value: '#FF8ED4' },
    { name: 'Black', value: '#172b4d' },
]

interface CardCoverSelectorProps {
    cardId: string
    currentCover: {
        type: 'color' | 'image' | null
        value: string | null
        mode: 'header' | 'full'
        textTheme: 'light' | 'dark'
    }
    attachments?: any[]
    onUpdate?: () => void
    variant?: 'button' | 'icon'
}

export default function CardCoverSelector({
    cardId,
    currentCover,
    attachments = [],
    onUpdate,
    variant = 'button'
}: CardCoverSelectorProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleUpdate = async (updates: Partial<typeof currentCover>) => {
        try {
            setIsLoading(true)
            const finalCover = { ...currentCover, ...updates }
            await updateCardCover(
                cardId,
                finalCover.type,
                finalCover.value,
                finalCover.mode,
                finalCover.textTheme
            )
            toast.success('Capa atualizada')
            onUpdate?.()
        } catch (error) {
            toast.error('Erro ao atualizar capa')
        } finally {
            setIsLoading(false)
        }
    }

    const removeCover = () => handleUpdate({ type: null, value: null })

    return (
        <Popover>
            <PopoverTrigger asChild>
                {variant === 'icon' ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant="secondary" size="sm" className="h-8 gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Capa
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="start">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium leading-none">Capa</h4>
                        {currentCover.type && (
                            <Button variant="ghost" size="sm" onClick={removeCover} className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
                                Remover capa
                            </Button>
                        )}
                    </div>

                    {/* Size/Mode Options */}
                    <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Tamanho</span>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                className={cn(
                                    "h-16 flex-col gap-1 items-start p-2 justify-between border-2",
                                    currentCover.mode === 'header' ? "border-primary bg-primary/5" : "border-border/50"
                                )}
                                onClick={() => handleUpdate({ mode: 'header' })}
                            >
                                <div className="w-full h-4 bg-muted rounded-sm overflow-hidden">
                                    <div className="w-full h-2 bg-primary/40" />
                                </div>
                                <span className="text-[10px] font-medium">Topo (Header)</span>
                            </Button>
                            <Button
                                variant="outline"
                                className={cn(
                                    "h-16 flex-col gap-1 items-start p-2 justify-between border-2",
                                    currentCover.mode === 'full' ? "border-primary bg-primary/5" : "border-border/50"
                                )}
                                onClick={() => handleUpdate({ mode: 'full' })}
                            >
                                <div className="w-full h-4 bg-muted rounded-sm bg-primary/40" />
                                <span className="text-[10px] font-medium">Cheio (Full)</span>
                            </Button>
                        </div>
                    </div>

                    {/* Text Theme (only for full mode) */}
                    {currentCover.mode === 'full' && (
                        <div className="space-y-2">
                            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Cor do Texto</span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={currentCover.textTheme === 'dark' ? "border-primary bg-primary/5" : ""}
                                    onClick={() => handleUpdate({ textTheme: 'dark' })}
                                >
                                    <Moon className="h-3.5 w-3.5 mr-2" />
                                    Escuro
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={currentCover.textTheme === 'light' ? "border-primary bg-primary/5" : ""}
                                    onClick={() => handleUpdate({ textTheme: 'light' })}
                                >
                                    <Sun className="h-3.5 w-3.5 mr-2" />
                                    Claro
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Colors Grid */}
                    <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Cores</span>
                        <div className="grid grid-cols-5 gap-2">
                            {TRELLO_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    className={cn(
                                        "h-8 rounded-md transition-transform active:scale-95 flex items-center justify-center",
                                        "hover:opacity-80 group relative"
                                    )}
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => handleUpdate({ type: 'color', value: color.value })}
                                >
                                    {currentCover.type === 'color' && currentCover.value === color.value && (
                                        <Check className="h-4 w-4 text-white drop-shadow-sm" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Attachments Section */}
                    {attachments.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Anexos</span>
                            <div className="grid grid-cols-3 gap-2">
                                {attachments
                                    .filter(a => a.file_type?.startsWith('image/'))
                                    .map((att) => (
                                        <button
                                            key={att.id}
                                            className={cn(
                                                "h-12 rounded-md transition-transform active:scale-95 bg-muted overflow-hidden relative group",
                                                currentCover.value === att.file_url ? "ring-2 ring-primary" : ""
                                            )}
                                            onClick={() => handleUpdate({ type: 'image', value: att.file_url })}
                                        >
                                            <img src={att.file_url} className="w-full h-full object-cover" alt="" />
                                            {currentCover.value === att.file_url && (
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                    <Check className="h-4 w-4 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
