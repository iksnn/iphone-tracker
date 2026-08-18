create table if not exists listings (
  id text primary key,               
  title text,
  description text,
  price_amount numeric,
  price_formatted text,
  location text,
  photo_url text,
  listing_url text,
  phone text,
  verdict boolean,                   
  reason text,
  source text default 'keyword',   
  posted_at timestamptz,
  scraped_at timestamptz default now()
);

create index if not exists idx_listings_verdict on listings (verdict);
create index if not exists idx_listings_posted_at on listings (posted_at desc);
