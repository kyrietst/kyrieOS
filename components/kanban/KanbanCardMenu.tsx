import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
    Maximize2,
    Pencil,
    Copy,
    Archive,
    ArrowRight,
    Link as LinkIcon,
    Palette,
    Users,
    Tag,
    Pin,
    PinOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { duplicateCard, archiveCard, updateCardColor, toggleCardPin } from '@/actions/kanban'
import { useState } from 'react'

interface KanbanCardMenuProps {
    card: any
    onOpen: () => void // Left click action (passed from parent)
    children?: React.ReactNode
    onPinToggle?: (cardId: string, isPinned: boolean) => void
}

const COLORS = [
    { name: 'Vermelho', value: 'bg-red-500' },
    { name: 'Verde', value: 'bg-green-500' },
    { name: 'Azul', value: 'bg-blue-500' },
    { name: 'Amarelo', value: 'bg-yellow-500' },
    { name: 'Roxo', value: 'bg-purple-500' },
    { name: 'Sem capa', value: null },
]

export function KanbanCardMenu({ card, onOpen, children, onPinToggle }: KanbanCardMenuProps) {
    const [loading, setLoading] = useState(false)

    const handleDuplicate = async () => {
        try {
            setLoading(true)
            await duplicateCard(card.id, card.column_id)
            toast.success('Cartão duplicado')
        } catch (e) {
            toast.error('Erro ao duplicar cartão')
        } finally {
            setLoading(false)
        }
    }

    const handleArchive = async () => {
        try {
            setLoading(true)
            await archiveCard(card.id)
            toast.success('Cartão arquivado')
        } catch (e) {
            toast.error('Erro ao arquivar cartão')
        } finally {
            setLoading(false)
        }
    }

    const handleColorChange = async (color: string | null) => {
        try {
            // Optimistic update could go here
            await updateCardColor(card.id, color || '')
            toast.success('Capa atualizada')
        } catch (e) {
            toast.error('Erro ao atualizar capa')
        }
    }

    const handleTogglePin = async () => {
        const newPinnedState = !card.is_pinned
        const validId = card.id || card.card_id
        // Optimistic update FIRST (instant reorder with animation)
        onPinToggle?.(validId, newPinnedState)
        try {
            await toggleCardPin(validId, newPinnedState)
            toast.success(newPinnedState ? 'Cartão fixado' : 'Cartão desafixado')
        } catch (e) {
            // Revert on failure
            onPinToggle?.(validId, !newPinnedState)
            toast.error('Erro ao alterar fixação')
        }
    }

    const handleCopyLink = () => {
        const url = `${window.location.origin}/kyrie/card/${card.id}` // Adjust global route if needed
        navigator.clipboard.writeText(url)
        toast.success('Link copiado')
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {/* The card content trigger context menu on Right Click. 
                    Left Click is handled by the child component itself (Card) via its own onClick handler. 
                 */}
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64 z-50">
                <ContextMenuLabel>Ações Rápidas</ContextMenuLabel>

                <ContextMenuItem onClick={onOpen}>
                    <Maximize2 className="mr-2 h-4 w-4" />
                    Abrir Cartão / Detalhes
                </ContextMenuItem>

                <ContextMenuItem onClick={handleTogglePin}>
                    {card.is_pinned ? (
                        <>
                            <PinOff className="mr-2 h-4 w-4" />
                            Desafixar
                        </>
                    ) : (
                        <>
                            <Pin className="mr-2 h-4 w-4" />
                            Fixar no Topo
                        </>
                    )}
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuSub>
                    <ContextMenuSubTrigger>
                        <Tag className="mr-2 h-4 w-4" />
                        Editar Etiquetas
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48">
                        <ContextMenuItem disabled>
                            Em breve...
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>

                <ContextMenuItem disabled>
                    <Users className="mr-2 h-4 w-4" />
                    Alterar Membros
                    <span className="ml-auto text-xs text-muted-foreground">Pro</span>
                </ContextMenuItem>

                <ContextMenuSub>
                    <ContextMenuSubTrigger>
                        <Palette className="mr-2 h-4 w-4" />
                        Alterar Capa
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48">
                        <ContextMenuLabel>Cores</ContextMenuLabel>
                        <ContextMenuSeparator />
                        {COLORS.map((color) => (
                            <ContextMenuItem
                                key={color.name}
                                onClick={() => handleColorChange(color.value)}
                                className="cursor-pointer"
                            >
                                <div className={`w-4 h-4 rounded-full mr-2 border ${color.value?.replace('bg-', 'bg-') || 'border-slate-300'}`} />
                                {color.name}
                            </ContextMenuItem>
                        ))}
                    </ContextMenuSubContent>
                </ContextMenuSub>

                <ContextMenuSeparator />

                <ContextMenuItem disabled>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Mover
                </ContextMenuItem>

                <ContextMenuItem onClick={handleDuplicate} disabled={loading}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Cartão
                </ContextMenuItem>

                <ContextMenuItem onClick={handleCopyLink}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Copiar Link
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem
                    onClick={handleArchive}
                    disabled={loading}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                    <Archive className="mr-2 h-4 w-4" />
                    Arquivar
                </ContextMenuItem>

            </ContextMenuContent>
        </ContextMenu>
    )
}
