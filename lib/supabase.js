import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const authHeader = req.headers.get('authorization') || '';
  const expectedSecret = process.env.INGEST_SECRET;

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return Response.json({
      error: 'Unauthorized',
      debug: {
        receivedHeader: authHeader,
        hasEnvSecret: !!expectedSecret,
        expectedPrefix: 'Bearer '
      }
    }, { status: 401 });
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

export function getSupabaseServer() {
  return createClient(supabaseUrl, supabaseKey);
}

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);