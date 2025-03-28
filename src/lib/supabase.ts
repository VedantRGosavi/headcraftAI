// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with the anonymous key for client-side usage
export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Create a Supabase client with the service role key for server-side operations
// This should only be used in API routes and server-side code, never exposed to the client
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper to get user data from client
export const getCurrentUser = async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session?.user;
};

// Storage bucket constants
export const STORAGE_BUCKET = 'user-images';
export const UPLOADED_FOLDER = 'uploaded';
export const GENERATED_FOLDER = 'generated';