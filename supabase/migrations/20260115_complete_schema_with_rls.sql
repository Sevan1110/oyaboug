-- ============================================
-- ouyaboung Platform - Complete Database Schema with RLS
-- Migration complète avec Row Level Security
-- ============================================

------------------------------------------------
-- EXTENSIONS
------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "postgis" schema extensions;

------------------------------------------------
-- ENABLE RLS ON ALL TABLES
------------------------------------------------
alter table if exists public.profiles enable row level security;
alter table if exists public.merchants enable row level security;
alter table if exists public.food_items enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.notifications enable row level security;
alter table if exists public.favorites enable row level security;
alter table if exists public.reviews enable row level security;
alter table if exists public.impact_logs enable row level security;
alter table if exists public.pricing_history enable row level security;
alter table if exists public.user_roles enable row level security;
alter table if exists public.admin_activities enable row level security;
alter table if exists public.impact_reports enable row level security;
alter table if exists public.monthly_aggregates enable row level security;

------------------------------------------------
-- RLS POLICIES: profiles
------------------------------------------------
-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- Admins can view all profiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

------------------------------------------------
-- RLS POLICIES: merchants
------------------------------------------------
-- Anyone can view active merchants
create policy "Anyone can view active merchants"
  on public.merchants for select
  using (is_active = true);

-- Merchants can view and update their own merchant profile
create policy "Merchants can manage own profile"
  on public.merchants for all
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'merchant'
    ) and user_id = auth.uid()
  );

-- Admins can manage all merchants
create policy "Admins can manage all merchants"
  on public.merchants for all
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

------------------------------------------------
-- RLS POLICIES: food_items
------------------------------------------------
-- Anyone can view available food items
create policy "Anyone can view available food items"
  on public.food_items for select
  using (is_available = true);

-- Merchants can manage their own food items
create policy "Merchants can manage own food items"
  on public.food_items for all
  using (
    exists (
      select 1 from public.merchants m
      join public.profiles p on m.user_id = p.user_id
      where m.id = food_items.merchant_id
      and p.user_id = auth.uid()
      and p.role = 'merchant'
    )
  );

------------------------------------------------
-- RLS POLICIES: orders
------------------------------------------------
-- Users can view their own orders
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Users can create orders
create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Users can update their own pending orders
create policy "Users can update own pending orders"
  on public.orders for update
  using (
    auth.uid() = user_id
    and status in ('pending', 'confirmed')
  );

-- Merchants can view orders for their merchants
create policy "Merchants can view their orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.merchants m
      join public.profiles p on m.user_id = p.user_id
      where m.id = orders.merchant_id
      and p.user_id = auth.uid()
      and p.role = 'merchant'
    )
  );

-- Merchants can update orders for their merchants
create policy "Merchants can update their orders"
  on public.orders for update
  using (
    exists (
      select 1 from public.merchants m
      join public.profiles p on m.user_id = p.user_id
      where m.id = orders.merchant_id
      and p.user_id = auth.uid()
      and p.role = 'merchant'
    )
  );

------------------------------------------------
-- RLS POLICIES: notifications
------------------------------------------------
-- Users can view their own notifications
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Users can update their own notifications
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- System can insert notifications (via service role)
create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);

------------------------------------------------
-- RLS POLICIES: favorites
------------------------------------------------
-- Users can view their own favorites
create policy "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

-- Users can manage their own favorites
create policy "Users can manage own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

------------------------------------------------
-- RLS POLICIES: reviews
------------------------------------------------
-- Anyone can view reviews
create policy "Anyone can view reviews"
  on public.reviews for select
  using (true);

-- Users can create reviews for their orders
create policy "Users can create reviews"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.orders
      where id = reviews.order_id
      and user_id = auth.uid()
      and status = 'completed'
    )
  );

------------------------------------------------
-- RLS POLICIES: impact_logs
------------------------------------------------
-- Users can view their own impact logs
create policy "Users can view own impact logs"
  on public.impact_logs for select
  using (auth.uid() = user_id);

-- System can insert impact logs
create policy "System can insert impact logs"
  on public.impact_logs for insert
  with check (true);

