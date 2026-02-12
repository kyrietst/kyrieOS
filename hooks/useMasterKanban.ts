
import { useState, useEffect } from 'react';
import { MasterKanbanCard } from '../types/kanban';
import { toast } from 'sonner';
import { fetchMasterKanban } from '@/actions/master-kanban';


export function useMasterKanban() {
    const [cards, setCards] = useState<MasterKanbanCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: null as 'todo' | 'doing' | 'done' | null
    });

    useEffect(() => {
        loadData();
    }, [page, filters]);

    async function loadData() {
        setIsLoading(true);
        try {
            const response = await fetchMasterKanban({
                page,
                pageSize: 50,
                search: filters.search,
                status: filters.status
            });

            if (page === 1) {
                setCards(response.data);
            } else {
                setCards(prev => [...prev, ...response.data]);
            }

            // Simple hasMore logic
            setHasMore(cards.length + response.data.length < response.total);

        } catch (error) {
            console.error('Error loading master kanban:', error);
            toast.error('Erro ao carregar Master Kanban');
        } finally {
            setIsLoading(false);
        }
    }

    const refresh = () => {
        setPage(1);
        loadData();
    };

    const loadMore = () => {
        if (!isLoading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1); // Reset to first page on filter change
    };

    // Columns are now static/virtual based on our text definitions
    // We can return simple definitions for the UI to render columns
    const columns = [
        { id: 'master-todo', title: 'A Fazer', status: 'todo' },
        { id: 'master-doing', title: 'Em Progresso', status: 'doing' },
        { id: 'master-done', title: 'Concluído', status: 'done' }
    ];

    return {
        columns,
        cards,
        isLoading,
        refresh,
        loadMore,
        hasMore,
        filters,
        updateFilters
    };
}
