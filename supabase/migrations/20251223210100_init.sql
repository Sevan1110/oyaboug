create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('user', 'merchant', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'merchant_type') then
    create type public.merchant_type as enum ('restaurant','bakery','grocery','supermarket','hotel','caterer','other');
  end if;

  if not exists (select 1 from pg_type where typname = 'food_category') then
    create type public.food_category as enum ('bread_pastry','prepared_meals','fruits_vegetables','dairy','meat_fish','beverages','snacks','mixed_basket','other');
  end if;

  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pending','confirmed','ready','picked_up','completed','cancelled','no_show');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum ('order_confirmed','order_ready','order_cancelled','new_food_nearby','merchant_verified','promotion','system');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  phone text,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'user',
  address text,
  city text,
  quartier text,
  preferences jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, full_name, role, created_at, updated_at)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'full_name',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'user'),
    now(),
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    phone = excluded.phone,
    full_name = excluded.full_name,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  business_type public.merchant_type not null,
  description text,
  logo_url text,
  cover_image_url text,
  address text not null,
  city text not null,
  quartier text not null,
  latitude double precision,
  longitude double precision,
  phone text not null,
  email text not null,
  opening_hours jsonb,
  rating numeric not null default 0,
  total_reviews integer not null default 0,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_merchants_user_id on public.merchants(user_id);
create index if not exists idx_merchants_city on public.merchants(city);
create index if not exists idx_merchants_business_type on public.merchants(business_type);

create trigger set_merchants_updated_at
before update on public.merchants
for each row
execute function public.set_updated_at();

create table if not exists public.food_items (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null,
  description text,
  category public.food_category not null,
  original_price bigint not null check (original_price >= 0),
  discounted_price bigint not null check (discounted_price >= 0),
  discount_percentage integer not null default 0 check (discount_percentage >= 0 and discount_percentage <= 100),
  quantity_available integer not null default 0 check (quantity_available >= 0),
  quantity_initial integer not null default 0 check (quantity_initial >= 0),
  image_url text,
  images text[],
  pickup_start timestamptz not null,
  pickup_end timestamptz not null,
  expiry_date timestamptz,
  is_available boolean not null default true,
  badges text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_food_items_merchant_id on public.food_items(merchant_id);
create index if not exists idx_food_items_category on public.food_items(category);
create index if not exists idx_food_items_is_available on public.food_items(is_available);

create trigger set_food_items_updated_at
before update on public.food_items
for each row
execute function public.set_updated_at();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete restrict,
  food_item_id uuid not null references public.food_items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  total_price bigint not null check (total_price >= 0),
  original_total bigint not null check (original_total >= 0),
  savings bigint not null default 0 check (savings >= 0),
  status public.order_status not null default 'pending',
  pickup_code text not null,
  pickup_time timestamptz,
  confirmed_at timestamptz,
  picked_up_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  rating integer check (rating is null or (rating >= 1 and rating <= 5)),
  review text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_merchant_id on public.orders(merchant_id);
create index if not exists idx_orders_food_item_id on public.orders(food_item_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at);

create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, merchant_id)
);

create index if not exists idx_favorites_user_id on public.favorites(user_id);
create index if not exists idx_favorites_merchant_id on public.favorites(merchant_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  message text not null,
  data jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_is_read on public.notifications(is_read);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique references public.orders(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  review text,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_merchant_id on public.reviews(merchant_id);
create index if not exists idx_reviews_user_id on public.reviews(user_id);

create table if not exists public.impact_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  food_saved_kg numeric,
  money_saved_xaf bigint,
  co2_avoided_kg numeric,
  created_at timestamptz not null default now()
);

create index if not exists idx_impact_logs_user_id on public.impact_logs(user_id);
create index if not exists idx_impact_logs_merchant_id on public.impact_logs(merchant_id);
create index if not exists idx_impact_logs_order_id on public.impact_logs(order_id);

create table if not exists public.pricing_history (
  id uuid primary key default gen_random_uuid(),
  food_item_id uuid not null references public.food_items(id) on delete cascade,
  original_price bigint not null check (original_price >= 0),
  recommended_price bigint not null check (recommended_price >= 0),
  discount_percentage integer not null check (discount_percentage >= 0 and discount_percentage <= 100),
  confidence_score numeric,
  factors jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_pricing_history_food_item_id on public.pricing_history(food_item_id);
create index if not exists idx_pricing_history_created_at on public.pricing_history(created_at);

alter table public.profiles enable row level security;
alter table public.merchants enable row level security;
alter table public.food_items enable row level security;
alter table public.orders enable row level security;
alter table public.favorites enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.impact_logs enable row level security;
alter table public.pricing_history enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "merchants_select_public" on public.merchants;
create policy "merchants_select_public" on public.merchants
for select
to anon, authenticated
using (true);

drop policy if exists "merchants_insert_owner" on public.merchants;
create policy "merchants_insert_owner" on public.merchants
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "merchants_update_owner" on public.merchants;
create policy "merchants_update_owner" on public.merchants
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "merchants_delete_owner" on public.merchants;
create policy "merchants_delete_owner" on public.merchants
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "food_items_select_public" on public.food_items;
create policy "food_items_select_public" on public.food_items
for select
to anon, authenticated
using (true);

drop policy if exists "food_items_insert_merchant_owner" on public.food_items;
create policy "food_items_insert_merchant_owner" on public.food_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.merchants m
    where m.id = food_items.merchant_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "food_items_update_merchant_owner" on public.food_items;
create policy "food_items_update_merchant_owner" on public.food_items
for update
to authenticated
using (
  exists (
    select 1
    from public.merchants m
    where m.id = food_items.merchant_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.merchants m
    where m.id = food_items.merchant_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "food_items_delete_merchant_owner" on public.food_items;
create policy "food_items_delete_merchant_owner" on public.food_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.merchants m
    where m.id = food_items.merchant_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "orders_select_user_or_merchant" on public.orders;
create policy "orders_select_user_or_merchant" on public.orders
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.merchants m
    where m.id = orders.merchant_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "orders_update_user_or_merchant" on public.orders;
create policy "orders_update_user_or_merchant" on public.orders
for update
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.merchants m
    where m.id = orders.merchant_id
      and m.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1
    from public.merchants m
    where m.id = orders.merchant_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "reviews_select_public" on public.reviews;
create policy "reviews_select_public" on public.reviews
for select
to anon, authenticated
using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "impact_logs_select_user_or_merchant" on public.impact_logs;
create policy "impact_logs_select_user_or_merchant" on public.impact_logs
for select
to authenticated
using (
  (user_id is not null and auth.uid() = user_id)
  or exists (
    select 1
    from public.merchants m
    where m.id = impact_logs.merchant_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "impact_logs_insert_merchant_owner" on public.impact_logs;
create policy "impact_logs_insert_merchant_owner" on public.impact_logs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.merchants m
    where m.id = impact_logs.merchant_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "pricing_history_select_merchant_owner" on public.pricing_history;
create policy "pricing_history_select_merchant_owner" on public.pricing_history
for select
to authenticated
using (
  exists (
    select 1
    from public.food_items fi
    join public.merchants m on m.id = fi.merchant_id
    where fi.id = pricing_history.food_item_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "pricing_history_insert_merchant_owner" on public.pricing_history;
create policy "pricing_history_insert_merchant_owner" on public.pricing_history
for insert
to authenticated
with check (
  exists (
    select 1
    from public.food_items fi
    join public.merchants m on m.id = fi.merchant_id
    where fi.id = pricing_history.food_item_id
      and m.user_id = auth.uid()
  )
);
