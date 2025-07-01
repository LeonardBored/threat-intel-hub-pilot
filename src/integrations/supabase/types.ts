export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      iocs: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          description: string | null
          first_seen: string | null
          id: string
          indicator: string
          is_active: boolean | null
          last_seen: string | null
          source: string | null
          tags: string[] | null
          threat_level: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          first_seen?: string | null
          id?: string
          indicator: string
          is_active?: boolean | null
          last_seen?: string | null
          source?: string | null
          tags?: string[] | null
          threat_level: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          first_seen?: string | null
          id?: string
          indicator?: string
          is_active?: boolean | null
          last_seen?: string | null
          source?: string | null
          tags?: string[] | null
          threat_level?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          request_count: number | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          request_count?: number | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          request_count?: number | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      scan_history: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          result: Json | null
          scan_duration: number | null
          scan_type: string
          status: string
          target: string
          target_type: string
          threat_score: number | null
          updated_at: string | null
          user_id: string | null
          verdict: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          result?: Json | null
          scan_duration?: number | null
          scan_type: string
          status: string
          target: string
          target_type: string
          threat_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          verdict?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          result?: Json | null
          scan_duration?: number | null
          scan_type?: string
          status?: string
          target?: string
          target_type?: string
          threat_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          verdict?: string | null
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          actual_impact: string | null
          affected_systems: string[] | null
          assignee: string | null
          category: string | null
          created_at: string | null
          description: string | null
          estimated_impact: string | null
          id: string
          incident_date: string | null
          iocs_related: string[] | null
          lessons_learned: string | null
          priority: number | null
          reporter: string | null
          resolution_notes: string | null
          resolved_date: string | null
          severity: string
          status: string
          tags: string[] | null
          timeline: Json | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_impact?: string | null
          affected_systems?: string[] | null
          assignee?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimated_impact?: string | null
          id?: string
          incident_date?: string | null
          iocs_related?: string[] | null
          lessons_learned?: string | null
          priority?: number | null
          reporter?: string | null
          resolution_notes?: string | null
          resolved_date?: string | null
          severity: string
          status: string
          tags?: string[] | null
          timeline?: Json | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_impact?: string | null
          affected_systems?: string[] | null
          assignee?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimated_impact?: string | null
          id?: string
          incident_date?: string | null
          iocs_related?: string[] | null
          lessons_learned?: string | null
          priority?: number | null
          reporter?: string | null
          resolution_notes?: string | null
          resolved_date?: string | null
          severity?: string
          status?: string
          tags?: string[] | null
          timeline?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      watchlists: {
        Row: {
          alert_threshold: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          indicators: string[]
          is_active: boolean | null
          last_match: string | null
          match_count: number | null
          name: string
          notification_settings: Json | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          alert_threshold?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          indicators: string[]
          is_active?: boolean | null
          last_match?: string | null
          match_count?: number | null
          name: string
          notification_settings?: Json | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          alert_threshold?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          indicators?: string[]
          is_active?: boolean | null
          last_match?: string | null
          match_count?: number | null
          name?: string
          notification_settings?: Json | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_user_id: string
          p_endpoint: string
          p_limit?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
