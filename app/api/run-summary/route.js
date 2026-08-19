import { getSupabaseServer } from "@/lib/supabase";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const runStartTime = searchParams.get("runStartTime");

  if (!runStartTime) {
    return Response.json({ error: "runStartTime wajib diisi" }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('listings')
    .select('verdict')
    .gte('scraped_at', runStartTime);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const total = data.length;
  const lolos = data.filter((d) => d.verdict === true).length;
  const ditolak = total - lolos;

  return Response.json({ total, lolos, ditolak });
}