------------------------------------------------
-- RLS POLICIES: admin_activities
------------------------------------------------
-- Only admins can view admin activities
create policy "Admins can view admin activities"
  on public.admin_activities for select
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can insert admin activities
create policy "Admins can insert admin activities"
  on public.admin_activities for insert
  with check (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

------------------------------------------------
-- FUNCTIONS: Helper functions
------------------------------------------------

-- Function to get user role
create or replace function public.get_user_role(user_uuid uuid)
returns text as $$
  select role from public.profiles where user_id = user_uuid;
$$ language sql security definer;

-- Function to check if user is admin
create or replace function public.is_admin(user_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where user_id = user_uuid and role = 'admin'
  );
$$ language sql security definer;

-- Function to generate pickup code
create or replace function public.generate_pickup_code()
returns text as $$
  select upper(substring(md5(random()::text) from 1 for 6));
$$ language sql;

-- Function to calculate order savings
create or replace function public.calculate_order_savings(
  p_original_total integer,
  p_total_price integer
)
returns integer as $$
  select p_original_total - p_total_price;
$$ language sql;

------------------------------------------------
-- TRIGGERS: Auto-update impact logs on order completion
------------------------------------------------
create or replace function public.log_order_impact()
returns trigger as $$
declare
  v_food_item public.food_items%rowtype;
  v_co2_per_meal numeric := 2.5; -- kg CO2 per meal
  v_food_per_meal numeric := 0.5; -- kg food per meal
begin
  if new.status = 'completed' and (old.status is null or old.status != 'completed') then
    -- Get food item details
    select * into v_food_item
    from public.food_items
    where id = new.food_item_id;

    -- Insert impact log
    insert into public.impact_logs (
      user_id,
      merchant_id,
      food_item_id,
      order_id,
      food_saved_kg,
      money_saved_xaf,
      co2_avoided_kg,
      revenue_xaf
    ) values (
      new.user_id,
      new.merchant_id,
      new.food_item_id,
      new.id,
      v_food_per_meal * new.quantity,
      new.savings,
      v_co2_per_meal * new.quantity,
      new.total_price
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_log_order_impact on public.orders;
create trigger trigger_log_order_impact
after update on public.orders
for each row
execute procedure public.log_order_impact();

------------------------------------------------
-- TRIGGERS: Auto-create notification on order status change
------------------------------------------------
create or replace function public.notify_order_status_change()
returns trigger as $$
begin
  if new.status != old.status then
    insert into public.notifications (
      user_id,
      type,
      title,
      message,
      data
    ) values (
      new.user_id,
      case
        when new.status = 'confirmed' then 'order_confirmed'
        when new.status = 'ready' then 'order_ready'
        when new.status = 'cancelled' then 'order_cancelled'
        else 'system'
      end,
      case
        when new.status = 'confirmed' then 'Commande confirmée'
        when new.status = 'ready' then 'Commande prête'
        when new.status = 'cancelled' then 'Commande annulée'
        else 'Mise à jour de commande'
      end,
      case
        when new.status = 'confirmed' then 'Votre commande a été confirmée. Code de retrait: ' || new.pickup_code
        when new.status = 'ready' then 'Votre commande est prête à être récupérée. Code: ' || new.pickup_code
        when new.status = 'cancelled' then 'Votre commande a été annulée.'
        else 'Statut de votre commande mis à jour.'
      end,
      jsonb_build_object(
        'order_id', new.id,
        'status', new.status,
        'pickup_code', new.pickup_code
      )
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_notify_order_status_change on public.orders;
create trigger trigger_notify_order_status_change
after update on public.orders
for each row
when (old.status is distinct from new.status)
execute procedure public.notify_order_status_change();

------------------------------------------------
-- VIEWS: Useful views for analytics
------------------------------------------------

-- View: User impact summary
create or replace view public.user_impact_summary as
select
  il.user_id,
  count(distinct il.order_id) as orders_count,
  sum(il.food_saved_kg) as food_saved_kg,
  sum(il.money_saved_xaf) as money_saved_xaf,
  sum(il.co2_avoided_kg) as co2_avoided_kg
from public.impact_logs il
group by il.user_id;

-- View: Merchant impact summary
create or replace view public.merchant_impact_summary as
select
  il.merchant_id,
  count(distinct il.order_id) as orders_count,
  sum(il.food_saved_kg) as food_saved_kg,
  sum(il.revenue_xaf) as revenue_xaf,
  sum(il.co2_avoided_kg) as co2_avoided_kg
from public.impact_logs il
group by il.merchant_id;

-- Grant access to views
grant select on public.user_impact_summary to authenticated;
grant select on public.merchant_impact_summary to authenticated;
