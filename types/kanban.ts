
export interface KanbanColumn {
    id: string;
    organization_id: string;
    name: string;
    position: number;
    is_default: boolean;
    is_done_column: boolean;
    color?: string;
    icon?: string;
    created_at?: string;
    updated_at?: string;
}

export interface KanbanCard {
    id: string;
    column_id: string;
    title: string;
    description?: string;
    position: number;
    ice_score?: number;
    labels?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    created_at?: string;
    updated_at?: string;
    // Extended for Master View
    organization_name?: string;
    organization_slug?: string;
    organization_color?: string;
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
