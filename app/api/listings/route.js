import { getSupabaseServer } from '@/lib/supabase';

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

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const location = searchParams.get('location');

  const supabase = getSupabaseServer();
  let query = supabase.from('listings').select('*').eq('verdict', true);

  if (minPrice) query = query.gte('price_amount', minPrice);
  if (maxPrice) query = query.lte('price_amount', maxPrice);
  if (location) query = query.ilike('location', `%${location}%`);

  query = query.order('posted_at', { ascending: false });

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ listings: data });
}
