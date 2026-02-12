
export interface KanbanColumn {
    id: string;
    organization_id: string | null;
    name: string;
    position: number;
    is_default: boolean;
    is_done_column: boolean;
    color?: string;
    icon?: string;
    wip_limit?: number | null;
    status?: 'todo' | 'doing' | 'done' | 'backlog';
    created_at?: string;
    updated_at?: string;
}

export interface KanbanCard {
    id: string;
    column_id: string;
    organization_id: string;
    title: string;
    description?: string;
    position: number;
    // ICE Score components
    impact?: number;
    confidence?: number;
    effort?: number;
    ice_score?: number; // Generated column
    // Labels (normalized)
    kanban_card_labels?: Array<{
        kanban_labels: {
            id: string;
            name: string;
            color: string;
        }
    }>;
    labels?: string[]; // DEPRECATED - mantido para compatibilidade
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    is_archived?: boolean;
    assigned_to?: string | null;
    created_at?: string;
    updated_at?: string;
    // Extended for Master View
    organization_name?: string;
    organization_slug?: string;
    organization_color?: string;
    // Relações
    kanban_columns?: {
        name: string;
        is_done_column: boolean;
    };
}


export interface TimeEntry {
    id: string;
    card_id: string;
    user_id: string;
    start_time: string;
    end_time: string | null;
    duration: number | null;
    description?: string;
    created_at: string;
    // Optional joined fields
    profiles?: {
        full_name: string;
        avatar_url: string;
        email: string;
    };
}

// ==================== MASTER KANBAN TYPES ====================

export interface MasterKanbanCard {
    card_id: string;
    title: string;
    description?: string;
    position: number;
    column_id: string;
    organization_id: string;
    due_date?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    ice_score?: number;
    created_at?: string;
    updated_at?: string;
    assigned_to?: string | null;
    // Organization Data
    organization_name: string;
    organization_slug: string;
    organization_logo?: string;
    // Original Column Data
    original_column_name: string;
    is_done_column: boolean;
    // Computed Status
    master_status: 'todo' | 'doing' | 'done' | 'backlog';
    // Labels (JSONB)
    labels: Array<{
        name: string;
        color: string;
    }>;
}

export interface MasterKanbanResponse {
    data: MasterKanbanCard[];
    total: number;
    page: number;
    pageSize: number;
}
