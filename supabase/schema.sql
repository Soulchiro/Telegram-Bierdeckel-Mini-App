-- Run this once in Supabase Dashboard → SQL Editor. Safe to re-run any
-- number of times (each policy is dropped-then-recreated, since Postgres
-- has no CREATE POLICY IF NOT EXISTS).

create table if not exists public.beer_log (
  id bigint generated always as identity primary key,
  user_id text not null,           -- Telegram user id (string form of a 64-bit int)
  beer_type text not null check (beer_type in ('Lager', 'Ale', 'Dark', 'IPA')),
  pub_name text,                   -- optional: which pub, only set if the person uses that feature
  created_at timestamptz not null default now()
);

create index if not exists beer_log_user_year_idx
  on public.beer_log (user_id, created_at);

alter table public.beer_log enable row level security;

-- NOTE ON SECURITY:
-- This app authenticates the Telegram user purely client-side (via
-- window.Telegram.WebApp.initDataUnsafe.user.id) and never verifies Telegram's
-- signed initData against your bot token. That's fine for a personal / just-for-
-- fun tally shared with friends, but it means anyone who can call your Supabase
-- anon key could write rows under someone else's user_id. The policies below
-- reflect that honestly (open read/write) rather than pretending it's locked down.
--
-- To harden it: add a Supabase Edge Function that verifies the Telegram
-- initData HMAC using your bot token (see
-- https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
-- and mints a Supabase JWT for that user, then swap these policies to
-- `using (auth.uid()::text = user_id)`.

drop policy if exists "anyone can read beer_log" on public.beer_log;
create policy "anyone can read beer_log"
  on public.beer_log for select
  using (true);

drop policy if exists "anyone can insert beer_log" on public.beer_log;
create policy "anyone can insert beer_log"
  on public.beer_log for insert
  with check (true);

-- Needed for the in-app "reset year" button.
drop policy if exists "anyone can delete beer_log" on public.beer_log;
create policy "anyone can delete beer_log"
  on public.beer_log for delete
  using (true);
