-- VibersHub: seller chat + buyer custom-work requests.
-- Run once in Supabase SQL editor.

create or replace function public.is_listed_viber(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.products p
    where p.owner_id = uid and coalesce(p.is_demo, false) = false
  );
$$;

grant execute on function public.is_listed_viber(uuid) to authenticated;
grant execute on function public.is_listed_viber(uuid) to anon;

create table if not exists public.hub_messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.hub_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users (id) on delete cascade,
  buyer_name text not null,
  title text not null,
  description text not null,
  budget_inr numeric not null default 0,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.hub_offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.hub_requests (id) on delete cascade,
  seller_id uuid not null references auth.users (id) on delete cascade,
  seller_name text not null,
  amount_inr numeric not null,
  message text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists hub_messages_created_idx on public.hub_messages (created_at);
create index if not exists hub_requests_created_idx on public.hub_requests (created_at desc);
create index if not exists hub_offers_request_idx on public.hub_offers (request_id);

alter table public.hub_messages enable row level security;
alter table public.hub_requests enable row level security;
alter table public.hub_offers enable row level security;

drop policy if exists "hub messages read" on public.hub_messages;
create policy "hub messages read" on public.hub_messages for select using (true);
drop policy if exists "hub messages insert" on public.hub_messages;
create policy "hub messages insert" on public.hub_messages
  for insert with check (auth.uid() = author_id and public.is_listed_viber(auth.uid()));

drop policy if exists "hub requests read" on public.hub_requests;
create policy "hub requests read" on public.hub_requests for select using (true);
drop policy if exists "hub requests insert" on public.hub_requests;
create policy "hub requests insert" on public.hub_requests
  for insert with check (auth.uid() = buyer_id);
drop policy if exists "hub requests update" on public.hub_requests;
create policy "hub requests update" on public.hub_requests
  for update using (auth.uid() = buyer_id);

drop policy if exists "hub offers read" on public.hub_offers;
create policy "hub offers read" on public.hub_offers for select using (true);
drop policy if exists "hub offers insert" on public.hub_offers;
create policy "hub offers insert" on public.hub_offers
  for insert with check (auth.uid() = seller_id and public.is_listed_viber(auth.uid()));
drop policy if exists "hub offers update" on public.hub_offers;
create policy "hub offers update" on public.hub_offers
  for update using (
    auth.uid() = seller_id
    or exists (select 1 from public.hub_requests r where r.id = request_id and r.buyer_id = auth.uid())
  );

notify pgrst, 'reload schema';
