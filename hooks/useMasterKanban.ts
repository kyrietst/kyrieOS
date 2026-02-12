import { useState, useEffect } from 'react';
import { MasterKanbanCard, KanbanColumn } from '../types/kanban';
import { toast } from 'sonner';
import { fetchMasterKanban, getGlobalColumns } from '@/actions/master-kanban';


export function useMasterKanban() {
    const [cards, setCards] = useState<MasterKanbanCard[]>([]);
    const [columns, setColumns] = useState<KanbanColumn[]>([]);
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
            // Fetch Columns and Cards in parallel
            const [colsData, response] = await Promise.all([
                getGlobalColumns(),
                fetchMasterKanban({
                    page,
                    pageSize: 50,
                    search: filters.search,
                    status: filters.status
                })
            ]);

            setColumns(colsData);

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
