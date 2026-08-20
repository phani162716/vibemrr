-- Vibers product marketplace (PDF spec). Run in Supabase SQL editor once.
-- Safe to run after the original schema.sql (adds columns / new tables).

alter table public.profiles add column if not exists primary_role text;
alter table public.profiles add column if not exists handle text;
alter table public.profiles add column if not exists bio text;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  owner_id uuid references auth.users (id) on delete set null,
  owner_name text,
  name text not null,
  short_description text,
  full_description text,
  product_type text not null,
  niche text,
  tags text[] not null default '{}',
  asking_inr numeric not null default 0,
  thumbnail_url text,
  images text[] not null default '{}',
  demo_url text,
  website_url text,
  status text not null default 'available',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_views (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete cascade,
  viewer_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.interests (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete cascade,
  product_slug text,
  product_name text,
  asking_inr numeric,
  seller_id uuid,
  buyer_id uuid references auth.users (id) on delete set null,
  buyer_name text,
  buyer_email text,
  amount_inr numeric not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bids add column if not exists product_slug text;
alter table public.bids add column if not exists product_name text;
alter table public.bids add column if not exists asking_inr numeric;
alter table public.bids add column if not exists seller_id uuid;

create table if not exists public.bid_messages (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid not null references public.bids (id) on delete cascade,
  actor_name text,
  role text not null,
  amount_inr numeric,
  message text,
  kind text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete set null,
  product_name text,
  buyer_id uuid,
  seller_id uuid,
  bid_id uuid,
  amount_inr numeric not null,
  payment_status text not null default 'pending',
  handover jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete cascade,
  order_id uuid,
  buyer_id uuid,
  buyer_name text,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  body text,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists products_status_idx on public.products (status);
create index if not exists products_type_idx on public.products (product_type);
create index if not exists bids_product_idx on public.bids (product_id);
create index if not exists views_product_idx on public.product_views (product_id);

alter table public.products enable row level security;
alter table public.product_views enable row level security;
alter table public.interests enable row level security;
alter table public.bids enable row level security;
alter table public.bid_messages enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "products readable" on public.products;
create policy "products readable" on public.products for select using (true);
drop policy if exists "owners insert products" on public.products;
create policy "owners insert products" on public.products for insert with check (auth.uid() = owner_id);
drop policy if exists "owners update products" on public.products;
create policy "owners update products" on public.products for update using (auth.uid() = owner_id);
drop policy if exists "owners delete products" on public.products;
create policy "owners delete products" on public.products for delete using (auth.uid() = owner_id);

drop policy if exists "views insert" on public.product_views;
create policy "views insert" on public.product_views for insert with check (true);
drop policy if exists "views read" on public.product_views;
create policy "views read" on public.product_views for select using (true);

drop policy if exists "interests own" on public.interests;
create policy "interests own" on public.interests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "interests read" on public.interests;
create policy "interests read" on public.interests for select using (true);

drop policy if exists "bids insert" on public.bids;
create policy "bids insert" on public.bids for insert with check (auth.uid() = buyer_id);
drop policy if exists "bids read" on public.bids;
create policy "bids read" on public.bids for select using (
  auth.uid() = buyer_id
  or auth.uid() = seller_id
  or exists (
    select 1 from public.products p where p.id = bids.product_id and p.owner_id = auth.uid()
  )
);
drop policy if exists "bids update parties" on public.bids;
create policy "bids update parties" on public.bids for update using (
  auth.uid() = buyer_id
  or auth.uid() = seller_id
  or exists (
    select 1 from public.products p where p.id = bids.product_id and p.owner_id = auth.uid()
  )
);

drop policy if exists "bid msgs insert" on public.bid_messages;
create policy "bid msgs insert" on public.bid_messages for insert with check (auth.uid() is not null);
drop policy if exists "bid msgs read" on public.bid_messages;
create policy "bid msgs read" on public.bid_messages for select using (auth.uid() is not null);

drop policy if exists "orders insert" on public.orders;
create policy "orders insert" on public.orders for insert with check (auth.uid() = buyer_id);
drop policy if exists "orders read" on public.orders;
create policy "orders read" on public.orders for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
drop policy if exists "orders update parties" on public.orders;
create policy "orders update parties" on public.orders for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "reviews read" on public.reviews;
create policy "reviews read" on public.reviews for select using (true);
drop policy if exists "reviews insert buyer" on public.reviews;
create policy "reviews insert buyer" on public.reviews for insert with check (auth.uid() = buyer_id);

drop policy if exists "notes own" on public.notifications;
create policy "notes own" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "favs own" on public.favorites;
create policy "favs own" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
