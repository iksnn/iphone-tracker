import { getSupabaseServer } from "@/lib/supabase";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since");

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
        .from('listings')
        .select('verdict')
        .gte('scraped_at', since);
    
    if (error) return Response.json({ error: error.message }, { status: 500 });

    const total = data.length;
    const lolos = data.filter((d) => d.verdict === true).length;

    return Response.json({ total, lolos, ditolak });
}