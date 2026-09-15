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
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedSchema: 'auth';
            referencedColumns: ['id'];
          }
        ];
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          exercise_name: string;
          start_time: string;
          end_time: string;
          duration_seconds: number;
          total_reps: number;
          valid_reps: number;
          invalid_reps: number;
          average_form_score: number;
          personal_best_beaten: boolean;
          streak_contribution: boolean;
          reps_history: Json;
          feedbacks: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          exercise_id: string;
          exercise_name: string;
          start_time: string;
          end_time: string;
          duration_seconds?: number;
          total_reps?: number;
          valid_reps?: number;
          invalid_reps?: number;
          average_form_score?: number;
          personal_best_beaten?: boolean;
          streak_contribution?: boolean;
          reps_history?: Json;
          feedbacks?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_id?: string;
          exercise_name?: string;
          start_time?: string;
          end_time?: string;
          duration_seconds?: number;
          total_reps?: number;
          valid_reps?: number;
          invalid_reps?: number;
          average_form_score?: number;
          personal_best_beaten?: boolean;
          streak_contribution?: boolean;
          reps_history?: Json;
          feedbacks?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workout_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedSchema: 'auth';
            referencedColumns: ['id'];
          }
        ];
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type ProfileRow = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

export type WorkoutSessionRow = Tables<'workout_sessions'>;
export type WorkoutSessionInsert = TablesInsert<'workout_sessions'>;
export type WorkoutSessionUpdate = TablesUpdate<'workout_sessions'>;
