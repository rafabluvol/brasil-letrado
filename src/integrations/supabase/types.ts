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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_results: {
        Row: {
          acertos: number | null
          ano: string
          created_at: string | null
          exercicio_results: Json | null
          genero: string
          habilidade_bncc: string | null
          id: string
          leitura_realizada: boolean | null
          pontos: number | null
          subtema: string | null
          tema: string
          titulo: string | null
          total_exercicios: number | null
          user_id: string
        }
        Insert: {
          acertos?: number | null
          ano: string
          created_at?: string | null
          exercicio_results?: Json | null
          genero: string
          habilidade_bncc?: string | null
          id?: string
          leitura_realizada?: boolean | null
          pontos?: number | null
          subtema?: string | null
          tema: string
          titulo?: string | null
          total_exercicios?: number | null
          user_id: string
        }
        Update: {
          acertos?: number | null
          ano?: string
          created_at?: string | null
          exercicio_results?: Json | null
          genero?: string
          habilidade_bncc?: string | null
          id?: string
          leitura_realizada?: boolean | null
          pontos?: number | null
          subtema?: string | null
          tema?: string
          titulo?: string | null
          total_exercicios?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ano_escolar: string | null
          created_at: string | null
          id: string
          nivel: number | null
          nome: string | null
          total_atividades: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ano_escolar?: string | null
          created_at?: string | null
          id?: string
          nivel?: number | null
          nome?: string | null
          total_atividades?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ano_escolar?: string | null
          created_at?: string | null
          id?: string
          nivel?: number | null
          nome?: string | null
          total_atividades?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shared_items: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          item_id: string
          item_type: string
          owner_ano: string | null
          owner_id: string
          owner_name: string | null
          recipient_id: string | null
          share_code: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          owner_ano?: string | null
          owner_id: string
          owner_name?: string | null
          recipient_id?: string | null
          share_code: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          owner_ano?: string | null
          owner_id?: string
          owner_name?: string | null
          recipient_id?: string | null
          share_code?: string
          status?: string
        }
        Relationships: []
      }
      student_books: {
        Row: {
          ano: string | null
          autor: string | null
          capa_url: string | null
          created_at: string | null
          genero: string | null
          id: string
          paginas: Json
          resumo: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          ano?: string | null
          autor?: string | null
          capa_url?: string | null
          created_at?: string | null
          genero?: string | null
          id?: string
          paginas?: Json
          resumo?: string | null
          titulo: string
          user_id: string
        }
        Update: {
          ano?: string | null
          autor?: string | null
          capa_url?: string | null
          created_at?: string | null
          genero?: string | null
          id?: string
          paginas?: Json
          resumo?: string | null
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      student_performance: {
        Row: {
          erros_frequentes: Json | null
          generos_recentes: Json | null
          gramatica_acertos: number | null
          gramatica_total: number | null
          id: string
          interpretacao_acertos: number | null
          interpretacao_total: number | null
          leitura_tentativas: number | null
          subtemas_recentes: Json | null
          temas_recentes: Json | null
          updated_at: string | null
          user_id: string
          vocabulario_acertos: number | null
          vocabulario_total: number | null
        }
        Insert: {
          erros_frequentes?: Json | null
          generos_recentes?: Json | null
          gramatica_acertos?: number | null
          gramatica_total?: number | null
          id?: string
          interpretacao_acertos?: number | null
          interpretacao_total?: number | null
          leitura_tentativas?: number | null
          subtemas_recentes?: Json | null
          temas_recentes?: Json | null
          updated_at?: string | null
          user_id: string
          vocabulario_acertos?: number | null
          vocabulario_total?: number | null
        }
        Update: {
          erros_frequentes?: Json | null
          generos_recentes?: Json | null
          gramatica_acertos?: number | null
          gramatica_total?: number | null
          id?: string
          interpretacao_acertos?: number | null
          interpretacao_total?: number | null
          leitura_tentativas?: number | null
          subtemas_recentes?: Json | null
          temas_recentes?: Json | null
          updated_at?: string | null
          user_id?: string
          vocabulario_acertos?: number | null
          vocabulario_total?: number | null
        }
        Relationships: []
      }
      student_productions: {
        Row: {
          ano: string | null
          capa_url: string | null
          cenas: Json
          compartilhavel: boolean
          created_at: string
          genero: string | null
          historia_texto: string | null
          id: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ano?: string | null
          capa_url?: string | null
          cenas?: Json
          compartilhavel?: boolean
          created_at?: string
          genero?: string | null
          historia_texto?: string | null
          id?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: string | null
          capa_url?: string | null
          cenas?: Json
          compartilhavel?: boolean
          created_at?: string
          genero?: string | null
          historia_texto?: string | null
          id?: string
          titulo?: string
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
