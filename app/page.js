async function getListings() {
  // Server component: fetch langsung, tanpa perlu client-side loading state
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/listings`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.listings || [];
}

function formatRupiah(amount) {
  if (!amount) return '-';
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'baru saja';
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

export default async function Home() {
  const listings = await getListings();

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px' }}>
      <header style={{ marginBottom: 32, borderBottom: '1px solid #2a2521', paddingBottom: 20 }}>
        <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9895f', margin: '0 0 6px' }}>
          Marketplace Watch
        </p>
        <h1 style={{ fontSize: 28, margin: 0, fontWeight: 600 }}>iPhone Garansi Resmi</h1>
        <p style={{ color: '#8a8177', fontSize: 14, marginTop: 6 }}>
          {listings.length} listing lolos filter · diperbarui otomatis dari Facebook Marketplace
        </p>
      </header>

      {listings.length === 0 && (
        <p style={{ color: '#8a8177' }}>
          Belum ada data. Jalankan workflow n8n kamu dulu untuk mengisi database.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {listings.map((item) => (
          <a
            key={item.id}
            href={item.listing_url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              background: '#1a1613',
              border: '1px solid #2a2521',
              borderRadius: 10,
              overflow: 'hidden',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            {item.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.photo_url} alt={item.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
            )}
            <div style={{ padding: 14 }}>
              <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 500, lineHeight: 1.35 }}>{item.title}</p>
              <p style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: '#c9895f' }}>
                {formatRupiah(item.price_amount)}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8a8177' }}>
                <span>{item.location || 'Lokasi tidak diketahui'}</span>
                <span>{timeAgo(item.posted_at)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
