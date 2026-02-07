
'use client';

import { useMasterKanban } from '@/hooks/useMasterKanban';
import KanbanBoard from '@/components/kanban/KanbanBoard';

export default function MasterKanbanPage() {
    const { columns, cards, isLoading } = useMasterKanban();

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-10">
                <div className="text-muted-foreground animate-pulse">Carregando Master Kanban...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-4 p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Workspace Master Kanban</h1>
                <div className="text-sm text-muted-foreground">
                    Visão unificada de todos os clientes
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                { /* Pass centralized ID or null as this is a master view */}
                <KanbanBoard
                    initialColumns={columns}
                    initialCards={cards}
                    organizationId="master"
                />
            </div>
        </div>
    );
}
