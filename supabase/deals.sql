-- Private deal records (run once). WhatsApp numbers are not public.
alter table public.orders add column if not exists deal_status text default 'accepted';
alter table public.orders add column if not exists accepted_at timestamptz;
alter table public.orders add column if not exists seller_whatsapp text;
alter table public.orders add column if not exists buyer_name text;
alter table public.orders add column if not exists seller_name text;
alter table public.orders add column if not exists buyer_email text;
alter table public.products add column if not exists seller_whatsapp text;
