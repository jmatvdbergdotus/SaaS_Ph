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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      billing_records: {
        Row: {
          created_at: string
          id: string
          order_count: number
          payment_method: string | null
          payment_ref: string | null
          payment_status: string
          period_end: string
          period_start: string
          store_id: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_count: number
          payment_method?: string | null
          payment_ref?: string | null
          payment_status?: string
          period_end: string
          period_start: string
          store_id: string
          total_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          order_count?: number
          payment_method?: string | null
          payment_ref?: string | null
          payment_status?: string
          period_end?: string
          period_start?: string
          store_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "billing_records_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string
          current_stock: number
          id: string
          name: string
          restock_threshold: number
          sku: string | null
          store_id: string
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_stock?: number
          id?: string
          name: string
          restock_threshold?: number
          sku?: string | null
          store_id: string
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_stock?: number
          id?: string
          name?: string
          restock_threshold?: number
          sku?: string | null
          store_id?: string
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          channel: string
          created_at: string
          customer_id: string | null
          customer_name: string | null
          id: string
          last_message: string | null
          last_message_at: string | null
          linked_order_id: string | null
          store_id: string
          unread_count: number
        }
        Insert: {
          channel: string
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          linked_order_id?: string | null
          store_id: string
          unread_count?: number
        }
        Update: {
          channel?: string
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          linked_order_id?: string | null
          store_id?: string
          unread_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_linked_order_id_fkey"
            columns: ["linked_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          body: string
          channel: string
          created_at: string
          direction: string
          id: string
          is_read: boolean
          linked_order_id: string | null
          sender_id: string | null
          sender_name: string | null
          store_id: string
          thread_id: string
        }
        Insert: {
          attachments?: Json | null
          body: string
          channel: string
          created_at?: string
          direction: string
          id?: string
          is_read?: boolean
          linked_order_id?: string | null
          sender_id?: string | null
          sender_name?: string | null
          store_id: string
          thread_id: string
        }
        Update: {
          attachments?: Json | null
          body?: string
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          is_read?: boolean
          linked_order_id?: string | null
          sender_id?: string | null
          sender_name?: string | null
          store_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_linked_order_id_fkey"
            columns: ["linked_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          channel: string
          created_at: string
          customer_contact: string | null
          customer_name: string | null
          id: string
          items: Json
          message_thread_id: string | null
          notes: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_verified_at: string | null
          receipt_url: string | null
          shipment_id: string | null
          status: string
          store_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          channel: string
          created_at?: string
          customer_contact?: string | null
          customer_name?: string | null
          id?: string
          items?: Json
          message_thread_id?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_verified_at?: string | null
          receipt_url?: string | null
          shipment_id?: string | null
          status?: string
          store_id: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          customer_contact?: string | null
          customer_name?: string | null
          id?: string
          items?: Json
          message_thread_id?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_verified_at?: string | null
          receipt_url?: string | null
          shipment_id?: string | null
          status?: string
          store_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_shipment"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_thread"
            columns: ["message_thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          order_id: string | null
          provider: string
          reference_number: string | null
          status: string
          store_id: string
          webhook_payload: Json | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          provider: string
          reference_number?: string | null
          status: string
          store_id: string
          webhook_payload?: Json | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          provider?: string
          reference_number?: string | null
          status?: string
          store_id?: string
          webhook_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          created_at: string
          estimated_delivery: string | null
          id: string
          order_id: string
          price: number
          provider: string
          status: string
          tracking_number: string
          updated_at: string
          waybill_url: string | null
        }
        Insert: {
          created_at?: string
          estimated_delivery?: string | null
          id?: string
          order_id: string
          price: number
          provider: string
          status?: string
          tracking_number: string
          updated_at?: string
          waybill_url?: string | null
        }
        Update: {
          created_at?: string
          estimated_delivery?: string | null
          id?: string
          order_id?: string
          price?: number
          provider?: string
          status?: string
          tracking_number?: string
          updated_at?: string
          waybill_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string
          new_stock: number
          order_id: string | null
          previous_stock: number
          quantity: number
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id: string
          new_stock: number
          order_id?: string | null
          previous_stock: number
          quantity: number
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string
          new_stock?: number
          order_id?: string | null
          previous_stock?: number
          quantity?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      store_integrations: {
        Row: {
          connected_at: string | null
          created_at: string
          error_message: string | null
          external_account_id: string | null
          external_account_name: string | null
          id: string
          last_sync_at: string | null
          provider: string
          status: string
          store_id: string
          updated_at: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          error_message?: string | null
          external_account_id?: string | null
          external_account_name?: string | null
          id?: string
          last_sync_at?: string | null
          provider: string
          status?: string
          store_id: string
          updated_at?: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          error_message?: string | null
          external_account_id?: string | null
          external_account_name?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          status?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_integrations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          bir_tin: string | null
          contact_number: string
          created_at: string
          dti_registration_number: string | null
          id: string
          monthly_order_count: number
          name: string
          owner_id: string
          owner_name: string
          plan: string
          trustmark_badge_url: string | null
          trustmark_verified: boolean
          updated_at: string
        }
        Insert: {
          address?: string | null
          bir_tin?: string | null
          contact_number: string
          created_at?: string
          dti_registration_number?: string | null
          id?: string
          monthly_order_count?: number
          name: string
          owner_id: string
          owner_name: string
          plan?: string
          trustmark_badge_url?: string | null
          trustmark_verified?: boolean
          updated_at?: string
        }
        Update: {
          address?: string | null
          bir_tin?: string | null
          contact_number?: string
          created_at?: string
          dti_registration_number?: string | null
          id?: string
          monthly_order_count?: number
          name?: string
          owner_id?: string
          owner_name?: string
          plan?: string
          trustmark_badge_url?: string | null
          trustmark_verified?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_queue: {
        Row: {
          attempts: number
          created_at: string
          entity_id: string
          error: string | null
          event_type: string
          id: string
          last_attempt_at: string | null
          local_timestamp: string
          payload: Json
          store_id: string
          synced: boolean
        }
        Insert: {
          attempts?: number
          created_at?: string
          entity_id: string
          error?: string | null
          event_type: string
          id?: string
          last_attempt_at?: string | null
          local_timestamp: string
          payload: Json
          store_id: string
          synced?: boolean
        }
        Update: {
          attempts?: number
          created_at?: string
          entity_id?: string
          error?: string | null
          event_type?: string
          id?: string
          last_attempt_at?: string | null
          local_timestamp?: string
          payload?: Json
          store_id?: string
          synced?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "sync_queue_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_events: {
        Row: {
          amount: number
          billed: boolean
          created_at: string
          currency: string
          event_type: string
          id: string
          order_id: string
          store_id: string
        }
        Insert: {
          amount: number
          billed?: boolean
          created_at?: string
          currency?: string
          event_type?: string
          id?: string
          order_id: string
          store_id: string
        }
        Update: {
          amount?: number
          billed?: boolean
          created_at?: string
          currency?: string
          event_type?: string
          id?: string
          order_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_events_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          last_login_at: string | null
          phone_number: string | null
          store_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          last_login_at?: string | null
          phone_number?: string | null
          store_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          last_login_at?: string | null
          phone_number?: string | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_store"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_store_profile: {
        Args: {
          p_address?: string
          p_contact_number: string
          p_owner_name: string
          p_store_name: string
        }
        Returns: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
