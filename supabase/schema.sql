-- VibeMRR schema. Run this in the Supabase SQL editor (once).
-- Project region: Mumbai (ap-south-1) if you can choose.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  whatsapp text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.startups (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  owner_id uuid references auth.users (id) on delete set null,
  owner_email text,
  name text not null,
  anonymous boolean not null default false,
  tagline text,
  description text,
  category text,
  website text,
  logo_letter text,
  logo_color text,
  for_sale boolean not null default false,
  asking_inr numeric,
  revenue_30d_inr numeric not null default 0,
  mrr_inr numeric not null default 0,
  all_time_inr numeric not null default 0,
  mom_growth numeric,
  active_subs integer not null default 0,
  customers integer,
  users_count integer,
  profit_margin numeric,
  provider text,
  last_synced timestamptz,
  founded date,
  city text,
  company_type text,
  gstin text,
  founder_name text,
  founder_handle text,
  founder_followers integer not null default 0,
  founder_whatsapp text,
  vibe_coded boolean not null default false,
  vibe_tools text[] not null default '{}',
  funding text,
  team_size integer not null default 1,
  audience text,
  pricing text,
  value_prop text,
  problem text,
  additional_info text,
  seller_message text,
  tech jsonb not null default '{"frontend":[],"backend":[]}',
  channels text[] not null default '{}',
  listing_tier text not null default 'free',
  looking_for_cofounder boolean not null default false,
  github_contrib integer,
  domain_rating integer,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  startup_slug text not null,
  buyer_id uuid references auth.users (id) on delete set null,
  buyer_name text not null,
  buyer_email text not null,
  buyer_whatsapp text,
  amount_inr numeric not null default 0,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.saved (
  user_id uuid not null references auth.users (id) on delete cascade,
  startup_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, startup_slug)
);

create index if not exists startups_owner_id_idx on public.startups (owner_id);
create index if not exists startups_for_sale_idx on public.startups (for_sale);
create index if not exists offers_startup_slug_idx on public.offers (startup_slug);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, 'founder'), '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(public.profiles.name, excluded.name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.startups enable row level security;
alter table public.offers enable row level security;
alter table public.saved enable row level security;

drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable" on public.profiles
  for select using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "startups are readable" on public.startups;
create policy "startups are readable" on public.startups
  for select using (true);

drop policy if exists "owners insert startups" on public.startups;
create policy "owners insert startups" on public.startups
  for insert with check (auth.uid() = owner_id);

drop policy if exists "owners update startups" on public.startups;
create policy "owners update startups" on public.startups
  for update using (auth.uid() = owner_id);

drop policy if exists "owners delete startups" on public.startups;
create policy "owners delete startups" on public.startups
  for delete using (auth.uid() = owner_id);

drop policy if exists "buyers insert offers" on public.offers;
create policy "buyers insert offers" on public.offers
  for insert with check (auth.uid() is not null);

drop policy if exists "parties read offers" on public.offers;
create policy "parties read offers" on public.offers
  for select using (
    auth.uid() = buyer_id
    or exists (
      select 1 from public.startups s
      where s.slug = offers.startup_slug and s.owner_id = auth.uid()
    )
  );

drop policy if exists "users manage saved" on public.saved;
create policy "users manage saved" on public.saved
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
