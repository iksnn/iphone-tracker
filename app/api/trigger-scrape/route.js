export async function POST(req) {
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader !== `Bearer ${process.env.INGEST_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const res = await fetch(process.env.N8N_WEBHOOK_URL, { method: 'POST' });

  if (!res.ok) {
    return Response.json({ error: 'Gagal memicu workflow' }, { status: 500 });
  }

  return Response.json({ ok: true, message: 'Workflow sedang berjalan' });
}