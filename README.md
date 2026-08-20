# iPhone Resmi Tracker

Web buat mantau listing iPhone garansi resmi dari Facebook Marketplace di sekitar Tangerang. Scraping jalan otomatis lewat n8n, hasilnya disaring (keyword dulu, AI cuma dipanggil kalau belum pasti), terus kamu tinggal triage di sini — tandain status, catat progres nego, langsung chat WA penjualnya.

## Alurnya

1. Tombol "Cari Listing Baru" di web memicu workflow n8n.
2. n8n scrape Marketplace, filter berdasarkan jarak dari pusat Tangerang (radius 40km), lalu tentukan verdict garansi resmi atau bukan.
3. Semua listing — verdict cocok atau tidak — disimpan ke Supabase, biar ada histori. Yang tampil di web cuma yang verdict-nya cocok.
4. Workflow kirim balik ringkasan (berapa diperiksa, berapa lolos) ke web setelah selesai.

## Stack

- Next.js (App Router), CSS custom — di-deploy ke Vercel
- Supabase buat database
- n8n buat scraping dan filtering

## Setup

### 1. Supabase
1. Buat project di supabase.com (free tier cukup).
2. Jalankan `supabase-schema.sql` di SQL Editor.
3. Catat `Project URL`, `anon public key`, `service_role key` dari Project Settings > API.

### 2. Deploy ke Vercel
1. Push repo ini ke GitHub, import di vercel.com.
2. Isi environment variables (contoh di `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `N8N_WEBHOOK_URL` — URL webhook trigger workflow
   - `INGEST_SECRET` — string rahasia bikin sendiri, dipakai untuk autentikasi antara n8n dan web
3. Deploy sekali dulu, catat domain-nya, isi `NEXT_PUBLIC_SITE_URL`, redeploy.

### 3. Workflow n8n

Urutan node: Webhook → scrape Marketplace → filter jarak & keyword → verdict (auto atau lewat AI) → tiap listing di-POST ke `/api/listings` → setelah loop selesai, hitung ringkasan dan balas ke Webhook lewat `/api/run-summary`.

Node HTTP Request yang kirim listing:
- Method: POST
- URL: `https://nama-app-kamu.vercel.app/api/listings`
- Header: `Authorization: Bearer <INGEST_SECRET>`
- Body:
```json
{
  "id": "{{ $json.id }}",
  "title": "{{ $json.marketplace_listing_title }}",
  "description": "{{ $json.redacted_description.text }}",
  "priceAmount": {{ $json.listing_price.amount }},
  "priceFormatted": "{{ $json.listing_price.formatted_amount_zeros_stripped }}",
  "location": "{{ $json.location_text.text }}",
  "photoUrl": "{{ $json.primary_listing_photo_url }}",
  "listingUrl": "{{ $json.listingUrl }}",
  "phone": "{{ $json.foundPhone }}",
  "verdict": {{ $json.verdict }},
  "reason": "{{ $json.reason }}",
  "postedAt": "{{ $json.creation_time_formatted }}"
}
```

Catatan penting: node Webhook harus di-set respond **"Using Respond to Webhook Node"**, bukan "Immediately" — kalau tidak, web bakal dapat balasan kosong sebelum ringkasan hasil scrape sempat dihitung.

Dedup otomatis lewat upsert berdasarkan `id` listing di Supabase, jadi node filter duplikat manual di n8n sudah tidak perlu lagi.

## Jalan di lokal

npm install
cp .env.example .env.local # isi sendiri
npm run dev


## Fitur di web

- Cari listing, filter per status, sort (terbaru / terlama / harga)
- Ubah status (belum dicek / nego / deal / ga tertarik) langsung dari grid
- Catatan pribadi per listing
- Tombol chat WA otomatis kalau nomor HP ketemu di deskripsi
- Modal detail jadi bottom sheet di HP, responsive dari layar kecil sampai desktop