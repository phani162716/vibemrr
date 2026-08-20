-- Run this once if marketplace.sql already ran (adds columns so counters sync to buyers).
alter table public.bids add column if not exists product_slug text;
alter table public.bids add column if not exists product_name text;
alter table public.bids add column if not exists asking_inr numeric;
alter table public.bids add column if not exists seller_id uuid;

drop policy if exists "bids read" on public.bids;
create policy "bids read" on public.bids
  for select using (
    auth.uid() = buyer_id
    or auth.uid() = seller_id
    or exists (
      select 1 from public.products p
      where p.id = bids.product_id and p.owner_id = auth.uid()
    )
  );

drop policy if exists "bids update parties" on public.bids;
create policy "bids update parties" on public.bids
  for update using (
    auth.uid() = buyer_id
    or auth.uid() = seller_id
    or exists (
      select 1 from public.products p
      where p.id = bids.product_id and p.owner_id = auth.uid()
    )
  );
