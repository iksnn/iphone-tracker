export async function POST() {
  try {
    const res = await fetch(process.env.N8N_WEBHOOK_URL, { method: 'POST' });

    if (!res.ok) {
      const errorText = await res.text();
      return Response.json({ error: `n8n merespon status ${res.status}: ${errorText}` }, { status: 500 });
    }

    return Response.json({ ok: true, message: 'Workflow sedang berjalan' });
  } catch (err) {
    return Response.json({ error: `Fetch gagal: ${err.message}` }, { status: 500 });
  }
}