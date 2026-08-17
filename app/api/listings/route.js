import { getSupabaseServer } from '@/lib/supabase';

// n8n HTTP Request node (POST) memanggil endpoint ini menggantikan node "Append row in sheet"
// Header: Authorization: Bearer <INGEST_SECRET>
export async function POST(req) {
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader !== `Bearer ${process.env.INGEST_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const supabase = getSupabaseServer();
  const { error } = await supabase.from('listings').upsert(
    {
      id: body.id,
      title: body.title,
      description: body.description,
      price_amount: body.priceAmount,
      price_formatted: body.priceFormatted,
      location: body.location,
      photo_url: body.photoUrl,
      listing_url: body.listingUrl,
      phone: body.phone || null,
      verdict: body.verdict,
      reason: body.reason,
      source: body.source || 'ai',
      posted_at: body.postedAt || null,
    },
    { onConflict: 'id' } // otomatis anti-duplikat berdasarkan listing id
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

// GET dipakai frontend untuk ambil daftar listing yang lolos verdict
export async function GET() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('verdict', true)
    .order('posted_at', { ascending: false })
    .limit(100);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ listings: data });
}
