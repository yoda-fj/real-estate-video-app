export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      video_projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: 'draft' | 'processing' | 'completed' | 'failed';
          narration_enabled: boolean;
          tts_voice: string | null;
          music_id: string;
          generated_video_url: string | null;
          narration_audio_url: string | null;
          caption_style: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: 'draft' | 'processing' | 'completed' | 'failed';
          narration_enabled?: boolean;
          tts_voice?: string | null;
          music_id: string;
          generated_video_url?: string | null;
          narration_audio_url?: string | null;
          caption_style?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?: 'draft' | 'processing' | 'completed' | 'failed';
          narration_enabled?: boolean;
          tts_voice?: string | null;
          music_id?: string;
          generated_video_url?: string | null;
          narration_audio_url?: string | null;
          caption_style?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          url: string;
          filename: string;
          order_index: number;
          duration: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          url: string;
          filename: string;
          order_index: number;
          duration?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          url?: string;
          filename?: string;
          order_index?: number;
          duration?: number;
          created_at?: string;
        };
      };
      musics: {
        Row: {
          id: string;
          name: string;
          artist: string;
          duration: number;
          url: string;
          category: 'ambient' | 'upbeat' | 'cinematic' | 'corporate';
          bpm: number;
          is_premium: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          artist: string;
          duration: number;
          url: string;
          category: 'ambient' | 'upbeat' | 'cinematic' | 'corporate';
          bpm?: number;
          is_premium?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          artist?: string;
          duration?: number;
          url?: string;
          category?: 'ambient' | 'upbeat' | 'cinematic' | 'corporate';
          bpm?: number;
          is_premium?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
