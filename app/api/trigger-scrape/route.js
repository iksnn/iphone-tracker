export async function POST() {
  const res = await fetch(process.env.N8N_WEBHOOK_URL, { method: 'POST' });

  if (!res.ok) {
    return Response.json({ error: 'Gagal memicu workflow' }, { status: 500 });
  }

  return Response.json({ ok: true, message: 'Workflow sedang berjalan' });
}