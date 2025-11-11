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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      documents: {
        Row: {
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          updated_at: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          updated_at?: string
          uploaded_at?: string
          user_id?: string
        }
        Update: {
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          updated_at?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topic_likes: {
        Row: {
          created_at: string
          id: string
          topic_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          topic_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_topic_likes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          article_slug: string | null
          category_id: string | null
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          article_slug?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          article_slug?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      google_drive_articles: {
        Row: {
          ai_thumbnail: string | null
          content: string | null
          created_time: string | null
          file_id: string
          id: string
          mime_type: string
          modified_time: string | null
          name: string
          synced_at: string
          thumbnail_link: string | null
          web_view_link: string | null
        }
        Insert: {
          ai_thumbnail?: string | null
          content?: string | null
          created_time?: string | null
          file_id: string
          id?: string
          mime_type: string
          modified_time?: string | null
          name: string
          synced_at?: string
          thumbnail_link?: string | null
          web_view_link?: string | null
        }
        Update: {
          ai_thumbnail?: string | null
          content?: string | null
          created_time?: string | null
          file_id?: string
          id?: string
          mime_type?: string
          modified_time?: string | null
          name?: string
          synced_at?: string
          thumbnail_link?: string | null
          web_view_link?: string | null
        }
        Relationships: []
      }
      memories: {
        Row: {
          caption: string | null
          created_at: string
          file_type: string | null
          folder_id: string | null
          id: string
          image_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_type?: string | null
          folder_id?: string | null
          id?: string
          image_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_type?: string | null
          folder_id?: string | null
          id?: string
          image_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memories_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "memory_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_articles: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_events: {
        Row: {
          confidence_score: number | null
          created_at: string
          end_datetime: string
          id: string
          import_id: string
          keywords: string[] | null
          message_count: number | null
          start_datetime: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          end_datetime: string
          id?: string
          import_id: string
          keywords?: string[] | null
          message_count?: number | null
          start_datetime: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          end_datetime?: string
          id?: string
          import_id?: string
          keywords?: string[] | null
          message_count?: number | null
          start_datetime?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_events_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_imports: {
        Row: {
          created_at: string
          date_format: string | null
          file_size: number
          filename: string
          id: string
          status: string
          timezone: string | null
          total_messages: number | null
          updated_at: string
          upload_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_format?: string | null
          file_size: number
          filename: string
          id?: string
          status?: string
          timezone?: string | null
          total_messages?: number | null
          updated_at?: string
          upload_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_format?: string | null
          file_size?: number
          filename?: string
          id?: string
          status?: string
          timezone?: string | null
          total_messages?: number | null
          updated_at?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          attachments: string[] | null
          author: string
          created_at: string
          datetime_iso: string
          event_id: string | null
          id: string
          import_id: string
          is_noise: boolean | null
          message_id: string
          raw_line: string
          text: string
        }
        Insert: {
          attachments?: string[] | null
          author: string
          created_at?: string
          datetime_iso: string
          event_id?: string | null
          id?: string
          import_id: string
          is_noise?: boolean | null
          message_id: string
          raw_line: string
          text: string
        }
        Update: {
          attachments?: string[] | null
          author?: string
          created_at?: string
          datetime_iso?: string
          event_id?: string | null
          id?: string
          import_id?: string
          is_noise?: boolean | null
          message_id?: string
          raw_line?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_imports"
            referencedColumns: ["id"]
          },
        ]
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
