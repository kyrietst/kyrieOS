'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createKanbanCard, createCardFromMaster, getOrganizationsSimple } from '@/actions/kanban'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface KanbanAddCardProps {
    columnId: string
    organizationId: string
    isMaster?: boolean
    columnPosition?: number
}

export default function KanbanAddCard({ columnId, organizationId, isMaster, columnPosition }: KanbanAddCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Master View Specifics
    const [orgs, setOrgs] = useState<{ id: string, name: string }[]>([])
    const [selectedOrgId, setSelectedOrgId] = useState('')
    const [loadingOrgs, setLoadingOrgs] = useState(false)

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isEditing && isMaster && orgs.length === 0) {
            setLoadingOrgs(true)
            getOrganizationsSimple()
                .then(data => {
                    setOrgs(data || [])
                    if (data && data.length > 0) setSelectedOrgId(data[0].id)
                })
                .finally(() => setLoadingOrgs(false))
        }
    }, [isEditing, isMaster, orgs.length])

    // Adjust height of textarea automatically
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [title])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
        if (e.key === 'Escape') {
            disableEditing()
        }
    }

    const disableEditing = () => {
        setIsEditing(false)
        setTitle('')
    }

    const handleSubmit = async () => {
        if (!title.trim()) return

        if (isMaster && !selectedOrgId) {
            toast.error('Selecione um cliente para criar a tarefa')
            return
        }

        try {
            setIsLoading(true)

            if (isMaster) {
                // Master View Logic
                await createCardFromMaster(selectedOrgId, title, columnPosition || 0)
                toast.success(`Tarefa criada para ${orgs.find(o => o.id === selectedOrgId)?.name}`)
            } else {
                // Standard View Logic
                await createKanbanCard({
                    column_id: columnId,
                    organization_id: organizationId,
                    title,
                    position: 99999 // Put at end
                })
                toast.success('Tarefa criada')
            }

            // Success state: Clear title, keep editing for rapid entry
            setTitle('')
            // Focus back on textarea if needed, though state update should handle it
            if (textareaRef.current) textareaRef.current.focus()

        } catch (error) {
            console.error(error)
            toast.error('Erro ao criar tarefa')
        } finally {
            setIsLoading(false)
        }
    }

    if (isEditing) {
        return (
            <div className="p-2 space-y-2 bg-background rounded-md border shadow-sm">
                <Textarea
                    ref={textareaRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Insira um título para este cartão..."
                    className="min-h-[60px] resize-none border-0 focus-visible:ring-0 p-1 text-sm shadow-none"
                    autoFocus
                />

                {isMaster && (
                    <div className="pt-1 pb-1">
                        {loadingOrgs ? (
                            <div className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Carregando clientes...</div>
                        ) : (
                            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                                <SelectTrigger className="h-7 text-xs w-full">
                                    <SelectValue placeholder="Selecione o Cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {orgs.map(org => (
                                        <SelectItem key={org.id} value={org.id} className="text-xs">
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        className="h-8 px-3"
                        onClick={handleSubmit}
                        disabled={isLoading || !title.trim() || (isMaster && !selectedOrgId)}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar cartão'}
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={disableEditing}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-muted/50 hover:text-foreground h-auto py-2 px-3"
            onClick={() => setIsEditing(true)}
        >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar um cartão
        </Button>
    )
}
