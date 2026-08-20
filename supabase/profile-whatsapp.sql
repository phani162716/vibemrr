-- Run this entire file once in Supabase SQL Editor.
-- Fixes: "new row violates row-level security policy for table profiles"

alter table public.profiles add column if not exists whatsapp text;
alter table public.profiles add column if not exists handle text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists primary_role text;

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable" on public.profiles
  for select using (true);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Bypass RLS for the signed-in user's own save (auth.uid() only).
create or replace function public.save_my_profile(
  p_name text default null,
  p_whatsapp text default null,
  p_handle text default null,
  p_bio text default null,
  p_role text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rec public.profiles;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.profiles as pr (id, email, name, whatsapp, handle, bio, primary_role, updated_at)
  values (
    uid,
    coalesce(auth.jwt() ->> 'email', ''),
    coalesce(nullif(p_name, ''), split_part(coalesce(auth.jwt() ->> 'email', 'user'), '@', 1)),
    nullif(p_whatsapp, ''),
    nullif(p_handle, ''),
    nullif(p_bio, ''),
    nullif(p_role, ''),
    now()
  )
  on conflict (id) do update
    set name = coalesce(nullif(excluded.name, ''), pr.name),
        whatsapp = coalesce(nullif(excluded.whatsapp, ''), pr.whatsapp),
        handle = coalesce(nullif(excluded.handle, ''), pr.handle),
        bio = coalesce(nullif(excluded.bio, ''), pr.bio),
        primary_role = coalesce(nullif(excluded.primary_role, ''), pr.primary_role),
        email = coalesce(nullif(excluded.email, ''), pr.email),
        updated_at = now()
  returning * into rec;

  return rec;
end;
$$;

revoke all on function public.save_my_profile(text, text, text, text, text) from public;
grant execute on function public.save_my_profile(text, text, text, text, text) to authenticated;
grant execute on function public.save_my_profile(text, text, text, text, text) to anon;

notify pgrst, 'reload schema';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url, whatsapp)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, 'founder'), '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'whatsapp'
  )
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(excluded.name, public.profiles.name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        whatsapp = coalesce(excluded.whatsapp, public.profiles.whatsapp),
        updated_at = now();
  return new;
end;
$$;
