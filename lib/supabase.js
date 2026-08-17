import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const authHeader = req.headers.get('authorization') || '';
  const expectedSecret = process.env.INGEST_SECRET;

  // Debugging sementara: Kembalikan info detail jika unauthorized
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return Response.json({
      error: 'Unauthorized',
      debug: {
        receivedHeader: authHeader,
        hasEnvSecret: !!expectedSecret, // true jika INGEST_SECRET terdeteksi
        expectedPrefix: 'Bearer '
      }
    }, { status: 401 });
  }

  // ... (sisa kode Supabase kamu)
}
// Ambil dari Supabase project settings > API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // dipakai di server (API route) saja

export function getSupabaseServer() {
  return createClient(supabaseUrl, supabaseKey);
}

// Client publik (read-only, aman dipakai di browser) — pakai anon key
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);