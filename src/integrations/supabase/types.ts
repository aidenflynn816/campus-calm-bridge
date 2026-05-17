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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          counselor_id: string
          created_at: string
          date: string
          google_event_id: string | null
          id: string
          reason: string | null
          status: string
          student_id: string
          time: string
          updated_at: string
        }
        Insert: {
          counselor_id: string
          created_at?: string
          date: string
          google_event_id?: string | null
          id?: string
          reason?: string | null
          status?: string
          student_id: string
          time: string
          updated_at?: string
        }
        Update: {
          counselor_id?: string
          created_at?: string
          date?: string
          google_event_id?: string | null
          id?: string
          reason?: string | null
          status?: string
          student_id?: string
          time?: string
          updated_at?: string
        }
        Relationships: []
      }
      counselor_availability: {
        Row: {
          counselor_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
          updated_at: string
        }
        Insert: {
          counselor_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
          updated_at?: string
        }
        Update: {
          counselor_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_counselor_availability_counselor"
            columns: ["counselor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      counselor_students: {
        Row: {
          counselor_id: string
          created_at: string
          id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          counselor_id: string
          created_at?: string
          id?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          counselor_id?: string
          created_at?: string
          id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_sharing_requests: {
        Row: {
          counselor_id: string
          created_at: string
          id: string
          message: string | null
          request_type: string
          responded_at: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          counselor_id: string
          created_at?: string
          id?: string
          message?: string | null
          request_type?: string
          responded_at?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          counselor_id?: string
          created_at?: string
          id?: string
          message?: string | null
          request_type?: string
          responded_at?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          created_at: string
          id: string
          recipient_email: string
          recipient_id: string
          sender_name: string | null
          sent_at: string | null
          thread_key: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_email: string
          recipient_id: string
          sender_name?: string | null
          sent_at?: string | null
          thread_key?: string | null
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_email?: string
          recipient_id?: string
          sender_name?: string | null
          sent_at?: string | null
          thread_key?: string | null
          type?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      mood_check_ins: {
        Row: {
          created_at: string
          daily_issues: string[] | null
          id: string
          mood_emoji: string
          mood_rating: number
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_issues?: string[] | null
          id?: string
          mood_emoji: string
          mood_rating: number
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_issues?: string[] | null
          id?: string
          mood_emoji?: string
          mood_rating?: number
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          calendar_connected: boolean | null
          calendly_url: string | null
          created_at: string
          full_name: string | null
          id: string
          mood_data_shared: boolean
          mood_reminder_enabled: boolean | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          calendar_connected?: boolean | null
          calendly_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          mood_data_shared?: boolean
          mood_reminder_enabled?: boolean | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          calendar_connected?: boolean | null
          calendly_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          mood_data_shared?: boolean
          mood_reminder_enabled?: boolean | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          content: string | null
          counselor_id: string
          created_at: string
          description: string | null
          featured: boolean | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          tags: string[] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          category: string
          content?: string | null
          counselor_id: string
          created_at?: string
          description?: string | null
          featured?: boolean | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string | null
          counselor_id?: string
          created_at?: string
          description?: string | null
          featured?: boolean | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      typing_status: {
        Row: {
          chat_with_user_id: string
          id: string
          is_typing: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_with_user_id: string
          id?: string
          is_typing?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_with_user_id?: string
          id?: string
          is_typing?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_google_tokens: {
        Row: {
          created_at: string
          google_access_token: string | null
          google_calendar_id: string | null
          google_refresh_token: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          google_access_token?: string | null
          google_calendar_id?: string | null
          google_refresh_token?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          google_access_token?: string | null
          google_calendar_id?: string | null
          google_refresh_token?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: { Args: never; Returns: string }
      get_user_google_token_secure: {
        Args: { target_user_id: string }
        Returns: {
          access_token: string
          calendar_id: string
          refresh_token: string
        }[]
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
