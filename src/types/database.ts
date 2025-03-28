// types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      images: {
        Row: {
          id: string
          user_id: string
          type: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          url?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "images_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      headshots: {
        Row: {
          id: string
          user_id: string
          status: string
          prompt: string | null
          generated_image_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status: string
          prompt?: string | null
          generated_image_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          prompt?: string | null
          generated_image_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "headshots_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "headshots_generated_image_id_fkey"
            columns: ["generated_image_id"]
            referencedRelation: "images"
            referencedColumns: ["id"]
          }
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
  }
}