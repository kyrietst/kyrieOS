'use server'

import { createClient } from '@/utils/supabase/server'
import { MasterKanbanResponse, KanbanColumn } from '@/types/kanban'

/**
 * Fetches the 3 Global Columns (org_id IS NULL) used for the Master View.
 */
export async function getGlobalColumns(): Promise<KanbanColumn[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('kanban_columns')
        .select('*')
        .is('organization_id', null)
        .order('position')

    if (error) {
        console.error('Error fetching global columns:', error)
        throw error
    }
    return data || []
}

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
