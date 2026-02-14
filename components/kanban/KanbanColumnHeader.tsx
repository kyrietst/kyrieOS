'use client'

import { useState, useRef, useEffect } from 'react'
import { KanbanColumn } from '@/types/kanban'
import { Input } from '@/components/ui/input'
import { Globe, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface KanbanColumnHeaderProps {
    column: KanbanColumn
    organizationId: string
    onRename: (columnId: string, newName: string) => Promise<void>
}

export default function KanbanColumnHeader({
    column,
    organizationId,
    onRename
}: KanbanColumnHeaderProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState(column.name)
    const inputRef = useRef<HTMLInputElement>(null)

    // Reset title if column prop changes
    useEffect(() => {
        setTitle(column.name)
    }, [column.name])

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus()
            inputRef.current?.select()
        }
    }, [isEditing])

    const enableEditing = () => {
        // Only allow editing if user has permission
        // For now, we allow the UI to open, but the action will fail if unauthorized.
        // Ideally we check roles here, but that requires more context.
        setIsEditing(true)
    }

    const cancelEditing = () => {
        setIsEditing(false)
        setTitle(column.name)
    }

    const saveTitle = async () => {
        if (title.trim() === '') {
            cancelEditing()
            return
        }

        if (title === column.name) {
            setIsEditing(false)
            return
        }

        try {
            setIsEditing(false) // Optimistic close
            await onRename(column.id, title)
        } catch (error) {
            toast.error('Erro ao renomear coluna')
            setTitle(column.name) // Revert on error
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveTitle()
        } else if (e.key === 'Escape') {
            cancelEditing()
        }
    }

    const isGlobal = column.organization_id === null

    if (isEditing) {
        return (
            <div className="flex-1 mr-2" onPointerDown={e => e.stopPropagation()}>
                {/* stopPropagation needed to prevent drag start when clicking input */}
                <Input
                    ref={inputRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={handleKeyDown}
                    className="h-7 text-sm font-semibold px-2 py-1 bg-background"
                />
            </div>
        )
    }

    return (
        <div
            className="flex-1 flex items-center gap-2 overflow-hidden cursor-pointer"
            onClick={enableEditing}
            title="Clique para editar"
        >
            {isGlobal && <Globe className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />}

            <h3 className="font-semibold text-sm truncate">
                {column.name}
            </h3>

            {isGlobal && (
                <span className="text-[9px] border border-violet-100 text-violet-600 px-1.5 py-0 rounded-full font-bold uppercase tracking-wider flex-shrink-0">
                    Global
                </span>
            )}
        </div>
    )
}
