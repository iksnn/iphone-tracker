# iPhone Resmi Tracker

Web sederhana buat browsing listing iPhone garansi resmi dari Facebook Marketplace,
diisi otomatis oleh workflow n8n kamu.

## Setup (semua gratis)

### 1. Supabase (database)
1. Buat project baru di supabase.com (free tier).
2. Buka SQL Editor, jalankan isi file `supabase-schema.sql`.
3. Buka Project Settings > API, catat: `Project URL`, `anon public key`, `service_role key`.

### 2. Deploy ke Vercel
1. Push folder ini ke repo GitHub.
2. Import repo di vercel.com (Hobby plan, gratis).
3. Di Vercel > Settings > Environment Variables, isi sesuai `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (isi setelah deploy pertama, sesuai domain vercel kamu)
   - `INGEST_SECRET` (string rahasia buatan sendiri, buat autentikasi n8n -> web)
4. Deploy.

### 3. Sambungkan dari n8n
Ganti node **"Append row in sheet"** dengan node **HTTP Request**:
- Method: POST
- URL: `https://nama-app-kamu.vercel.app/api/listings`
- Headers: `Authorization: Bearer <INGEST_SECRET yang sama>`
- Body (JSON):
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

Database otomatis anti-duplikat berdasarkan `id` listing (upsert) — jadi node
"Get row(s) in sheet" + "filter duplikat" di n8n **tidak diperlukan lagi**,
karena Supabase yang menangani itu.

## Jalan lokal (opsional, buat testing sebelum deploy)
```
npm install
cp .env.example .env.local   # isi dengan value asli
npm run dev
```
