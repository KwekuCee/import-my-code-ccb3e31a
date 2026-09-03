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
      admin_settings: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          is_global: boolean | null
          setting_key: string
          setting_type: string | null
          setting_value: Json
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          is_global?: boolean | null
          setting_key: string
          setting_type?: string | null
          setting_value: Json
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          is_global?: boolean | null
          setting_key?: string
          setting_type?: string | null
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          church_id: string | null
          created_at: string
          id: string
          message: string
          sender_id: string | null
          sender_name: string | null
          target_audience: string
          title: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          id?: string
          message: string
          sender_id?: string | null
          sender_name?: string | null
          target_audience?: string
          title: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          id?: string
          message?: string
          sender_id?: string | null
          sender_name?: string | null
          target_audience?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          attendance_date: string
          check_in_method: string | null
          checked_in_at: string
          checked_in_time: string | null
          church_id: string | null
          church_name: string | null
          id: string
          leader_name: string | null
          member_id: string | null
          member_name: string
          member_role: string | null
          pcf_name: string | null
          service_type: string
          service_type_id: string | null
          status: string | null
          verified_by: string | null
        }
        Insert: {
          attendance_date?: string
          check_in_method?: string | null
          checked_in_at?: string
          checked_in_time?: string | null
          church_id?: string | null
          church_name?: string | null
          id?: string
          leader_name?: string | null
          member_id?: string | null
          member_name: string
          member_role?: string | null
          pcf_name?: string | null
          service_type: string
          service_type_id?: string | null
          status?: string | null
          verified_by?: string | null
        }
        Update: {
          attendance_date?: string
          check_in_method?: string | null
          checked_in_at?: string
          checked_in_time?: string | null
          church_id?: string | null
          church_name?: string | null
          id?: string
          leader_name?: string | null
          member_id?: string | null
          member_name?: string
          member_role?: string | null
          pcf_name?: string | null
          service_type?: string
          service_type_id?: string | null
          status?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor: string
          category: string | null
          church_id: string | null
          church_name: string | null
          created_at: string
          icon: string | null
          id: number
        }
        Insert: {
          action: string
          actor: string
          category?: string | null
          church_id?: string | null
          church_name?: string | null
          created_at?: string
          icon?: string | null
          id?: number
        }
        Update: {
          action?: string
          actor?: string
          category?: string | null
          church_id?: string | null
          church_name?: string | null
          created_at?: string
          icon?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      church_admin_accounts: {
        Row: {
          admin_email: string
          admin_name: string
          admin_phone: string | null
          church_id: string | null
          church_name: string
          created_at: string
          id: string
          joined_date: string | null
          password: string | null
          role: string | null
          status: string | null
          zone: string | null
        }
        Insert: {
          admin_email: string
          admin_name: string
          admin_phone?: string | null
          church_id?: string | null
          church_name: string
          created_at?: string
          id: string
          joined_date?: string | null
          password?: string | null
          role?: string | null
          status?: string | null
          zone?: string | null
        }
        Update: {
          admin_email?: string
          admin_name?: string
          admin_phone?: string | null
          church_id?: string | null
          church_name?: string
          created_at?: string
          id?: string
          joined_date?: string | null
          password?: string | null
          role?: string | null
          status?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "church_admin_accounts_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      churches: {
        Row: {
          created_at: string
          id: string
          members_count: number
          name: string
          pastor_name: string
          status: string
          updated_at: string
          zone: string
        }
        Insert: {
          created_at?: string
          id?: string
          members_count?: number
          name: string
          pastor_name?: string
          status?: string
          updated_at?: string
          zone?: string
        }
        Update: {
          created_at?: string
          id?: string
          members_count?: number
          name?: string
          pastor_name?: string
          status?: string
          updated_at?: string
          zone?: string
        }
        Relationships: []
      }
      leaders: {
        Row: {
          cell_or_pcf_name: string | null
          church_id: string | null
          church_name: string | null
          contact: string | null
          created_at: string
          dob: string | null
          downstream_count: number
          email: string | null
          full_name: string
          id: string
          is_appointed: boolean | null
          leader_type: Database["public"]["Enums"]["leader_type_enum"]
          location: string | null
          parent_leader_id: string | null
          promotion_status: Database["public"]["Enums"]["promotion_status_enum"]
          updated_at: string
        }
        Insert: {
          cell_or_pcf_name?: string | null
          church_id?: string | null
          church_name?: string | null
          contact?: string | null
          created_at?: string
          dob?: string | null
          downstream_count?: number
          email?: string | null
          full_name: string
          id?: string
          is_appointed?: boolean | null
          leader_type?: Database["public"]["Enums"]["leader_type_enum"]
          location?: string | null
          parent_leader_id?: string | null
          promotion_status?: Database["public"]["Enums"]["promotion_status_enum"]
          updated_at?: string
        }
        Update: {
          cell_or_pcf_name?: string | null
          church_id?: string | null
          church_name?: string | null
          contact?: string | null
          created_at?: string
          dob?: string | null
          downstream_count?: number
          email?: string | null
          full_name?: string
          id?: string
          is_appointed?: boolean | null
          leader_type?: Database["public"]["Enums"]["leader_type_enum"]
          location?: string | null
          parent_leader_id?: string | null
          promotion_status?: Database["public"]["Enums"]["promotion_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaders_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaders_parent_leader_id_fkey"
            columns: ["parent_leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          church_id: string | null
          church_name: string | null
          created_at: string
          dob: string | null
          education_level: string | null
          email: string | null
          foundation_class: number
          full_name: string
          gender: string | null
          id: string
          invited_by_leader_id: string | null
          invited_by_name: string | null
          join_date: string
          location: string | null
          occupation: string | null
          phone: string | null
          role: string | null
          service_count: number
          status: Database["public"]["Enums"]["member_status_enum"]
          updated_at: string
        }
        Insert: {
          church_id?: string | null
          church_name?: string | null
          created_at?: string
          dob?: string | null
          education_level?: string | null
          email?: string | null
          foundation_class?: number
          full_name: string
          gender?: string | null
          id: string
          invited_by_leader_id?: string | null
          invited_by_name?: string | null
          join_date?: string
          location?: string | null
          occupation?: string | null
          phone?: string | null
          role?: string | null
          service_count?: number
          status?: Database["public"]["Enums"]["member_status_enum"]
          updated_at?: string
        }
        Update: {
          church_id?: string | null
          church_name?: string | null
          created_at?: string
          dob?: string | null
          education_level?: string | null
          email?: string | null
          foundation_class?: number
          full_name?: string
          gender?: string | null
          id?: string
          invited_by_leader_id?: string | null
          invited_by_name?: string | null
          join_date?: string
          location?: string | null
          occupation?: string | null
          phone?: string | null
          role?: string | null
          service_count?: number
          status?: Database["public"]["Enums"]["member_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_invited_by_leader_id_fkey"
            columns: ["invited_by_leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_queue: {
        Row: {
          church_id: string | null
          current_leader_role: Database["public"]["Enums"]["leader_type_enum"]
          flagged_at: string
          id: string
          leader_id: string | null
          reason: string
          target_role: Database["public"]["Enums"]["leader_type_enum"]
        }
        Insert: {
          church_id?: string | null
          current_leader_role: Database["public"]["Enums"]["leader_type_enum"]
          flagged_at?: string
          id?: string
          leader_id?: string | null
          reason: string
          target_role: Database["public"]["Enums"]["leader_type_enum"]
        }
        Update: {
          church_id?: string | null
          current_leader_role?: Database["public"]["Enums"]["leader_type_enum"]
          flagged_at?: string
          id?: string
          leader_id?: string | null
          reason?: string
          target_role?: Database["public"]["Enums"]["leader_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "promotion_queue_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_queue_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_used: boolean | null
          member_id: string | null
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_used?: boolean | null
          member_id?: string | null
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean | null
          member_id?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_tokens_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          church_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_global: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_types_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          admin_verified: boolean | null
          auth_user_id: string | null
          avatar_url: string | null
          church_id: string | null
          church_name: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_church_admin: boolean | null
          password_hash: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at: string
          username: string
          zone: string | null
        }
        Insert: {
          admin_verified?: boolean | null
          auth_user_id?: string | null
          avatar_url?: string | null
          church_id?: string | null
          church_name?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_church_admin?: boolean | null
          password_hash: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
          username: string
          zone?: string | null
        }
        Update: {
          admin_verified?: boolean | null
          auth_user_id?: string | null
          avatar_url?: string | null
          church_id?: string | null
          church_name?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_church_admin?: boolean | null
          password_hash?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
          username?: string
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_leader_promotion: {
        Args: { p_promotion_id: string }
        Returns: boolean
      }
      delete_church_cascade: { Args: { p_church_id: string }; Returns: boolean }
      delete_leader_cascade: { Args: { p_leader_id: string }; Returns: boolean }
      delete_member_cascade: { Args: { p_member_id: string }; Returns: boolean }
      verify_user_login: {
        Args: {
          p_church_name?: string
          p_identifier: string
          p_password: string
          p_role?: string
        }
        Returns: Json
      }
    }
    Enums: {
      leader_type_enum:
        | "BSCT"
        | "Cell Leader"
        | "PCF Leader"
        | "Church Coordinator"
      member_status_enum: "First Timer" | "General Member" | "Alumni"
      promotion_status_enum: "None" | "Flagged" | "Confirmed"
      user_role_enum: "Superadmin" | "Church Admin" | "Leader" | "Usher"
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
      leader_type_enum: [
        "BSCT",
        "Cell Leader",
        "PCF Leader",
        "Church Coordinator",
      ],
      member_status_enum: ["First Timer", "General Member", "Alumni"],
      promotion_status_enum: ["None", "Flagged", "Confirmed"],
      user_role_enum: ["Superadmin", "Church Admin", "Leader", "Usher"],
    },
  },
} as const
