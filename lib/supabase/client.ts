import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          role: 'admin' | 'staff' | 'student';
          reg_no: string | null;
          year: number | null;
          semester: number | null;
          subjects: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          role: 'admin' | 'staff' | 'student';
          reg_no?: string | null;
          year?: number | null;
          semester?: number | null;
          subjects?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          role?: 'admin' | 'staff' | 'student';
          reg_no?: string | null;
          year?: number | null;
          semester?: number | null;
          subjects?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      otp_sessions: {
        Row: {
          id: string;
          otp_code: string;
          staff_id: string;
          admin_lat: number;
          admin_lng: number;
          subject: string;
          year: number;
          semester: number;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          otp_code: string;
          staff_id: string;
          admin_lat: number;
          admin_lng: number;
          subject: string;
          year: number;
          semester: number;
          created_at?: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          otp_code?: string;
          staff_id?: string;
          admin_lat?: number;
          admin_lng?: number;
          subject?: string;
          year?: number;
          semester?: number;
          created_at?: string;
          expires_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          student_id: string;
          otp_session_id: string;
          student_lat: number;
          student_lng: number;
          distance_meters: number;
          status: 'P' | 'A';
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          otp_session_id: string;
          student_lat: number;
          student_lng: number;
          distance_meters: number;
          status: 'P' | 'A';
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          otp_session_id?: string;
          student_lat?: number;
          student_lng?: number;
          distance_meters?: number;
          status?: 'P' | 'A';
          created_at?: string;
        };
      };
    };
  };
};

// Client-side Supabase client
export const createSupabaseClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Server-side Supabase client with service role (for admin operations)
export const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
