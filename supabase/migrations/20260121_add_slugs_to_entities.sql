-- ==========================================
-- Add Slugs and Tracking Codes for Security
-- ==========================================

-- 1. Add slug to merchants
alter table public.merchants add column if not exists slug text unique;

-- 2. Add slug to food_items
alter table public.food_items add column if not exists slug text unique;

-- 3. Add tracking_code to orders
alter table public.orders add column if not exists tracking_code text unique;

-- 4. Function to generate slugs (simplified for SQL)
create or replace function public.generate_slug(t text)
returns text as $$
begin
  return lower(regexp_replace(regexp_replace(t, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
end;
$$ language plpgsql;

-- 5. Populate existing data
update public.merchants 
set slug = public.generate_slug(business_name) || '-' || substring(id::text, 1, 8)
where slug is null;

update public.food_items
set slug = public.generate_slug(name) || '-' || substring(id::text, 1, 8)
where slug is null;

-- 6. Populate tracking codes for orders
-- Format: OY-YYYYMMDD-XXXX (where XXXX is last 4 of ID)
update public.orders
set tracking_code = 'OY-' || to_char(created_at, 'YYYYMMDD') || '-' || upper(substring(id::text, 1, 4))
where tracking_code is null;

-- 7. Add constraints after population
alter table public.merchants alter column slug set not null;
alter table public.food_items alter column slug set not null;
alter table public.orders alter column tracking_code set not null;

-- 8. Triggers for automatic slugs on insert
create or replace function public.tr_merchants_slug()
returns trigger as $$
begin
  if new.slug is null then
    new.slug := public.generate_slug(new.business_name) || '-' || substring(new.id::text, 1, 8);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tr_merchants_slug_trigger
before insert on public.merchants
for each row execute procedure public.tr_merchants_slug();

create or replace function public.tr_food_items_slug()
returns trigger as $$
begin
  if new.slug is null then
    new.slug := public.generate_slug(new.name) || '-' || substring(new.id::text, 1, 8);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tr_food_items_slug_trigger
before insert on public.food_items
for each row execute procedure public.tr_food_items_slug();

-- 9. Trigger for tracking code
create or replace function public.tr_orders_tracking()
returns trigger as $$
begin
  if new.tracking_code is null then
    new.tracking_code := 'OY-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(new.id::text, 1, 4));
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tr_orders_tracking_trigger
before insert on public.orders
for each row execute procedure public.tr_orders_tracking();
