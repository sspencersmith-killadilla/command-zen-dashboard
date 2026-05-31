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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          parts: Json
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parts: Json
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parts?: Json
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_cards: {
        Row: {
          back: string
          created_at: string
          deck_id: string
          due_at: string
          ease: number
          front: string
          id: string
          interval_days: number
          last_reviewed_at: string | null
          reps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          back: string
          created_at?: string
          deck_id: string
          due_at?: string
          ease?: number
          front: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          reps?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          back?: string
          created_at?: string
          deck_id?: string
          due_at?: string
          ease?: number
          front?: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          reps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_decks: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          source: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          source?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          source?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          actual_minutes: number | null
          assignment_ref: string | null
          completed: boolean
          course_id: string | null
          created_at: string
          ended_at: string | null
          id: string
          notes: string | null
          planned_minutes: number
          started_at: string
          user_id: string
        }
        Insert: {
          actual_minutes?: number | null
          assignment_ref?: string | null
          completed?: boolean
          course_id?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          planned_minutes?: number
          started_at?: string
          user_id: string
        }
        Update: {
          actual_minutes?: number | null
          assignment_ref?: string | null
          completed?: boolean
          course_id?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          planned_minutes?: number
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          refresh_token: string
          scope: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          refresh_token: string
          scope: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          refresh_token?: string
          scope?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_links: {
        Row: {
          created_at: string
          id: string
          mode: string
          parent_email: string
          parent_name: string
          paused: boolean
          revoked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mode?: string
          parent_email: string
          parent_name?: string
          paused?: boolean
          revoked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mode?: string
          parent_email?: string
          parent_name?: string
          paused?: boolean
          revoked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_share_audit: {
        Row: {
          created_at: string
          id: string
          kind: string
          parent_link_id: string
          payload_preview: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          parent_link_id: string
          payload_preview?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          parent_link_id?: string
          payload_preview?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_share_audit_parent_link_id_fkey"
            columns: ["parent_link_id"]
            isOneToOne: false
            referencedRelation: "parent_links"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_share_tokens: {
        Row: {
          created_at: string
          expires_at: string
          kind: string
          parent_link_id: string
          payload: Json
          token: string
          user_id: string
          viewed_at: string | null
          week_of: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          kind?: string
          parent_link_id: string
          payload?: Json
          token: string
          user_id: string
          viewed_at?: string | null
          week_of: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          kind?: string
          parent_link_id?: string
          payload?: Json
          token?: string
          user_id?: string
          viewed_at?: string | null
          week_of?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_share_tokens_parent_link_id_fkey"
            columns: ["parent_link_id"]
            isOneToOne: false
            referencedRelation: "parent_links"
            referencedColumns: ["id"]
          },
        ]
      }
      study_blocks: {
        Row: {
          completed_at: string | null
          course_id: string | null
          created_at: string
          ends_at: string
          gcal_event_id: string | null
          id: string
          notes: string | null
          source: string
          starts_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          ends_at: string
          gcal_event_id?: string | null
          id?: string
          notes?: string | null
          source?: string
          starts_at: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          ends_at?: string
          gcal_event_id?: string | null
          id?: string
          notes?: string | null
          source?: string
          starts_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_avatar: {
        Row: {
          background: string
          body_type: string
          brow_style: string
          created_at: string
          earrings: string
          equipped: Json
          eye_color: string
          eye_style: string
          facial_hair: string
          freckles: string
          glasses: string
          hair_color: string
          hair_style: string
          id: string
          lip_color: string
          mastery_progress: Json
          mouth_style: string
          on_time_count: number
          outfit_base: string
          outfit_color: string
          skin_tone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          background?: string
          body_type?: string
          brow_style?: string
          created_at?: string
          earrings?: string
          equipped?: Json
          eye_color?: string
          eye_style?: string
          facial_hair?: string
          freckles?: string
          glasses?: string
          hair_color?: string
          hair_style?: string
          id?: string
          lip_color?: string
          mastery_progress?: Json
          mouth_style?: string
          on_time_count?: number
          outfit_base?: string
          outfit_color?: string
          skin_tone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          background?: string
          body_type?: string
          brow_style?: string
          created_at?: string
          earrings?: string
          equipped?: Json
          eye_color?: string
          eye_style?: string
          facial_hair?: string
          freckles?: string
          glasses?: string
          hair_color?: string
          hair_style?: string
          id?: string
          lip_color?: string
          mastery_progress?: Json
          mouth_style?: string
          on_time_count?: number
          outfit_base?: string
          outfit_color?: string
          skin_tone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_configs: {
        Row: {
          canvas_api_token: string
          canvas_domain: string
          canvas_feed_url: string
          companion_id: string
          companion_memory: Json
          courses: Json
          created_at: string
          display_name: string
          google_connection_id: string | null
          id: string
          notifications_enabled: boolean
          onboarded: boolean
          plain_mode: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          canvas_api_token?: string
          canvas_domain?: string
          canvas_feed_url?: string
          companion_id?: string
          companion_memory?: Json
          courses?: Json
          created_at?: string
          display_name?: string
          google_connection_id?: string | null
          id?: string
          notifications_enabled?: boolean
          onboarded?: boolean
          plain_mode?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          canvas_api_token?: string
          canvas_domain?: string
          canvas_feed_url?: string
          companion_id?: string
          companion_memory?: Json
          courses?: Json
          created_at?: string
          display_name?: string
          google_connection_id?: string | null
          id?: string
          notifications_enabled?: boolean
          onboarded?: boolean
          plain_mode?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_inventory: {
        Row: {
          earned_at: string
          id: string
          item_id: string
          source: string
          user_id: string
        }
        Insert: {
          earned_at?: string
          id?: string
          item_id: string
          source?: string
          user_id: string
        }
        Update: {
          earned_at?: string
          id?: string
          item_id?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_recaps: {
        Row: {
          created_at: string
          id: string
          parent_note: string | null
          parent_send_status: string
          summary: Json
          updated_at: string
          user_id: string
          viewed_at: string | null
          week_of: string
          xp_awarded: number
        }
        Insert: {
          created_at?: string
          id?: string
          parent_note?: string | null
          parent_send_status?: string
          summary?: Json
          updated_at?: string
          user_id: string
          viewed_at?: string | null
          week_of: string
          xp_awarded?: number
        }
        Update: {
          created_at?: string
          id?: string
          parent_note?: string | null
          parent_send_status?: string
          summary?: Json
          updated_at?: string
          user_id?: string
          viewed_at?: string | null
          week_of?: string
          xp_awarded?: number
        }
        Relationships: []
      }
      weekly_reflections: {
        Row: {
          blockers: string | null
          created_at: string
          goals: Json
          id: string
          slips: string | null
          updated_at: string
          user_id: string
          week_of: string
          wins: string | null
        }
        Insert: {
          blockers?: string | null
          created_at?: string
          goals?: Json
          id?: string
          slips?: string | null
          updated_at?: string
          user_id: string
          week_of: string
          wins?: string | null
        }
        Update: {
          blockers?: string | null
          created_at?: string
          goals?: Json
          id?: string
          slips?: string | null
          updated_at?: string
          user_id?: string
          week_of?: string
          wins?: string | null
        }
        Relationships: []
      }
      wellness_logs: {
        Row: {
          created_at: string
          id: string
          log_date: string
          meals: Json
          mood: number | null
          movement_minutes: number
          movement_type: string | null
          notes: string | null
          sleep_hours: number | null
          updated_at: string
          user_id: string
          water_cups: number
        }
        Insert: {
          created_at?: string
          id?: string
          log_date: string
          meals?: Json
          mood?: number | null
          movement_minutes?: number
          movement_type?: string | null
          notes?: string | null
          sleep_hours?: number | null
          updated_at?: string
          user_id: string
          water_cups?: number
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          meals?: Json
          mood?: number | null
          movement_minutes?: number
          movement_type?: string | null
          notes?: string | null
          sleep_hours?: number | null
          updated_at?: string
          user_id?: string
          water_cups?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
