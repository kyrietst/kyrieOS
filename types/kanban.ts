
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
    estimated_minutes?: number;
    ice_ease?: number;
    is_archived?: boolean;
    assigned_to?: string | null;
    created_at?: string;
    updated_at?: string;
    // Cover fields
    cover_type?: 'color' | 'image' | null;
    cover_value?: string | null;
    cover_mode?: 'header' | 'full';
    cover_size?: 'small' | 'large';
    cover_text_theme?: 'light' | 'dark';
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
    // Cover fields
    cover_type?: 'color' | 'image' | null;
    cover_value?: string | null;
    cover_mode?: 'header' | 'full';
    cover_size?: 'small' | 'large';
    cover_text_theme?: 'light' | 'dark';
    // Labels (JSONB)
    labels: Array<{
        name: string;
        color: string;
    }>;
    // Capacity Data
    estimated_minutes?: number;
    remaining_load_minutes?: number;
    total_tracked_minutes?: number;
}

export interface MasterKanbanResponse {
    data: MasterKanbanCard[];
    total: number;
    page: number;
    pageSize: number;
}
