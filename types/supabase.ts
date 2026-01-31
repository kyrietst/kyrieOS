export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          target_id: string | null
          target_name: string | null
          target_type: string | null
          title: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          target_id?: string | null
          target_name?: string | null
          target_type?: string | null
          title: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          target_id?: string | null
          target_name?: string | null
          target_type?: string | null
          title?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_history: {
        Row: {
          action: string
          approval_id: string
          comment: string | null
          created_at: string
          id: string
          metadata: Json | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          approval_id: string
          comment?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          approval_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_history_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          content_type: Database["public"]["Enums"]["approval_content_type"]
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          expires_at: string | null
          feedback: string | null
          feedback_at: string | null
          feedback_by: string | null
          files: Json | null
          id: string
          metadata: Json | null
          organization_id: string
          parent_id: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["approval_status"] | null
          title: string
          updated_at: string
          version: number | null
        }
        Insert: {
          content_type: Database["public"]["Enums"]["approval_content_type"]
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          expires_at?: string | null
          feedback?: string | null
          feedback_at?: string | null
          feedback_by?: string | null
          files?: Json | null
          id?: string
          metadata?: Json | null
          organization_id: string
          parent_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          title: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          content_type?: Database["public"]["Enums"]["approval_content_type"]
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          expires_at?: string | null
          feedback?: string | null
          feedback_at?: string | null
          feedback_by?: string | null
          files?: Json | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          parent_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          title?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_feedback_by_fkey"
            columns: ["feedback_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_metrics: {
        Row: {
          ad_spend: number
          churn_rate: number | null
          consultancy_fee: number
          created_at: string
          data_source: string | null
          health_score: number | null
          id: string
          last_calculated_at: string | null
          metadata: Json | null
          new_customers: number
          organization_id: string
          period_month: number
          period_year: number
          revenue: number
          roi: number | null
          updated_at: string
        }
        Insert: {
          ad_spend?: number
          churn_rate?: number | null
          consultancy_fee?: number
          created_at?: string
          data_source?: string | null
          health_score?: number | null
          id?: string
          last_calculated_at?: string | null
          metadata?: Json | null
          new_customers?: number
          organization_id: string
          period_month: number
          period_year: number
          revenue?: number
          roi?: number | null
          updated_at?: string
        }
        Update: {
          ad_spend?: number
          churn_rate?: number | null
          consultancy_fee?: number
          created_at?: string
          data_source?: string | null
          health_score?: number | null
          id?: string
          last_calculated_at?: string | null
          metadata?: Json | null
          new_customers?: number
          organization_id?: string
          period_month?: number
          period_year?: number
          revenue?: number
          roi?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_health: {
        Row: {
          calculated_at: string
          engagement_score: number
          financial_score: number
          growth_score: number
          id: string
          insights: Json | null
          organization_id: string
          overall_score: number
          relationship_score: number
        }
        Insert: {
          calculated_at?: string
          engagement_score?: number
          financial_score?: number
          growth_score?: number
          id?: string
          insights?: Json | null
          organization_id: string
          overall_score?: number
          relationship_score?: number
        }
        Update: {
          calculated_at?: string
          engagement_score?: number
          financial_score?: number
          growth_score?: number
          id?: string
          insights?: Json | null
          organization_id?: string
          overall_score?: number
          relationship_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_health_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          api_key: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          status: string | null
          tier: string | null
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          status?: string | null
          tier?: string | null
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          status?: string | null
          tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          settings: Json | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          settings?: Json | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          settings?: Json | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          ai_insights: string | null
          ai_recommendations: string | null
          created_at: string
          created_by: string
          data_snapshot: Json
          id: string
          organization_id: string
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["report_status"]
          title: string
          type: Database["public"]["Enums"]["report_type"]
          updated_at: string
        }
        Insert: {
          ai_insights?: string | null
          ai_recommendations?: string | null
          created_at?: string
          created_by: string
          data_snapshot?: Json
          id?: string
          organization_id: string
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["report_status"]
          title: string
          type?: Database["public"]["Enums"]["report_type"]
          updated_at?: string
        }
        Update: {
          ai_insights?: string | null
          ai_recommendations?: string | null
          created_at?: string
          created_by?: string
          data_snapshot?: Json
          id?: string
          organization_id?: string
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["report_status"]
          title?: string
          type?: Database["public"]["Enums"]["report_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          client_visible: boolean
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          parent_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          project_id: string
          status: Database["public"]["Enums"]["task_status"]
          technical_effort_score: number | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_visible?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          parent_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id: string
          status?: Database["public"]["Enums"]["task_status"]
          technical_effort_score?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          parent_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          technical_effort_score?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number
          end_time: string | null
          id: string
          start_time: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number
          end_time?: string | null
          id?: string
          start_time: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number
          end_time?: string | null
          id?: string
          start_time?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_role: {
        Args: {
          required_role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Returns: boolean
      }
      get_user_org_id: {
        Args: {
          user_uid: string
        }
        Returns: string
      }
      is_kyrie_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "report_generated"
        | "report_viewed"
        | "task_created"
        | "task_completed"
        | "project_created"
        | "project_updated"
        | "time_logged"
        | "metric_updated"
        | "health_calculated"
        | "user_login"
        | "user_action"
      approval_content_type:
        | "creative"
        | "copy"
        | "post"
        | "landing_page"
        | "email"
        | "other"
      approval_status:
        | "pending"
        | "approved"
        | "rejected"
        | "revision"
        | "expired"
      churn_risk_level: "low" | "medium" | "high" | "critical"
      report_status: "draft" | "generated" | "sent" | "viewed"
      report_type: "weekly" | "monthly" | "quarterly" | "custom"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status:
        | "backlog"
        | "todo"
        | "in_progress"
        | "review"
        | "done"
        | "cancelled"
      user_role: "KYRIE_ADMIN" | "KYRIE_TEAM" | "CLIENT_OWNER" | "CLIENT_VIEWER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Exclude<keyof Database, "__InternalSupabase">

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: PublicSchema },
  TableName extends PublicTableNameOrOptions extends { schema: PublicSchema }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: PublicSchema }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: PublicSchema },
  TableName extends PublicTableNameOrOptions extends { schema: PublicSchema }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: PublicSchema }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: PublicSchema },
  TableName extends PublicTableNameOrOptions extends { schema: PublicSchema }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: PublicSchema }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: PublicSchema },
  EnumName extends PublicEnumNameOrOptions extends { schema: PublicSchema }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: PublicSchema }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "report_generated",
        "report_viewed",
        "task_created",
        "task_completed",
        "project_created",
        "project_updated",
        "time_logged",
        "metric_updated",
        "health_calculated",
        "user_login",
        "user_action",
      ],
      approval_content_type: [
        "creative",
        "copy",
        "post",
        "landing_page",
        "email",
        "other",
      ],
      approval_status: [
        "pending",
        "approved",
        "rejected",
        "revision",
        "expired",
      ],
      churn_risk_level: ["low", "medium", "high", "critical"],
      report_status: ["draft", "generated", "sent", "viewed"],
      report_type: ["weekly", "monthly", "quarterly", "custom"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: [
        "backlog",
        "todo",
        "in_progress",
        "review",
        "done",
        "cancelled",
      ],
      user_role: ["KYRIE_ADMIN", "KYRIE_TEAM", "CLIENT_OWNER", "CLIENT_VIEWER"],
    },
  },
} as const
