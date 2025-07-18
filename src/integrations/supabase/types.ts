export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action_type: string
          admin_id: string | null
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          client_id: string | null
          created_at: string | null
          duration_hours: number
          escort_id: string | null
          id: string
          service_type: string
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          booking_date: string
          client_id?: string | null
          created_at?: string | null
          duration_hours: number
          escort_id?: string | null
          id?: string
          service_type: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          booking_date?: string
          client_id?: string | null
          created_at?: string | null
          duration_hours?: number
          escort_id?: string | null
          id?: string
          service_type?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      escort_profiles: {
        Row: {
          age: number | null
          availability_status:
            | Database["public"]["Enums"]["availability_status"]
            | null
          bio: string | null
          category: string | null
          created_at: string | null
          date_of_birth: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          location: string | null
          phone_number: string | null
          profile_image_url: string | null
          rating: number | null
          services_offered: string[] | null
          stage_name: string
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          age?: number | null
          availability_status?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          bio?: string | null
          category?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          rating?: number | null
          services_offered?: string[] | null
          stage_name: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          age?: number | null
          availability_status?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          bio?: string | null
          category?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          rating?: number | null
          services_offered?: string[] | null
          stage_name?: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          status: Database["public"]["Enums"]["membership_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: Database["public"]["Enums"]["membership_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: Database["public"]["Enums"]["membership_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Relationships: []
      }
      mpesa_transactions: {
        Row: {
          amount: number
          checkout_request_id: string | null
          created_at: string | null
          id: string
          merchant_request_id: string | null
          mpesa_receipt_number: string | null
          phone_number: string
          status: string | null
          transaction_date: string | null
          transaction_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          checkout_request_id?: string | null
          created_at?: string | null
          id?: string
          merchant_request_id?: string | null
          mpesa_receipt_number?: string | null
          phone_number: string
          status?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          checkout_request_id?: string | null
          created_at?: string | null
          id?: string
          merchant_request_id?: string | null
          mpesa_receipt_number?: string | null
          phone_number?: string
          status?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_admin: boolean | null
          is_banned: boolean | null
          location: string | null
          phone: string | null
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          is_admin?: boolean | null
          is_banned?: boolean | null
          location?: string | null
          phone?: string | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          is_banned?: boolean | null
          location?: string | null
          phone?: string | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          client_id: string | null
          comment: string | null
          created_at: string | null
          escort_id: string | null
          id: string
          rating: number | null
        }
        Insert: {
          booking_id?: string | null
          client_id?: string | null
          comment?: string | null
          created_at?: string | null
          escort_id?: string | null
          id?: string
          rating?: number | null
        }
        Update: {
          booking_id?: string | null
          client_id?: string | null
          comment?: string | null
          created_at?: string | null
          escort_id?: string | null
          id?: string
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_escort_profiles_admin: {
        Args: { search_term?: string }
        Returns: {
          id: string
          user_id: string
          stage_name: string
          bio: string
          age: number
          category: string
          services_offered: string[]
          hourly_rate: number
          availability_status: Database["public"]["Enums"]["availability_status"]
          location: string
          verified: boolean
          rating: number
          total_reviews: number
          created_at: string
          updated_at: string
          profile_image_url: string
          phone_number: string
          date_of_birth: string
          is_active: boolean
        }[]
      }
    }
    Enums: {
      availability_status: "available" | "busy" | "offline"
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      membership_status: "free" | "paid" | "expired"
      user_role: "client" | "escort" | "admin"
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
      availability_status: ["available", "busy", "offline"],
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
      membership_status: ["free", "paid", "expired"],
      user_role: ["client", "escort", "admin"],
    },
  },
} as const
