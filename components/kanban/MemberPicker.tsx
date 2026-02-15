'use client'

import { useState, useEffect } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Search, User as UserIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { addCardMember, removeCardMember, getWorkspaceMembers } from '@/actions/kanban'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PickerLayout } from './PickerLayout'


interface MemberPickerProps {
    cardId: string
    organizationId: string
    selectedMemberIds: string[]
    onMembersChange: (newMemberIds: string[]) => void
    trigger?: React.ReactNode
}

interface Profile {
    id: string
    full_name: string
    avatar_url: string | null
    email: string
}

export function MemberPicker({ cardId, organizationId, selectedMemberIds, onMembersChange, trigger }: MemberPickerProps) {
    const [open, setOpen] = useState(false)
    const [members, setMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [toggling, setToggling] = useState<string | null>(null)
    const [selectedIds, setSelectedIds] = useState<string[]>(selectedMemberIds)

    // Sync prop changes
    useEffect(() => {
        setSelectedIds(selectedMemberIds)
    }, [selectedMemberIds])

    useEffect(() => {
        if (open && !members.length) {
            loadMembers()
        }
    }, [open, organizationId])

    const loadMembers = async () => {
        try {
            setLoading(true)
            const data = await getWorkspaceMembers(organizationId)
            setMembers(data || [])
        } catch (error) {
            toast.error('Erro ao carregar membros')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleMember = async (memberId: string) => {
        if (toggling) return
        setToggling(memberId)

        const isSelected = selectedIds.includes(memberId)
        let newIds = []

        try {
            if (isSelected) {
                // Optimistic update
                newIds = selectedIds.filter(id => id !== memberId)
                setSelectedIds(newIds) // Local update
                await removeCardMember(cardId, memberId, organizationId)
                onMembersChange(newIds) // Parent update after success
            } else {
                newIds = [...selectedIds, memberId]
                setSelectedIds(newIds) // Local update
                await addCardMember(cardId, memberId, organizationId)
                onMembersChange(newIds) // Parent update after success
            }
        } catch {
            // Revert on error
            setSelectedIds(selectedIds)
            toast.error('Erro ao atualizar membro')
        } finally {
            setToggling(null)
        }
    }

    const filteredMembers = members.filter(m =>
        m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="h-8 border-dashed">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Membros
                    </Button>
                )}
            </PopoverTrigger>

            <PickerLayout
                title="Membros"
                onClose={() => setOpen(false)}
                searchValue={search}
                onSearchChange={setSearch}
                loading={loading}
                searchPlaceholder="Buscar membros..."
            >
                <div className="space-y-1">
                    {filteredMembers.length === 0 && !loading ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            Nenhum membro encontrado.
                        </div>
                    ) : (
                        filteredMembers.map((member) => {
                            const isSelected = selectedIds.includes(member.id)
                            const isToggling = toggling === member.id

                            return (
                                <button
                                    key={member.id}
                                    onClick={() => handleToggleMember(member.id)}
                                    disabled={isToggling}
                                    className={cn(
                                        "w-full flex items-center gap-2 p-1.5 rounded-md transition-colors text-left text-sm group",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        isToggling && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {/* Selection Indicator (Left like LabelPicker) */}
                                    <div className={cn(
                                        "h-4 w-4 rounded-[4px] border border-muted-foreground/30 flex items-center justify-center transition-colors shrink-0",
                                        isSelected ? "bg-primary border-primary text-primary-foreground" : "group-hover:border-primary/50"
                                    )}>
                                        {isSelected && <Check className="h-3 w-3" />}
                                    </div>

                                    {/* Avatar */}
                                    <Avatar className="h-6 w-6 shrink-0">
                                        <AvatarImage src={member.avatar_url || ''} />
                                        <AvatarFallback className="text-[10px]">
                                            {(member.full_name || 'U').substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate leading-none mb-0.5">
                                            {member.full_name || 'Usuário sem nome'}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground truncate leading-none">
                                            {member.email}
                                        </div>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </PickerLayout>
        </Popover>
    )
}
