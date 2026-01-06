-- ============================================
-- ouyaboung Platform - Initial Database Schema
-- Généré à partir des types et services frontend
-- Tables cibles : profiles, merchants, food_items, orders,
-- notifications, favorites, reviews, impact_logs, pricing_history,
-- user_roles, admin_activities
-- ============================================

-- NOTE IMPORTANTE :
-- - Supabase crée déjà la table auth.users pour les comptes.
-- - La table profiles est liée à auth.users par user_id = auth.users.id.
-- - Adaptez les types (TEXT vs VARCHAR, NUMERIC vs INT) à vos besoins
--   si nécessaire avant d'exécuter cette migration.

------------------------------------------------
-- EXTENSIONS (si non déjà activées)
------------------------------------------------
create extension if not exists "uuid-ossp";

------------------------------------------------
-- TABLE: profiles
------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  phone text,
  full_name text,
  avatar_url text,
  role text not null check (role in ('user', 'merchant', 'admin')),
  address text,
  city text,
  quartier text,
  preferences jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_user_id_key on public.profiles(user_id);
create unique index if not exists profiles_email_key on public.profiles(email);

------------------------------------------------
-- TABLE: merchants
------------------------------------------------
create table if not exists public.merchants (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  business_name text not null,
  business_type text not null
    check (business_type in ('restaurant','bakery','grocery','supermarket','hotel','caterer','other')),
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
  rating numeric(3,2) not null default 0,
  total_reviews integer not null default 0,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists merchants_city_idx on public.merchants(city);
create index if not exists merchants_quartier_idx on public.merchants(quartier);
create index if not exists merchants_is_active_idx on public.merchants(is_active);
create index if not exists merchants_business_type_idx on public.merchants(business_type);

------------------------------------------------
-- TABLE: food_items
------------------------------------------------
create table if not exists public.food_items (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null,
  description text,
  category text not null
    check (category in (
      'bread_pastry',
      'prepared_meals',
      'fruits_vegetables',
      'dairy',
      'meat_fish',
      'beverages',
      'snacks',
      'mixed_basket',
      'other'
    )),
  original_price integer not null,      -- XAF
  discounted_price integer not null,    -- XAF
  discount_percentage integer not null,
  quantity_available integer not null,
  quantity_initial integer not null,
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

create index if not exists food_items_merchant_id_idx on public.food_items(merchant_id);
create index if not exists food_items_category_idx on public.food_items(category);
create index if not exists food_items_is_available_idx on public.food_items(is_available);

------------------------------------------------
-- TABLE: orders
------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  food_item_id uuid not null references public.food_items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  total_price integer not null,       -- XAF
  original_total integer not null,    -- XAF
  savings integer not null,           -- XAF
  status text not null
    check (status in ('pending','confirmed','ready','picked_up','completed','cancelled','no_show')),
  pickup_code text not null,
  pickup_time timestamptz,
  confirmed_at timestamptz,
  picked_up_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  rating integer,
  review text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_merchant_id_idx on public.orders(merchant_id);
create index if not exists orders_food_item_id_idx on public.orders(food_item_id);
create index if not exists orders_status_idx on public.orders(status);

------------------------------------------------
-- TABLE: notifications
------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null
    check (type in (
      'order_confirmed',
      'order_ready',
      'order_cancelled',
      'new_food_nearby',
      'merchant_verified',
      'promotion',
      'system'
    )),
  title text not null,
  message text not null,
  data jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_is_read_idx on public.notifications(is_read);

------------------------------------------------
-- TABLE: favorites
------------------------------------------------
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, merchant_id)
);

------------------------------------------------
-- TABLE: reviews (optionnelle, pour futures features)
------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists reviews_merchant_id_idx on public.reviews(merchant_id);

------------------------------------------------
-- TABLE: impact_logs
------------------------------------------------
create table if not exists public.impact_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  merchant_id uuid references public.merchants(id) on delete set null,
  food_item_id uuid references public.food_items(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  food_saved_kg numeric(10,2) default 0,
  money_saved_xaf integer default 0,
  co2_avoided_kg numeric(10,2) default 0,
  revenue_xaf integer default 0,
  created_at timestamptz not null default now()
);

create index if not exists impact_logs_user_id_idx on public.impact_logs(user_id);
create index if not exists impact_logs_merchant_id_idx on public.impact_logs(merchant_id);

------------------------------------------------
-- TABLE: pricing_history
------------------------------------------------
create table if not exists public.pricing_history (
  id uuid primary key default uuid_generate_v4(),
  food_item_id uuid not null references public.food_items(id) on delete cascade,
  original_price integer not null,
  discounted_price integer not null,
  discount_percentage integer not null,
  recommendation jsonb,
  created_at timestamptz not null default now()
);

create index if not exists pricing_history_food_item_id_idx on public.pricing_history(food_item_id);

------------------------------------------------
-- TABLE: user_roles (optionnel, pour futures extensions RBAC)
------------------------------------------------
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('user','merchant','admin')),
  created_at timestamptz not null default now()
);

------------------------------------------------
-- TABLE: admin_activities (journal d’actions admin)
------------------------------------------------
create table if not exists public.admin_activities (
  id uuid primary key default uuid_generate_v4(),
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

------------------------------------------------
-- TRIGGERS: mise à jour automatique de updated_at
------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_merchants_updated_at on public.merchants;
create trigger set_merchants_updated_at
before update on public.merchants
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_food_items_updated_at on public.food_items;
create trigger set_food_items_updated_at
before update on public.food_items
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute procedure public.set_updated_at();

------------------------------------------------
-- TABLE: impact_reports (cached/generated reports)
------------------------------------------------
create table if not exists public.impact_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  merchant_id uuid references public.merchants(id) on delete set null,
  start_date date not null,
  end_date date not null,
  report jsonb not null,
  generated_by text,
  created_at timestamptz not null default now()
);

create index if not exists impact_reports_user_id_idx on public.impact_reports(user_id);
create index if not exists impact_reports_merchant_id_idx on public.impact_reports(merchant_id);

------------------------------------------------
-- TABLE: monthly_aggregates (optional caching of computed monthly stats)
------------------------------------------------
create table if not exists public.monthly_aggregates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  year integer not null,
  month integer not null,
  meals integer not null default 0,
  co2_avoided_kg numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists monthly_aggregates_user_month_idx on public.monthly_aggregates(user_id, year, month);
create index if not exists monthly_aggregates_user_id_idx on public.monthly_aggregates(user_id);


