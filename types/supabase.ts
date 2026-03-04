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
        ]
      }
      ai_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          model_used: string | null
          role: string
          sources: Json | null
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          model_used?: string | null
          role: string
          sources?: Json | null
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          model_used?: string | null
          role?: string
          sources?: Json | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
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
          ad_spend: number | null
          avg_ticket: number | null
          consultancy_fee: number | null
          conversion_rate: number | null
          created_at: string
          data_source: string | null
          id: string
          leads_generated: number | null
          new_customers: number | null
          organization_id: string
          period_month: number
          period_year: number
          returning_customers: number | null
          revenue: number | null
          roi_multiplier: number | null
          source_reference: string | null
          total_customers: number | null
          updated_at: string
        }
        Insert: {
          ad_spend?: number | null
          avg_ticket?: number | null
          consultancy_fee?: number | null
          conversion_rate?: number | null
          created_at?: string
          data_source?: string | null
          id?: string
          leads_generated?: number | null
          new_customers?: number | null
          organization_id: string
          period_month: number
          period_year: number
          returning_customers?: number | null
          revenue?: number | null
          roi_multiplier?: number | null
          source_reference?: string | null
          total_customers?: number | null
          updated_at?: string
        }
        Update: {
          ad_spend?: number | null
          avg_ticket?: number | null
          consultancy_fee?: number | null
          conversion_rate?: number | null
          created_at?: string
          data_source?: string | null
          id?: string
          leads_generated?: number | null
          new_customers?: number | null
          organization_id?: string
          period_month?: number
          period_year?: number
          returning_customers?: number | null
          revenue?: number | null
          roi_multiplier?: number | null
          source_reference?: string | null
          total_customers?: number | null
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
          calculation_method: string | null
          churn_risk_level:
            | Database["public"]["Enums"]["churn_risk_level"]
            | null
          churn_risk_percentage: number | null
          created_at: string
          engagement_score: number | null
          health_score: number
          id: string
          insights: Json | null
          organization_id: string
          recommendations: Json | null
          results_score: number | null
          satisfaction_score: number | null
        }
        Insert: {
          calculated_at?: string
          calculation_method?: string | null
          churn_risk_level?:
            | Database["public"]["Enums"]["churn_risk_level"]
            | null
          churn_risk_percentage?: number | null
          created_at?: string
          engagement_score?: number | null
          health_score: number
          id?: string
          insights?: Json | null
          organization_id: string
          recommendations?: Json | null
          results_score?: number | null
          satisfaction_score?: number | null
        }
        Update: {
          calculated_at?: string
          calculation_method?: string | null
          churn_risk_level?:
            | Database["public"]["Enums"]["churn_risk_level"]
            | null
          churn_risk_percentage?: number | null
          created_at?: string
          engagement_score?: number | null
          health_score?: number
          id?: string
          insights?: Json | null
          organization_id?: string
          recommendations?: Json | null
          results_score?: number | null
          satisfaction_score?: number | null
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
      inbox_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          item_type: string
          metadata: Json | null
          organization_id: string | null
          priority: string | null
          project_id: string | null
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          item_type: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
          project_id?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          item_type?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
          project_id?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inbox_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbox_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_attachments: {
        Row: {
          card_id: string
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          organization_id: string
          user_id: string | null
        }
        Insert: {
          card_id: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          organization_id: string
          user_id?: string | null
        }
        Update: {
          card_id?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          organization_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_attachments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "capacity_burn_down_view"
            referencedColumns: ["card_id"]
          },
          {
            foreignKeyName: "kanban_attachments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "kanban_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_attachments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_card_comments: {
        Row: {
          card_id: string
          content: string
          created_at: string
          id: string
          organization_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          content: string
          created_at?: string
          id?: string
          organization_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          content?: string
          created_at?: string
          id?: string
          organization_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_card_comments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "capacity_burn_down_view"
            referencedColumns: ["card_id"]
          },
          {
            foreignKeyName: "kanban_card_comments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "kanban_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_card_comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_card_comments_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_card_labels: {
        Row: {
          card_id: string
          created_at: string | null
          label_id: string
        }
        Insert: {
          card_id: string
          created_at?: string | null
          label_id: string
        }
        Update: {
          card_id?: string
          created_at?: string | null
          label_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_card_labels_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "capacity_burn_down_view"
            referencedColumns: ["card_id"]
          },
          {
            foreignKeyName: "kanban_card_labels_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "kanban_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_card_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "kanban_labels"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_card_members: {
        Row: {
          card_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_card_members_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "capacity_burn_down_view"
            referencedColumns: ["card_id"]
          },
          {
            foreignKeyName: "kanban_card_members_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "kanban_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_cards: {
        Row: {
          assigned_to: string | null
          column_id: string
          completed_at: string | null
          confidence: number | null
          cover_color: string | null
          cover_mode: string | null
          cover_size: string | null
          cover_text_theme: string | null
          cover_type: string | null
          cover_value: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          effort: number | null
          end_date: string | null
          estimated_minutes: number | null
          ice_confidence: number | null
          ice_ease: number | null
          ice_effort: number | null
          ice_impact: number | null
          ice_score: number | null
          id: string
          impact: number | null
          is_archived: boolean | null
          is_due_date_completed: boolean | null
          is_pinned: boolean | null
          labels: string[] | null
          organization_id: string
          pinned_at: string | null
          position: number
          priority: string | null
          project_id: string | null
          reminder_at: string | null
          start_date: string | null
          title: string
          trello_card_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          column_id: string
          completed_at?: string | null
          confidence?: number | null
          cover_color?: string | null
          cover_mode?: string | null
          cover_size?: string | null
          cover_text_theme?: string | null
          cover_type?: string | null
          cover_value?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          effort?: number | null
          end_date?: string | null
          estimated_minutes?: number | null
          ice_confidence?: number | null
          ice_ease?: number | null
          ice_effort?: number | null
          ice_impact?: number | null
          ice_score?: number | null
          id?: string
          impact?: number | null
          is_archived?: boolean | null
          is_due_date_completed?: boolean | null
          is_pinned?: boolean | null
          labels?: string[] | null
          organization_id: string
          pinned_at?: string | null
          position?: number
          priority?: string | null
          project_id?: string | null
          reminder_at?: string | null
          start_date?: string | null
          title: string
          trello_card_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          column_id?: string
          completed_at?: string | null
          confidence?: number | null
          cover_color?: string | null
          cover_mode?: string | null
          cover_size?: string | null
          cover_text_theme?: string | null
          cover_type?: string | null
          cover_value?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          effort?: number | null
          end_date?: string | null
          estimated_minutes?: number | null
          ice_confidence?: number | null
          ice_ease?: number | null
          ice_effort?: number | null
          ice_impact?: number | null
          ice_score?: number | null
          id?: string
          impact?: number | null
          is_archived?: boolean | null
          is_due_date_completed?: boolean | null
          is_pinned?: boolean | null
          labels?: string[] | null
          organization_id?: string
          pinned_at?: string | null
          position?: number
          priority?: string | null
          project_id?: string | null
          reminder_at?: string | null
          start_date?: string | null
          title?: string
          trello_card_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_cards_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_cards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_cards_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_checklist_items: {
        Row: {
          checklist_id: string
          completed_at: string | null
          content: string
          created_at: string
          id: string
          is_completed: boolean
          organization_id: string
          position: number
        }
        Insert: {
          checklist_id: string
          completed_at?: string | null
          content: string
          created_at?: string
          id?: string
          is_completed?: boolean
          organization_id: string
          position?: number
        }
        Update: {
          checklist_id?: string
          completed_at?: string | null
          content?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          organization_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "kanban_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "kanban_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_checklist_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_checklists: {
        Row: {
          card_id: string
          created_at: string
          id: string
          organization_id: string
          position: number
          title: string
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          organization_id: string
          position?: number
          title?: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          organization_id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_checklists_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "capacity_burn_down_view"
            referencedColumns: ["card_id"]
          },
          {
            foreignKeyName: "kanban_checklists_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "kanban_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_checklists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_columns: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_default: boolean | null
          is_done_column: boolean | null
          name: string
          organization_id: string | null
          position: number
          template_id: string | null
          updated_at: string | null
          wip_limit: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          is_done_column?: boolean | null
          name: string
          organization_id?: string | null
          position?: number
          template_id?: string | null
          updated_at?: string | null
          wip_limit?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          is_done_column?: boolean | null
          name?: string
          organization_id?: string | null
          position?: number
          template_id?: string | null
          updated_at?: string | null
          wip_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_columns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_columns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_labels: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_labels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_time_entries: {
        Row: {
          card_id: string
          created_at: string | null
          description: string | null
          duration: number | null
          end_time: string | null
          id: string
          start_time: string
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_time_entries_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "capacity_burn_down_view"
            referencedColumns: ["card_id"]
          },
          {
            foreignKeyName: "kanban_time_entries_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "kanban_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          category: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          organization_id: string | null
          read_at: string | null
          sent_email_at: string | null
          sent_whatsapp_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          category?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          organization_id?: string | null
          read_at?: string | null
          sent_email_at?: string | null
          sent_whatsapp_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          category?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          organization_id?: string | null
          read_at?: string | null
          sent_email_at?: string | null
          sent_whatsapp_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          contract_end: string | null
          contract_start: string | null
          created_at: string
          id: string
          industry: string | null
          logo_url: string | null
          metadata: Json | null
          monthly_fee: number | null
          name: string
          slug: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          metadata?: Json | null
          monthly_fee?: number | null
          name: string
          slug: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          metadata?: Json | null
          monthly_fee?: number | null
          name?: string
          slug?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
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
          status: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          status?: string | null
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
          ai_model_used: string | null
          content_markdown: string
          created_at: string
          generated_by: string | null
          generation_time_seconds: number | null
          id: string
          metrics_snapshot: Json | null
          organization_id: string
          period_end: string
          period_start: string
          report_type: Database["public"]["Enums"]["report_type"] | null
          status: Database["public"]["Enums"]["report_status"] | null
          summary: string | null
          title: string
          tokens_used: number | null
          updated_at: string
          viewed_at: string | null
          viewed_by: string | null
        }
        Insert: {
          ai_model_used?: string | null
          content_markdown: string
          created_at?: string
          generated_by?: string | null
          generation_time_seconds?: number | null
          id?: string
          metrics_snapshot?: Json | null
          organization_id: string
          period_end: string
          period_start: string
          report_type?: Database["public"]["Enums"]["report_type"] | null
          status?: Database["public"]["Enums"]["report_status"] | null
          summary?: string | null
          title: string
          tokens_used?: number | null
          updated_at?: string
          viewed_at?: string | null
          viewed_by?: string | null
        }
        Update: {
          ai_model_used?: string | null
          content_markdown?: string
          created_at?: string
          generated_by?: string | null
          generation_time_seconds?: number | null
          id?: string
          metrics_snapshot?: Json | null
          organization_id?: string
          period_end?: string
          period_start?: string
          report_type?: Database["public"]["Enums"]["report_type"] | null
          status?: Database["public"]["Enums"]["report_status"] | null
          summary?: string | null
          title?: string
          tokens_used?: number | null
          updated_at?: string
          viewed_at?: string | null
          viewed_by?: string | null
        }
        Relationships: [
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
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          ice_confidence: number | null
          ice_effort: number | null
          ice_impact: number | null
          ice_score: number | null
          id: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          project_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          ice_confidence?: number | null
          ice_effort?: number | null
          ice_impact?: number | null
          ice_score?: number | null
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          ice_confidence?: number | null
          ice_effort?: number | null
          ice_impact?: number | null
          ice_score?: number | null
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
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
          duration: number | null
          end_time: string | null
          id: string
          is_running: boolean | null
          project_id: string | null
          start_time: string
          task_description: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          is_running?: boolean | null
          project_id?: string | null
          start_time?: string
          task_description?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          is_running?: boolean | null
          project_id?: string | null
          start_time?: string
          task_description?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_embeddings: {
        Row: {
          chunk_index: number
          chunk_text: string
          created_at: string | null
          embedding: string | null
          id: string
          page_id: string
        }
        Insert: {
          chunk_index: number
          chunk_text: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          page_id: string
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_embeddings_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_pages: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          embedding_updated_at: string | null
          icon: string | null
          id: string
          is_pinned: boolean | null
          organization_id: string
          parent_id: string | null
          slug: string
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          embedding_updated_at?: string | null
          icon?: string | null
          id?: string
          is_pinned?: boolean | null
          organization_id: string
          parent_id?: string | null
          slug: string
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          embedding_updated_at?: string | null
          icon?: string | null
          id?: string
          is_pinned?: boolean | null
          organization_id?: string
          parent_id?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_pages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_pages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      capacity_burn_down_view: {
        Row: {
          card_id: string | null
          column_id: string | null
          due_date: string | null
          estimated_minutes: number | null
          organization_id: string | null
          remaining_load_minutes: number | null
          title: string | null
          total_tracked_minutes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_cards_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_cards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_user_org_id: { Args: { user_id: string }; Returns: string }
      is_kyrie_admin: { Args: { user_id: string }; Returns: boolean }
      log_activity: {
        Args: {
          p_description?: string
          p_metadata?: Json
          p_org_id: string
          p_target_id?: string
          p_target_name?: string
          p_target_type?: string
          p_title: string
          p_type: Database["public"]["Enums"]["activity_type"]
          p_user_id: string
          p_user_name: string
        }
        Returns: string
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
        | "comment_added"
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
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
        "comment_added",
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
