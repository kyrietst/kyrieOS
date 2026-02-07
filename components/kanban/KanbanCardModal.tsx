
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface KanbanCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    columnId: string;
    organizationId: string; // 'master' or specific UUID
    onCardCreated: () => void;
}

export default function KanbanCardModal({
    isOpen,
    onClose,
    columnId,
    organizationId,
    onCardCreated
}: KanbanCardModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [organizations, setOrganizations] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const isMasterView = organizationId === 'master';

    useEffect(() => {
        if (isOpen && isMasterView) {
            fetchOrganizations();
        }
    }, [isOpen, isMasterView]);

    async function fetchOrganizations() {
        const { data } = await supabase.from('organizations').select('id, name').order('name');
        if (data) setOrganizations(data);
    }

    async function handleCreate() {
        if (!title.trim()) return toast.error('Título é obrigatório');

        // Logic for Master View: Must select an org
        const targetOrgId = isMasterView ? selectedOrgId : organizationId;

        if (isMasterView && !targetOrgId) {
            return toast.error('Selecione uma organização/cliente');
        }

        try {
            setIsLoading(true);

            // If master view, we need to find the correct column ID for that organization
            // For MVP, we'll try to find 'A Fazer' (pos 0) or 'Inbox' for that org.
            // Or we just insert into the columnId passed... wait, columnId passed is 'master-todo'.
            // We cannot insert into 'master-todo'. We need the REAL column ID.

            let realColumnId = columnId;

            if (isMasterView) {
                // Resolve mapped column
                // If user clicked 'Add' in 'master-todo', we want position 0 column of targetOrgId
                // If 'master-doing', position 1...
                // This logic mimics the Aggregation logic but in reverse.

                let targetPos = 0; // Default to 'A Fazer'
                if (columnId === 'master-doing') targetPos = 1;
                if (columnId === 'master-done') targetPos = 2; // Usually don't create directly in done, but ok.

                const { data: colData } = await (supabase
                    .from('kanban_columns' as any)
                    .select('id')
                    .eq('organization_id', targetOrgId)
                    .eq('position', targetPos)
                    .single() as any);

                if (colData) {
                    realColumnId = colData.id;
                } else {
                    // Fallback: Find ANY column for that org
                    const { data: anyCol } = await (supabase
                        .from('kanban_columns' as any)
                        .select('id')
                        .eq('organization_id', targetOrgId)
                        .order('position')
                        .limit(1)
                        .single() as any);
                    if (anyCol) realColumnId = anyCol.id;
                    else throw new Error('Organização sem colunas configuradas.');
                }
            }

            const { error } = await supabase.from('kanban_cards' as any).insert({
                title,
                description,
                organization_id: targetOrgId,
                column_id: realColumnId,
                position: 0 // Top of list
            });

            if (error) throw error;

            toast.success('Tarefa criada com sucesso!');
            onCardCreated();
            onClose();
            setTitle('');
            setDescription('');
            setSelectedOrgId('');

        } catch (error) {
            console.error(error);
            toast.error('Erro ao criar tarefa');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nova Tarefa</DialogTitle>
                    <DialogDescription>
                        Crie uma nova tarefa para o quadro.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    {/* Organization Select (Master View Only) */}
                    {isMasterView && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="org" className="text-right">Cliente</Label>
                            <select
                                id="org"
                                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedOrgId}
                                onChange={(e) => setSelectedOrgId(e.target.value)}
                            >
                                <option value="" disabled>Selecione...</option>
                                {organizations.map(org => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Título</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="col-span-3"
                            placeholder="Ex: Revisar contrato"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="desc" className="text-right">Descrição</Label>
                        <Textarea
                            id="desc"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="col-span-3"
                            placeholder="Detalhes da tarefa..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleCreate} disabled={isLoading}>
                        {isLoading ? 'Criando...' : 'Criar Tarefa'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
