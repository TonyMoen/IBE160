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
      user_profile: {
        Row: {
          id: string
          display_name: string | null
          credit_balance: number
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          credit_balance?: number
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          credit_balance?: number
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      song: {
        Row: {
          id: string
          user_id: string
          title: string
          genre: string
          concept: string | null
          original_lyrics: string | null
          optimized_lyrics: string | null
          phonetic_enabled: boolean
          suno_song_id: string | null
          audio_url: string | null
          duration_seconds: number | null
          status: 'generating' | 'completed' | 'failed'
          error_message: string | null
          canvas_url: string | null
          shared_count: number
          is_preview: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          genre: string
          concept?: string | null
          original_lyrics?: string | null
          optimized_lyrics?: string | null
          phonetic_enabled?: boolean
          suno_song_id?: string | null
          audio_url?: string | null
          duration_seconds?: number | null
          status: 'generating' | 'completed' | 'failed'
          error_message?: string | null
          canvas_url?: string | null
          shared_count?: number
          is_preview?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          genre?: string
          concept?: string | null
          original_lyrics?: string | null
          optimized_lyrics?: string | null
          phonetic_enabled?: boolean
          suno_song_id?: string | null
          audio_url?: string | null
          duration_seconds?: number | null
          status?: 'generating' | 'completed' | 'failed'
          error_message?: string | null
          canvas_url?: string | null
          shared_count?: number
          is_preview?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      songs: {
        Row: {
          id: string
          user_id: string
          title: string
          genre: string
          concept: string | null
          original_lyrics: string | null
          optimized_lyrics: string | null
          phonetic_enabled: boolean
          suno_song_id: string | null
          audio_url: string | null
          duration_seconds: number | null
          status: 'generating' | 'completed' | 'failed'
          error_message: string | null
          canvas_url: string | null
          shared_count: number
          is_preview: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          genre: string
          concept?: string | null
          original_lyrics?: string | null
          optimized_lyrics?: string | null
          phonetic_enabled?: boolean
          suno_song_id?: string | null
          audio_url?: string | null
          duration_seconds?: number | null
          status: 'generating' | 'completed' | 'failed'
          error_message?: string | null
          canvas_url?: string | null
          shared_count?: number
          is_preview?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          genre?: string
          concept?: string | null
          original_lyrics?: string | null
          optimized_lyrics?: string | null
          phonetic_enabled?: boolean
          suno_song_id?: string | null
          audio_url?: string | null
          duration_seconds?: number | null
          status?: 'generating' | 'completed' | 'failed'
          error_message?: string | null
          canvas_url?: string | null
          shared_count?: number
          is_preview?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      credit_transaction: {
        Row: {
          id: string
          user_id: string
          amount: number
          balance_after: number
          transaction_type: 'purchase' | 'deduction' | 'refund'
          description: string
          stripe_session_id: string | null
          song_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          balance_after: number
          transaction_type: 'purchase' | 'deduction' | 'refund'
          description: string
          stripe_session_id?: string | null
          song_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          balance_after?: number
          transaction_type?: 'purchase' | 'deduction' | 'refund'
          description?: string
          stripe_session_id?: string | null
          song_id?: string | null
          created_at?: string
        }
      }
      genre: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          emoji: string | null
          suno_prompt_template: string
          sort_order: number
          is_active: boolean
          gradient_colors: Json
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          emoji?: string | null
          suno_prompt_template: string
          sort_order?: number
          is_active?: boolean
          gradient_colors?: Json
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          emoji?: string | null
          suno_prompt_template?: string
          sort_order?: number
          is_active?: boolean
          gradient_colors?: Json
        }
      }
      mastering_request: {
        Row: {
          id: string
          user_id: string
          song_id: string
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          mastered_audio_url: string | null
          notes: string | null
          requested_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          song_id: string
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          mastered_audio_url?: string | null
          notes?: string | null
          requested_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          song_id?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          mastered_audio_url?: string | null
          notes?: string | null
          requested_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_description: string
          p_song_id?: string
        }
        Returns: {
          id: string
          user_id: string
          amount: number
          balance_after: number
          transaction_type: string
          description: string
          stripe_session_id: string | null
          song_id: string | null
          created_at: string
        }
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
