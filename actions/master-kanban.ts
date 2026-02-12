'use server'

import { createClient } from '@/utils/supabase/server'
import { MasterKanbanResponse } from '@/types/kanban'

interface FetchMasterKanbanParams {
    page?: number
    pageSize?: number
    search?: string
    status?: 'todo' | 'doing' | 'done' | null
}

export async function fetchMasterKanban({
    page = 1,
    pageSize = 50,
    search = '',
    status = null
}: FetchMasterKanbanParams): Promise<MasterKanbanResponse> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase.rpc('get_master_kanban', {
            page,
            page_size: pageSize,
            search_text: search || null,
            status_filter: status || null
        })

        if (error) {
            console.error('Error fetching master kanban:', error)
            throw error
        }

        // RPC returns a flat array with total_count in each row. 
        // We need to extract total_count from the first row (if implementation follows that pattern)
        // Looking at the migration, it returns TABLE (..., total_count BIGINT).

        const rows = data || []
        const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

        return {
            data: rows.map((row: any) => ({
                ...row,
                // Ensure labels are parsed if RPC returns string, but here it returns JSONB so it should be object
                labels: typeof row.labels === 'string' ? JSON.parse(row.labels) : row.labels
            })),
            total: totalCount,
            page,
            pageSize
        }

    } catch (error) {
        console.error('Server Action fetchMasterKanban failed:', error)
        return {
            data: [],
            total: 0,
            page,
            pageSize
        }
    }
}
