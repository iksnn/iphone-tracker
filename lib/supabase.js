import { createClient } from '@supabase/supabase-js';

// Ambil dari Supabase project settings > API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // dipakai di server (API route) saja

export function getSupabaseServer() {
  return createClient(supabaseUrl, supabaseKey);
}

// Client publik (read-only, aman dipakai di browser) — pakai anon key
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);
