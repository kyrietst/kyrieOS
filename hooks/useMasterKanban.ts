
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { KanbanCard, KanbanColumn } from '../types/kanban'; // Using relative path to be safe
import { toast } from 'sonner';

// Extended types for Master View
export interface MasterKanbanCard extends KanbanCard {
    organization_name?: string;
    organization_slug?: string;
    original_column_id?: string;
    organization_color?: string; // Optional: for UI badges
}

export interface MasterKanbanColumn extends KanbanColumn {
    is_master_column: boolean;
}

export function useMasterKanban() {
    // Initialize with empty arrays typed correctly
    const [columns, setColumns] = useState<MasterKanbanColumn[]>([]);
    const [cards, setCards] = useState<MasterKanbanCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchMasterData();
    }, []);

    async function fetchMasterData() {
        try {
            setIsLoading(true);

            // 1. Fetch ALL Columns to determine structure
            // We need unique positions to build the master board structure
            const { data: allColumnsData, error: colsError } = await (supabase
                .from('kanban_columns' as any)
                .select('*')
                .order('position') as any);

            if (colsError) throw colsError;

            // 2. Group columns by position
            // We want to find the "Max" standard columns.
            // Map: Position -> Name (We pick the most common name or just use standardized names)
            const positionMap = new Map<number, string>();
            allColumnsData.forEach((col: any) => {
                if (!positionMap.has(col.position)) {
                    // Initialize with first name found, prioritize default names if needed
                    positionMap.set(col.position, col.name);
                }
                // Refinement: If we find "Concluído" or "Done", maybe prioritize checking is_done_column?
            });

            // 3. Construct Master Columns dynamically
            const dynamicColumns: MasterKanbanColumn[] = Array.from(positionMap.entries())
                .sort(([posA], [posB]) => posA - posB)
                .map(([pos, name]) => {
                    // Determine if this "Slot" is generally a "Done" slot
                    // We check if ANY column in this position is a 'done' column?
                    // Or we just rely on the standard "Last is Done" logic?
                    // For safety in MVP 1.2: Check if this is the LAST position found.
                    // Or better: Check if the col at this position has is_done_column=true in the raw data.

                    // Simple logic:
                    // Position 0 = Todo
                    // Position 1 = Doing
                    // Position 2+ = others
                    // Last = Done?

                    let masterId = `master-pos-${pos}`;
                    let displayName = `${name} (Geral)`;

                    // Override names for standard positions for cleaner UX
                    if (pos === 0) { masterId = 'master-todo'; displayName = 'A Fazer (Geral)'; }
                    else if (pos === 1) { masterId = 'master-doing'; displayName = 'Em Progresso (Geral)'; }
                    // We can keep original names for others

                    // Check if *most* columns at this position are "done" columns
                    const colsAtPos = allColumnsData.filter((c: any) => c.position === pos);
                    const isDone = colsAtPos.some((c: any) => c.is_done_column);

                    if (isDone) masterId = 'master-done'; // Or keep unique ID? Shared ID helps styling.

                    return {
                        id: masterId,
                        organization_id: 'master',
                        name: displayName,
                        position: pos,
                        is_default: pos === 0,
                        is_done_column: isDone,
                        is_master_column: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                });

            // Deduplicate IDs if logic produced duplicates (unlikely with pos-based, except manual overrides)
            // Ensure ids are unique:
            const uniqueColumns = dynamicColumns.map(c => ({
                ...c,
                id: c.id === 'master-todo' || c.id === 'master-doing' || c.id === 'master-done'
                    ? c.id
                    : `master-pos-${c.position}`
            }));

            // 4. Fetch Cards
            const { data: cardsData, error: cardsError } = await (supabase
                .from('kanban_cards' as any)
                .select(`
          *,
          kanban_columns!inner (
            id,
            position,
            is_done_column,
            is_default
          ),
          organizations!inner (
            id,
            name,
            slug
          )
        `) as any);

            if (cardsError) throw cardsError;

            // 5. Map Cards to Master Columns based on POSITION
            const mappedCards: MasterKanbanCard[] = (cardsData || []).map((card: any) => {
                const col = card.kanban_columns;

                // Find matching Master Column by Position
                // Fallback to closest logic if position doesn't perfectly match (e.g. outlier)
                let targetMasterCol = uniqueColumns.find(mc => mc.position === col.position);

                // Fallback logic for robustness
                if (!targetMasterCol) {
                    if (col.is_done_column) targetMasterCol = uniqueColumns.find(mc => mc.is_done_column);
                    else if (col.position === 0) targetMasterCol = uniqueColumns.find(mc => mc.position === 0);
                    else targetMasterCol = uniqueColumns[1] || uniqueColumns[0]; // Default to doing or todo
                }

                const masterColumnId = targetMasterCol ? targetMasterCol.id : 'master-doing';
                const orgColor = generateColor(card.organizations.name);

                return {
                    ...card,
                    column_id: masterColumnId,
                    original_column_id: card.column_id,
                    organization_name: card.organizations.name,
                    organization_slug: card.organizations.slug,
                    organization_color: orgColor
                };
            });

            setColumns(uniqueColumns);
            setCards(mappedCards);

        } catch (error) {
            console.error('Error fetching master kanban:', error);
            // toast.error('Erro ao carregar Master Kanban'); // Silent fail or retry? Toast is annoying on mounting sometimes.
        } finally {
            setIsLoading(false);
        }
    }

    // Helper for colors
    function generateColor(str: string) {
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-rose-500'];
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash % colors.length);
        return colors[index];
    }

    return {
        columns,
        cards,
        isLoading,
        refresh: fetchMasterData
    };
}
