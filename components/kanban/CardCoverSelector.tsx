'use client'

import { useState, useCallback } from 'react'
import { Check, Image as ImageIcon, Moon, Sun, UploadCloud, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { updateCardCover } from '@/actions/kanban'
import { toast } from 'sonner'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

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
        size: 'small' | 'large'
        textTheme: 'light' | 'dark'
    }
    attachments?: any[]
    onUpdate?: () => void
    variant?: 'button' | 'icon'
    organizationId?: string // Helpful for storage path organization
    className?: string
}

export default function CardCoverSelector({
    cardId,
    currentCover,
    attachments = [],
    onUpdate,
    variant = 'button',
    organizationId = 'global',
    className
}: CardCoverSelectorProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'colors' | 'upload'>('colors')

    const handleUpdate = async (updates: Partial<typeof currentCover>) => {
        try {
            setIsLoading(true)
            const finalCover = { ...currentCover, ...updates }
            await updateCardCover(
                cardId,
                finalCover.type,
                finalCover.value,
                finalCover.mode,
                finalCover.textTheme,
                finalCover.size
            )
            onUpdate?.() // This currently just calls the callback, but Prop Sync in KanbanBoard handles the heavy lifting
            toast.success('Capa atualizada')
            router.refresh()
        } catch (error) {
            console.error('Update cover error:', error)
            toast.error('Erro ao atualizar capa')
        } finally {
            setIsLoading(false)
        }
    }

    const removeCover = () => handleUpdate({ type: null, value: null })

    // Dropzone Logic
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        try {
            setIsLoading(true)
            const supabase = createClient()

            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            // Use 'global' if orgId is missing or strictly enforce it. 
            // For now, defaulting to 'uploads' folder if orgId isn't reliable, but orgId passed from props is better.
            const safeOrgId = organizationId || 'global'
            const filePath = `${safeOrgId}/${cardId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('card-covers')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('card-covers')
                .getPublicUrl(filePath)

            // 3. Update Card
            await handleUpdate({ type: 'image', value: publicUrl })

        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Erro ao fazer upload da imagem')
            setIsLoading(false)
        }
    }, [cardId, organizationId])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        maxFiles: 1,
        multiple: false
    })

    return (
        <Popover>
            <PopoverTrigger asChild>
                {variant === 'icon' ? (
                    <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", className)}>
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant="secondary" size="sm" className={cn("h-8 gap-2", className)}>
                        <ImageIcon className="h-4 w-4" />
                        Capa
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 overflow-hidden" align="start">
                <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
                    <h4 className="font-medium leading-none">Capa do Cartão</h4>
                    {currentCover.type && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeCover}
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            disabled={isLoading}
                        >
                            Remover
                        </Button>
                    )}
                </div>

                <div className="p-4 space-y-4">
                    {/* Size Selection */}
                    <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Tamanho</span>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                className={cn(
                                    "h-14 flex-col gap-0 items-start p-0 justify-start border-2 overflow-hidden",
                                    currentCover.size === 'small' ? "border-primary bg-primary/5" : "border-border/50"
                                )}
                                onClick={() => handleUpdate({ size: 'small' })}
                                disabled={isLoading}
                            >
                                {/* Preview Card Small */}
                                <div className="w-full h-full flex flex-col relative">
                                    <div
                                        className="h-2.5 w-full bg-muted absolute top-0 left-0 right-0 bg-cover bg-center"
                                        style={currentCover.size === 'small' && currentCover.value ? {
                                            backgroundColor: currentCover.type === 'color' ? currentCover.value : undefined,
                                            backgroundImage: currentCover.type === 'image' ? `url(${currentCover.value})` : undefined
                                        } : {}}
                                    />
                                    <div className="mt-auto w-full p-2">
                                        <div className="h-1 w-1/2 bg-muted-foreground/20 rounded-full mb-1" />
                                        <div className="h-1 w-3/4 bg-muted-foreground/10 rounded-full" />
                                    </div>
                                </div>
                            </Button>
                            <Button
                                variant="outline"
                                className={cn(
                                    "h-14 flex-col gap-0 items-start p-0 justify-start border-2 overflow-hidden",
                                    currentCover.size === 'large' ? "border-primary bg-primary/5" : "border-border/50"
                                )}
                                onClick={() => handleUpdate({ size: 'large' })}
                                disabled={isLoading}
                            >
                                {/* Preview Card Large */}
                                <div
                                    className="w-full h-full flex flex-col relative bg-muted-foreground/10 bg-cover bg-center"
                                    style={currentCover.size === 'large' && currentCover.value ? {
                                        backgroundColor: currentCover.type === 'color' ? currentCover.value : undefined,
                                        backgroundImage: currentCover.type === 'image' ? `url(${currentCover.value})` : undefined
                                    } : {}}
                                >
                                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                                        <div className="h-1 w-1/2 bg-white/50 rounded-full mb-1" />
                                        <div className="h-1 w-3/4 bg-white/30 rounded-full" />
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </div>

                    {/* Text Theme (only for large mode) */}
                    {currentCover.size === 'large' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Cor do Texto</span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn("flex-1", currentCover.textTheme === 'dark' && "border-primary bg-primary/5")}
                                    onClick={() => handleUpdate({ textTheme: 'dark' })}
                                    disabled={isLoading}
                                >
                                    <Moon className="h-3.5 w-3.5 mr-2" />
                                    Escuro
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn("flex-1", currentCover.textTheme === 'light' && "border-primary bg-primary/5")}
                                    onClick={() => handleUpdate({ textTheme: 'light' })}
                                    disabled={isLoading}
                                >
                                    <Sun className="h-3.5 w-3.5 mr-2" />
                                    Claro
                                </Button>
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Tabs for Source */}
                    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                        <button
                            onClick={() => setActiveTab('colors')}
                            className={cn(
                                "flex-1 text-xs font-medium py-1.5 rounded-md transition-all",
                                activeTab === 'colors' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Cores
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={cn(
                                "flex-1 text-xs font-medium py-1.5 rounded-md transition-all",
                                activeTab === 'upload' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Anexos & Upload
                        </button>
                    </div>

                    {/* Content */}
                    <div className="min-h-[140px]">
                        {activeTab === 'colors' ? (
                            <div className="grid grid-cols-5 gap-2 animate-in fade-in zoom-in-95 duration-200">
                                {TRELLO_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        className={cn(
                                            "h-9 rounded-md transition-transform active:scale-95 flex items-center justify-center",
                                            "hover:opacity-80 group relative ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                                        )}
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => handleUpdate({ type: 'color', value: color.value })}
                                        disabled={isLoading}
                                    >
                                        {currentCover.type === 'color' && currentCover.value === color.value && (
                                            <Check className="h-4 w-4 text-white drop-shadow-md" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                {/* Dropzone */}
                                <div
                                    {...getRootProps()}
                                    className={cn(
                                        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all",
                                        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
                                        isLoading && "opacity-50 pointer-events-none"
                                    )}
                                >
                                    <input {...getInputProps()} />
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center py-2 text-muted-foreground">
                                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                            <span className="text-xs">Enviando...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-2 text-muted-foreground">
                                            <UploadCloud className="h-8 w-8 mb-2 opacity-50" />
                                            <span className="text-xs font-medium text-foreground">Clique para enviar</span>
                                            <span className="text-[10px]">ou arraste uma imagem</span>
                                        </div>
                                    )}
                                </div>

                                {/* Attachments List */}
                                {attachments.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Usar Anexo</span>
                                        <div className="grid grid-cols-3 gap-2">
                                            {attachments
                                                .filter(a => a.file_type?.startsWith('image/'))
                                                .slice(0, 6)
                                                .map((att) => (
                                                    <button
                                                        key={att.id}
                                                        className={cn(
                                                            "aspect-video rounded-md transition-transform active:scale-95 bg-muted overflow-hidden relative group",
                                                            currentCover.value === att.file_url ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"
                                                        )}
                                                        onClick={() => handleUpdate({ type: 'image', value: att.file_url })}
                                                        disabled={isLoading}
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
                                        {attachments.filter(a => a.file_type?.startsWith('image/')).length === 0 && (
                                            <p className="text-xs text-muted-foreground text-center py-2">Nenhum anexo de imagem encontrado.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
