'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createColumn } from '@/actions/kanban';
import { toast } from 'sonner';

interface KanbanAddListProps {
    organizationId: string;
}

export default function KanbanAddList({ organizationId }: KanbanAddListProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    // Handle click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (formRef.current && !formRef.current.contains(event.target as Node)) {
                setIsEditing(false);
            }
        }
        if (isEditing) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing]);

    async function handleSubmit() {
        if (!title.trim()) return;

        try {
            setIsLoading(true);
            await createColumn(organizationId, title);
            toast.success('Lista criada!');
            setTitle('');
            // Keep editing state true to allow rapid entry, but maybe refocus?
            if (inputRef.current) inputRef.current.focus();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao criar lista');
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div
                ref={formRef}
                className="min-w-[300px] w-[300px] rounded-xl bg-secondary/50 p-3 flex flex-col gap-2 h-fit border border-border/40 shadow-sm backdrop-blur-sm"
            >
                <Input
                    ref={inputRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite o nome da lista..."
                    className="h-9 bg-background border-primary/10 focus-visible:ring-primary/20"
                    disabled={isLoading}
                />
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="h-8 px-3"
                    >
                        Adicionar lista
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsEditing(false)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Button
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="min-w-[320px] w-[320px] justify-start gap-2 h-12 bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground rounded-xl border border-dashed border-border/40"
        >
            <Plus className="w-4 h-4" />
            Adicionar outra lista
        </Button>
    );
}
