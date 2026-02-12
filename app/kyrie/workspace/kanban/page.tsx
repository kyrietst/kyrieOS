
'use client';

import { useMasterKanban } from '@/hooks/useMasterKanban';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MasterKanbanPage() {
    const { columns, cards, isLoading } = useMasterKanban();

    return (
        <div className="flex flex-col h-full space-y-4 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Workspace Master Kanban</h1>
                    <div className="text-sm text-muted-foreground">
                        Visão unificada de todos os clientes
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar tarefa ou cliente..."
                        className="flex h-9 w-full sm:w-[250px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        onChange={(e) => {
                            // Debounce could be good here, but for now simple
                            // triggering reload on blur or enter might be better to avoid spamming RPC
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                const { updateFilters } = require('@/hooks/useMasterKanban').default; // pseudo-code, we need access to hook
                            }
                        }}
                    // Simpler approach: uncontrolled input + Search Button or controlled with debounce
                    />
                    {/* We need access to updateFilters here. But we destructured 'columns, cards, isLoading' only. 
                        Let's update the hook call first.
                    */}
                </div>
            </div>

            {/* We will update the hook usage below */}
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

    // De-bounce search
    const [searchTerm, setSearchTerm] = useState(filters.search);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search) {
                updateFilters({ search: searchTerm });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, filters.search, updateFilters]);

    if (isLoading && cards.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-10">
                <div className="text-muted-foreground animate-pulse">Carregando Master Kanban...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-2">

            {/* Filter Bar - Re-implementing correctly here */}
            <div className="flex items-center gap-2 pb-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por título ou cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select
                    value={filters.status || "all"}
                    onValueChange={(val) => updateFilters({ status: val === "all" ? null : val as any })}
                >
                    <SelectTrigger className="w-[180px]">
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

            <div className="flex-1 overflow-hidden relative">
                <KanbanBoard
                    initialColumns={columns}
                    initialCards={cards}
                    organizationId="master"
                />

                {/* Floating Load More for Board View (since board scrolls horizontally, maybe bottom right?) */}
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
        </div>
    )
}
