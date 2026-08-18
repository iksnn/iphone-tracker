import { getSupabaseServer } from '@/lib/supabase';

export async function PATCH(req, { params }) {
  const { id } = params;
  const body = await req.json();

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from('listings')
    .update({ status: body.status, notes: body.notes })
    .eq('id', id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}