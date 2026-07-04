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
      clientes: {
        Row: {
          chave_pix: string
          cpf: string
          created_at: string
          email: string
          id: string
          nome: string
          telefone: string
          updated_at: string
        }
        Insert: {
          chave_pix: string
          cpf: string
          created_at?: string
          email: string
          id?: string
          nome: string
          telefone: string
          updated_at?: string
        }
        Update: {
          chave_pix?: string
          cpf?: string
          created_at?: string
          email?: string
          id?: string
          nome?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
      historico_status: {
        Row: {
          alterado_por: string | null
          created_at: string
          id: string
          observacao: string | null
          operacao_id: string
          status_anterior: Database["public"]["Enums"]["operacao_status"] | null
          status_novo: Database["public"]["Enums"]["operacao_status"]
        }
        Insert: {
          alterado_por?: string | null
          created_at?: string
          id?: string
          observacao?: string | null
          operacao_id: string
          status_anterior?:
            | Database["public"]["Enums"]["operacao_status"]
            | null
          status_novo: Database["public"]["Enums"]["operacao_status"]
        }
        Update: {
          alterado_por?: string | null
          created_at?: string
          id?: string
          observacao?: string | null
          operacao_id?: string
          status_anterior?:
            | Database["public"]["Enums"]["operacao_status"]
            | null
          status_novo?: Database["public"]["Enums"]["operacao_status"]
        }
        Relationships: [
          {
            foreignKeyName: "historico_status_operacao_id_fkey"
            columns: ["operacao_id"]
            isOneToOne: false
            referencedRelation: "operacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      operacoes: {
        Row: {
          chave_pix: string
          cliente_id: string
          created_at: string
          id: string
          ip_address: string | null
          parcelas: number
          payment_id: string | null
          status: Database["public"]["Enums"]["operacao_status"]
          status_detail: string | null
          updated_at: string
          user_agent: string | null
          valor_cobrado: number
          valor_solicitado: number
        }
        Insert: {
          chave_pix: string
          cliente_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          parcelas: number
          payment_id?: string | null
          status?: Database["public"]["Enums"]["operacao_status"]
          status_detail?: string | null
          updated_at?: string
          user_agent?: string | null
          valor_cobrado: number
          valor_solicitado: number
        }
        Update: {
          chave_pix?: string
          cliente_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          parcelas?: number
          payment_id?: string | null
          status?: Database["public"]["Enums"]["operacao_status"]
          status_detail?: string | null
          updated_at?: string
          user_agent?: string | null
          valor_cobrado?: number
          valor_solicitado?: number
        }
        Relationships: [
          {
            foreignKeyName: "operacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      operacoes_vendas: {
        Row: {
          aceite_termos: boolean
          chave_pix: string
          cpf: string
          created_at: string
          email: string
          id: string
          ip_address: string | null
          nome: string
          parcelas: number
          payment_id: string | null
          status: string
          status_detail: string | null
          telefone: string
          user_agent: string | null
          valor_total_cartao: number | null
          valor_venda: number
        }
        Insert: {
          aceite_termos?: boolean
          chave_pix: string
          cpf: string
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          nome: string
          parcelas: number
          payment_id?: string | null
          status?: string
          status_detail?: string | null
          telefone: string
          user_agent?: string | null
          valor_total_cartao?: number | null
          valor_venda: number
        }
        Update: {
          aceite_termos?: boolean
          chave_pix?: string
          cpf?: string
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          nome?: string
          parcelas?: number
          payment_id?: string | null
          status?: string
          status_detail?: string | null
          telefone?: string
          user_agent?: string | null
          valor_total_cartao?: number | null
          valor_venda?: number
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      operacao_status:
        | "AGUARDANDO_ANALISE"
        | "PIX_ENVIADO"
        | "FINALIZADO"
        | "CANCELADO"
        | "APROVADO"
        | "PENDENTE"
        | "RECUSADO"
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
      app_role: ["admin", "user"],
      operacao_status: [
        "AGUARDANDO_ANALISE",
        "PIX_ENVIADO",
        "FINALIZADO",
        "CANCELADO",
        "APROVADO",
        "PENDENTE",
        "RECUSADO",
      ],
    },
  },
} as const
