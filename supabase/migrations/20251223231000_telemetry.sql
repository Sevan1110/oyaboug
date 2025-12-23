create extension if not exists "pgcrypto";

create table if not exists public.telemetry_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  device_id text not null,
  consent_analytics boolean not null default false,
  consent_marketing boolean not null default false,
  consent_necessary boolean not null default true,
  consent_version text not null default 'v1',
  source text,
  created_at timestamptz not null default now()
);

create index if not exists idx_telemetry_consents_user_id on public.telemetry_consents(user_id);
create index if not exists idx_telemetry_consents_device_id on public.telemetry_consents(device_id);

create table if not exists public.telemetry_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  device_id text not null,
  session_id text not null,
  user_agent text,
  browser_name text,
  os_name text,
  device_type text,
  ip inet,
  country text,
  city text,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists idx_telemetry_sessions_user_id on public.telemetry_sessions(user_id);
create index if not exists idx_telemetry_sessions_device_id on public.telemetry_sessions(device_id);
create index if not exists idx_telemetry_sessions_session_id on public.telemetry_sessions(session_id);
create index if not exists idx_telemetry_sessions_created_at on public.telemetry_sessions(created_at);

create table if not exists public.telemetry_page_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  device_id text not null,
  session_id text not null,
  path text not null,
  title text,
  referrer text,
  query text,
  navigation_type text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create index if not exists idx_telemetry_page_views_created_at on public.telemetry_page_views(created_at);
create index if not exists idx_telemetry_page_views_user_id on public.telemetry_page_views(user_id);
create index if not exists idx_telemetry_page_views_session_id on public.telemetry_page_views(session_id);
create index if not exists idx_telemetry_page_views_path on public.telemetry_page_views(path);

create table if not exists public.telemetry_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  device_id text not null,
  session_id text not null,
  event_name text not null,
  event_category text,
  event_label text,
  value numeric,
  properties jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_telemetry_events_created_at on public.telemetry_events(created_at);
create index if not exists idx_telemetry_events_event_name on public.telemetry_events(event_name);
create index if not exists idx_telemetry_events_user_id on public.telemetry_events(user_id);

create table if not exists public.telemetry_client_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  device_id text not null,
  session_id text not null,
  level text not null check (level in ('debug','info','warn','error')),
  message text not null,
  stack text,
  context jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_telemetry_client_logs_created_at on public.telemetry_client_logs(created_at);
create index if not exists idx_telemetry_client_logs_level on public.telemetry_client_logs(level);
create index if not exists idx_telemetry_client_logs_user_id on public.telemetry_client_logs(user_id);

alter table public.telemetry_consents enable row level security;
alter table public.telemetry_sessions enable row level security;
alter table public.telemetry_page_views enable row level security;
alter table public.telemetry_events enable row level security;
alter table public.telemetry_client_logs enable row level security;

-- Consents: allow insert/update for authenticated user's own records; allow insert for anon (device_id only)
drop policy if exists "telemetry_consents_insert_any" on public.telemetry_consents;
create policy "telemetry_consents_insert_any" on public.telemetry_consents
for insert
to anon, authenticated
with check (true);

drop policy if exists "telemetry_consents_select_own" on public.telemetry_consents;
create policy "telemetry_consents_select_own" on public.telemetry_consents
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "telemetry_consents_update_own" on public.telemetry_consents;
create policy "telemetry_consents_update_own" on public.telemetry_consents
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Sessions / page views / events / logs: insert allowed from client (anon/auth), no select by default
-- (admin dashboards can later be implemented via service role or dedicated RPC)
drop policy if exists "telemetry_sessions_insert_any" on public.telemetry_sessions;
create policy "telemetry_sessions_insert_any" on public.telemetry_sessions
for insert
to anon, authenticated
with check (true);

drop policy if exists "telemetry_page_views_insert_any" on public.telemetry_page_views;
create policy "telemetry_page_views_insert_any" on public.telemetry_page_views
for insert
to anon, authenticated
with check (true);

drop policy if exists "telemetry_events_insert_any" on public.telemetry_events;
create policy "telemetry_events_insert_any" on public.telemetry_events
for insert
to anon, authenticated
with check (true);

drop policy if exists "telemetry_client_logs_insert_any" on public.telemetry_client_logs;
create policy "telemetry_client_logs_insert_any" on public.telemetry_client_logs
for insert
to anon, authenticated
with check (true);
