-- Jalankan ini sekali di Supabase SQL editor untuk bikin tabelnya
create table if not exists listings (
  id text primary key,               -- Facebook listing id, dipakai buat anti-duplikat
  title text,
  description text,
  price_amount numeric,
  price_formatted text,
  location text,
  photo_url text,
  listing_url text,
  phone text,
  verdict boolean,                   -- true = garansi resmi, false = ditolak
  reason text,
  source text default 'keyword',     -- 'keyword' atau 'ai'
  posted_at timestamptz,
  scraped_at timestamptz default now()
);

create index if not exists idx_listings_verdict on listings (verdict);
create index if not exists idx_listings_posted_at on listings (posted_at desc);
