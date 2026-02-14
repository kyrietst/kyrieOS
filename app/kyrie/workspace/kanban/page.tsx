
'use client';

import { useMasterKanban } from '@/hooks/useMasterKanban';
import KanbanBoard from '@/components/kanban/KanbanBoard';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useState, useEffect, useMemo } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';


export default function MasterKanbanPage() {
    usePageTitle('Workspace Master Kanban');

    return (
        <div className="flex flex-col h-full">
            <MasterKanbanContent />
        </div>
    );
}

function MasterKanbanContent() {
    const {
        columns,
        cards,
        isLoading,
        loadMore,
        hasMore,
        updateFilters,
        filters
    } = useMasterKanban();

    const extraActions = useMemo(() => (
        <div className="flex items-center gap-2">
            <Select
                value={filters.status || "all"}
                onValueChange={(val) => updateFilters({ status: val === "all" ? null : val as any })}
            >
                <SelectTrigger className="w-[140px] h-9 border-border/40 bg-background/50">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="todo">A Fazer</SelectItem>
                    <SelectItem value="doing">Em Progresso</SelectItem>
                    <SelectItem value="done">Concluído</SelectItem>
                </SelectContent>
            </Select>
        </div>
    ), [filters.status, updateFilters])

    if (isLoading && cards.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-10">
                <div className="text-muted-foreground animate-pulse">Carregando Master Kanban...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-2 relative">
            <KanbanBoard
                initialColumns={columns}
                initialCards={cards}
                organizationId="master"
                extraActions={extraActions}
            />

            {/* Floating Load More for Board View */}
            {hasMore && (
                <div className="absolute bottom-6 right-6 z-50">
                    <Button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="shadow-lg"
                    >
                        {isLoading ? "Carregando..." : "Carregar Mais"}
                    </Button>
                </div>
            )}
        </div>
    )
}
