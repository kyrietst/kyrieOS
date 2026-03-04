
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
    ice_impact?: number;
    ice_confidence?: number;
    ice_ease?: number;
    ice_effort?: number;
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
    is_archived?: boolean;
    assigned_to?: string | null;
    project_id?: string | null;
    created_by?: string | null;
    created_at?: string;
    updated_at?: string;
    completed_at?: string | null;
    // Cover fields
    cover_type?: 'color' | 'image' | null;
    cover_value?: string | null;
    cover_mode?: 'header' | 'full';
    cover_size?: 'small' | 'large';
    cover_text_theme?: 'light' | 'dark';
    cover_color?: string | null; // Legacy cover color
    // Extended for Master View
    organization_name?: string;
    organization_slug?: string;
    organization_color?: string;
    // Pinned Status
    is_pinned?: boolean;
    pinned_at?: string | null;
    // Relações
    kanban_columns?: {
        name: string;
        is_done_column: boolean;
    };
    // Optional joined data
    start_date?: string | null;
    end_date?: string | null;
    due_date?: string | null;
    is_due_date_completed?: boolean | null;
    reminder_at?: string | null;
    assigned_to_user?: {
        id: string;
        full_name: string;
        avatar_url: string | null;
        email: string;
    } | null;
    assignments?: {
        id: string;
        user_id: string;
        card_id: string;
    }[];
    checklists?: KanbanChecklist[];
    comments?: KanbanCardComment[];
    attachments?: KanbanAttachment[];
    // Join data from Supabase relations
    organizations?: {
        id?: string;
        name: string;
        slug?: string;
        logo_url?: string | null;
    };
    kanban_card_members?: Array<{
        user_id: string;
        profiles?: {
            id: string;
            full_name: string | null;
            avatar_url: string | null;
        };
    }>;
    kanban_checklists?: KanbanChecklist[];
    // Master view fallback ID and status
    card_id?: string;
    master_status?: 'todo' | 'doing' | 'done' | 'backlog';
    // DnD animation state (client-side only)
    justDropped?: boolean;
    trello_card_id?: string | null;
}

// ==================== CHECKLIST TYPES ====================

export interface KanbanChecklist {
    id: string;
    card_id: string;
    organization_id: string;
    title: string;
    position: number;
    created_at: string;
    items?: KanbanChecklistItem[];
}

export interface KanbanChecklistItem {
    id: string;
    checklist_id: string;
    organization_id: string;
    content: string;
    is_completed: boolean;
    completed_at?: string | null;
    position: number;
    created_at: string;
}

// ==================== COMMENT TYPES ====================

export interface KanbanCardComment {
    id: string;
    card_id: string;
    organization_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string | null;
    };
}

// ==================== ATTACHMENT TYPES ====================

export interface KanbanAttachment {
    id: string;
    card_id: string;
    organization_id: string;
    user_id?: string;
    file_name: string;
    file_url: string;
    file_type?: string;
    file_size?: number;
    created_at: string;
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
    // Pinned Status
    is_pinned?: boolean;
    pinned_at?: string | null;
}

export interface MasterKanbanResponse {
    data: MasterKanbanCard[];
    total: number;
    page: number;
    pageSize: number;
}

// === Shared types for Kanban components ===

/** Union type for cards that can be either client-specific or master workspace */
export type KanbanCardData = KanbanCard | MasterKanbanCard;

/** Label join from kanban_card_labels → kanban_labels */
export interface KanbanCardLabelJoin {
    kanban_labels: {
        id: string;
        name: string;
        color: string;
    };
}

/** Member join from kanban_card_members → profiles */
export interface KanbanCardMemberJoin {
    profiles: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
    };
}

/** Comment with profile join */
export interface KanbanCardCommentWithProfile {
    id: string;
    card_id: string;
    user_id: string;
    content: string;
    created_at: string;
    organization_id: string;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

/** Input type for creating a new card */
export interface CreateKanbanCardInput {
    organization_id: string;
    column_id: string;
    title: string;
    position?: number;
    project_id?: string | null;
    description?: string | null;
}

/** Input type for updating card dates */
export interface UpdateCardDatesInput {
    start_date?: string | null;
    due_date?: string | null;
    reminder_at?: string | null;
}
