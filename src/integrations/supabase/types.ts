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
      analytics_events: {
        Row: {
          confidence: string | null
          created_at: string
          id: string
          lang: string
          question: string
          retrieved_count: number | null
          top_standard: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string
          id?: string
          lang?: string
          question: string
          retrieved_count?: number | null
          top_standard?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string
          id?: string
          lang?: string
          question?: string
          retrieved_count?: number | null
          top_standard?: string | null
        }
        Relationships: []
      }
      chunks: {
        Row: {
          chunk_text: string
          clause_ref: string | null
          created_at: string
          document_id: string
          embedding: string | null
          heading: string | null
          id: string
          language: string | null
          page: number | null
        }
        Insert: {
          chunk_text: string
          clause_ref?: string | null
          created_at?: string
          document_id: string
          embedding?: string | null
          heading?: string | null
          id?: string
          language?: string | null
          page?: number | null
        }
        Update: {
          chunk_text?: string
          clause_ref?: string | null
          created_at?: string
          document_id?: string
          embedding?: string | null
          heading?: string | null
          id?: string
          language?: string | null
          page?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          language: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          data_origin: string | null
          division: string | null
          doc_key: string | null
          enforcement: string | null
          full_text: string | null
          id: string
          sector: string | null
          source_url: string | null
          standard_number: string
          status: string | null
          summary: string | null
          tags: string[] | null
          title: string
          year: number | null
        }
        Insert: {
          created_at?: string
          data_origin?: string | null
          division?: string | null
          doc_key?: string | null
          enforcement?: string | null
          full_text?: string | null
          id?: string
          sector?: string | null
          source_url?: string | null
          standard_number: string
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          year?: number | null
        }
        Update: {
          created_at?: string
          data_origin?: string | null
          division?: string | null
          doc_key?: string | null
          enforcement?: string | null
          full_text?: string | null
          id?: string
          sector?: string | null
          source_url?: string | null
          standard_number?: string
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          year?: number | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          message_id: string | null
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          rating?: number
        }
        Relationships: []
      }
      labs: {
        Row: {
          city: string | null
          created_at: string
          data_origin: string
          id: string
          lab_key: string | null
          name: string
          recognized_scope: string[] | null
          source_url: string | null
          state: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          data_origin?: string
          id?: string
          lab_key?: string | null
          name: string
          recognized_scope?: string[] | null
          source_url?: string | null
          state?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          data_origin?: string
          id?: string
          lab_key?: string | null
          name?: string
          recognized_scope?: string[] | null
          source_url?: string | null
          state?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          citations: Json | null
          confidence: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          citations?: Json | null
          confidence?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          citations?: Json | null
          confidence?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      products_map: {
        Row: {
          created_at: string
          id: string
          mandatory: boolean | null
          product_category: string | null
          product_keywords: string[]
          scheme_key: string | null
          standard_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          mandatory?: boolean | null
          product_category?: string | null
          product_keywords?: string[]
          scheme_key?: string | null
          standard_number: string
        }
        Update: {
          created_at?: string
          id?: string
          mandatory?: boolean | null
          product_category?: string | null
          product_keywords?: string[]
          scheme_key?: string | null
          standard_number?: string
        }
        Relationships: []
      }
      schemes: {
        Row: {
          created_at: string
          data_origin: string | null
          description: string | null
          documents_required: Json | null
          eligibility: string | null
          id: string
          name: string
          scheme_key: string | null
          short_name: string | null
          source_url: string | null
          steps: Json | null
        }
        Insert: {
          created_at?: string
          data_origin?: string | null
          description?: string | null
          documents_required?: Json | null
          eligibility?: string | null
          id?: string
          name: string
          scheme_key?: string | null
          short_name?: string | null
          source_url?: string | null
          steps?: Json | null
        }
        Update: {
          created_at?: string
          data_origin?: string | null
          description?: string | null
          documents_required?: Json | null
          eligibility?: string | null
          id?: string
          name?: string
          scheme_key?: string | null
          short_name?: string | null
          source_url?: string | null
          steps?: Json | null
        }
        Relationships: []
      }
      standard_tests: {
        Row: {
          clause_ref: string | null
          created_at: string
          data_origin: string
          document_id: string | null
          id: string
          method: string | null
          product_category: string | null
          requirement: string | null
          standard_number: string
          test_name: string
          updated_at: string
        }
        Insert: {
          clause_ref?: string | null
          created_at?: string
          data_origin?: string
          document_id?: string | null
          id?: string
          method?: string | null
          product_category?: string | null
          requirement?: string | null
          standard_number: string
          test_name: string
          updated_at?: string
        }
        Update: {
          clause_ref?: string | null
          created_at?: string
          data_origin?: string
          document_id?: string | null
          id?: string
          method?: string | null
          product_category?: string | null
          requirement?: string | null
          standard_number?: string
          test_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "standard_tests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      log_analytics_event: {
        Args: {
          _confidence?: string
          _lang: string
          _question: string
          _retrieved_count?: number
          _top_standard?: string
        }
        Returns: undefined
      }
      match_chunks: {
        Args: {
          match_count?: number
          query_embedding: string
          query_text: string
        }
        Returns: {
          chunk_text: string
          clause_ref: string
          data_origin: string
          document_id: string
          heading: string
          id: string
          score: number
          source_url: string
          standard_number: string
          title: string
        }[]
      }
      set_chunk_embedding: {
        Args: { _embedding: string; _id: string }
        Returns: undefined
      }
      submit_feedback: {
        Args: { _comment?: string; _message_id?: string; _rating: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
