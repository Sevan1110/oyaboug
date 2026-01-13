-- ============================================
-- ouyaboung Platform - Database Seed
-- Données de test pour le développement
-- ============================================

-- NOTE: Ce fichier nécessite que les utilisateurs auth.users soient créés d'abord
-- via l'interface Supabase Auth ou via l'API

-- Supprimer les données existantes (attention en production!)
truncate table public.impact_logs cascade;
truncate table public.orders cascade;
truncate table public.food_items cascade;
truncate table public.favorites cascade;
truncate table public.reviews cascade;
truncate table public.notifications cascade;
truncate table public.merchants cascade;
truncate table public.profiles cascade;
truncate table public.pricing_history cascade;
truncate table public.impact_reports cascade;
truncate table public.monthly_aggregates cascade;
truncate table public.admin_activities cascade;

-- ============================================
-- PROFILES (nécessite que auth.users existent)
-- ============================================
-- Note: Les user_id doivent correspondre à des UUIDs valides dans auth.users
-- Pour les tests, vous devrez créer ces utilisateurs via Supabase Auth d'abord

-- Exemple de structure (à adapter avec vos vrais UUIDs):
/*
insert into public.profiles (user_id, email, phone, full_name, role, city, quartier, address) values
  -- Admin
  ('00000000-0000-0000-0000-000000000001', 'admin@ouyaboung.com', '+24101234567', 'Admin Ouyaboung', 'admin', 'Libreville', 'Centre-ville', '123 Avenue de la République'),
  
  -- Merchants
  ('00000000-0000-0000-0000-000000000002', 'boulangerie@example.com', '+24102345678', 'Jean Bakery', 'merchant', 'Libreville', 'Akanda', '45 Boulevard de la Mer'),
  ('00000000-0000-0000-0000-000000000003', 'restaurant@example.com', '+24103456789', 'Marie Restaurant', 'merchant', 'Libreville', 'Quartier Louis', '78 Rue du Marché'),
  ('00000000-0000-0000-0000-000000000004', 'supermarche@example.com', '+24104567890', 'Paul Supermarché', 'merchant', 'Port-Gentil', 'Centre', '12 Avenue de la Paix'),
  
  -- Users
  ('00000000-0000-0000-0000-000000000005', 'user1@example.com', '+24105678901', 'Alice Client', 'user', 'Libreville', 'Nkembo', '90 Rue des Écoles'),
  ('00000000-0000-0000-0000-000000000006', 'user2@example.com', '+24106789012', 'Bob Client', 'user', 'Libreville', 'Glass', '34 Avenue Léon Mba'),
  ('00000000-0000-0000-0000-000000000007', 'user3@example.com', '+24107890123', 'Claire Client', 'user', 'Port-Gentil', 'Port', '56 Boulevard Maritime');
*/

-- ============================================
-- MERCHANTS
-- ============================================
-- Note: Les user_id doivent correspondre à des merchants dans profiles
-- Pour l'instant, on crée des merchants sans user_id pour les tests

insert into public.merchants (
  business_name, business_type, description, address, city, quartier,
  latitude, longitude, phone, email, opening_hours, rating, total_reviews,
  is_verified, is_active
) values
  (
    'Boulangerie du Centre',
    'bakery',
    'Boulangerie artisanale spécialisée dans le pain frais et les pâtisseries',
    '45 Boulevard de la Mer',
    'Libreville',
    'Akanda',
    0.3921, 9.4542,
    '+24101234567',
    'boulangerie@example.com',
    '{"monday": {"open": "06:00", "close": "20:00"}, "tuesday": {"open": "06:00", "close": "20:00"}, "wednesday": {"open": "06:00", "close": "20:00"}, "thursday": {"open": "06:00", "close": "20:00"}, "friday": {"open": "06:00", "close": "20:00"}, "saturday": {"open": "07:00", "close": "19:00"}, "sunday": {"open": "08:00", "close": "18:00"}}'::jsonb,
    4.5,
    23,
    true,
    true
  ),
  (
    'Restaurant Le Bon Goût',
    'restaurant',
    'Restaurant traditionnel gabonais avec plats du jour',
    '78 Rue du Marché',
    'Libreville',
    'Quartier Louis',
    0.3901, 9.4512,
    '+24102345678',
    'restaurant@example.com',
    '{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "12:00", "close": "23:00"}, "sunday": {"open": "12:00", "close": "21:00"}}'::jsonb,
    4.2,
    15,
    true,
    true
  ),
  (
    'Supermarché Central',
    'supermarket',
    'Grande surface avec produits frais et épicerie',
    '12 Avenue de la Paix',
    'Port-Gentil',
    'Centre',
    -0.7167, 8.7833,
    '+24103456789',
    'supermarche@example.com',
    '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "21:00"}, "saturday": {"open": "08:00", "close": "21:00"}, "sunday": {"open": "09:00", "close": "19:00"}}'::jsonb,
    4.0,
    8,
    false,
    true
  ),
  (
    'Hôtel Résidence',
    'hotel',
    'Hôtel 3 étoiles avec restaurant et service traiteur',
    '123 Avenue Léon Mba',
    'Libreville',
    'Glass',
    0.4167, 9.4333,
    '+24104567890',
    'hotel@example.com',
    '{"monday": {"open": "00:00", "close": "23:59"}, "tuesday": {"open": "00:00", "close": "23:59"}, "wednesday": {"open": "00:00", "close": "23:59"}, "thursday": {"open": "00:00", "close": "23:59"}, "friday": {"open": "00:00", "close": "23:59"}, "saturday": {"open": "00:00", "close": "23:59"}, "sunday": {"open": "00:00", "close": "23:59"}}'::jsonb,
    4.3,
    12,
    true,
    true
  ),
  (
    'Épicerie du Quartier',
    'grocery',
    'Petite épicerie de quartier avec produits locaux',
    '34 Rue des Écoles',
    'Libreville',
    'Nkembo',
    0.4089, 9.4456,
    '+24105678901',
    'epicerie@example.com',
    '{"monday": {"open": "07:00", "close": "19:00"}, "tuesday": {"open": "07:00", "close": "19:00"}, "wednesday": {"open": "07:00", "close": "19:00"}, "thursday": {"open": "07:00", "close": "19:00"}, "friday": {"open": "07:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "18:00"}, "sunday": {"open": "09:00", "close": "17:00"}}'::jsonb,
    3.8,
    5,
    false,
    true
  );

-- ============================================
-- FOOD ITEMS
-- ============================================
-- Récupérer les IDs des merchants créés
do $$
declare
  v_boulangerie_id uuid;
  v_restaurant_id uuid;
  v_supermarche_id uuid;
  v_hotel_id uuid;
  v_epicerie_id uuid;
  v_pickup_start timestamptz;
  v_pickup_end timestamptz;
begin
  -- Récupérer les IDs
  select id into v_boulangerie_id from public.merchants where business_name = 'Boulangerie du Centre' limit 1;
  select id into v_restaurant_id from public.merchants where business_name = 'Restaurant Le Bon Goût' limit 1;
  select id into v_supermarche_id from public.merchants where business_name = 'Supermarché Central' limit 1;
  select id into v_hotel_id from public.merchants where business_name = 'Hôtel Résidence' limit 1;
  select id into v_epicerie_id from public.merchants where business_name = 'Épicerie du Quartier' limit 1;

  -- Définir les heures de retrait (aujourd'hui + demain)
  v_pickup_start := (current_date + interval '1 day')::timestamptz + interval '14 hours';
  v_pickup_end := (current_date + interval '1 day')::timestamptz + interval '18 hours';

  -- Boulangerie
  if v_boulangerie_id is not null then
    insert into public.food_items (
      merchant_id, name, description, category, original_price, discounted_price,
      discount_percentage, quantity_available, quantity_initial,
      pickup_start, pickup_end, expiry_date, is_available, badges
    ) values
      (v_boulangerie_id, 'Pain de campagne', 'Pain artisanal cuit le matin', 'bread_pastry', 1500, 750, 50, 12, 20, v_pickup_start, v_pickup_end, (current_date + interval '2 days')::timestamptz, true, array['bio']::text[]),
      (v_boulangerie_id, 'Croissants (lot de 6)', 'Croissants au beurre', 'bread_pastry', 3000, 1500, 50, 8, 15, v_pickup_start, v_pickup_end, (current_date + interval '1 day')::timestamptz, true, array[]::text[]),
      (v_boulangerie_id, 'Tarte aux pommes', 'Tarte maison aux pommes', 'bread_pastry', 2500, 1000, 60, 5, 10, v_pickup_start, v_pickup_end, (current_date + interval '1 day')::timestamptz, true, array['bio']::text[]);
  end if;

  -- Restaurant
  if v_restaurant_id is not null then
    insert into public.food_items (
      merchant_id, name, description, category, original_price, discounted_price,
      discount_percentage, quantity_available, quantity_initial,
      pickup_start, pickup_end, expiry_date, is_available, badges
    ) values
      (v_restaurant_id, 'Plat du jour - Poulet DG', 'Poulet DG avec plantain et légumes', 'prepared_meals', 3500, 2000, 43, 10, 20, v_pickup_start, v_pickup_end, (current_date + interval '1 day')::timestamptz, true, array[]::text[]),
      (v_restaurant_id, 'Riz sauce arachide', 'Riz avec sauce arachide et viande', 'prepared_meals', 2500, 1250, 50, 8, 15, v_pickup_start, v_pickup_end, (current_date + interval '1 day')::timestamptz, true, array[]::text[]),
      (v_restaurant_id, 'Poisson braisé + Attiéké', 'Poisson frais braisé avec attiéké', 'prepared_meals', 4000, 2000, 50, 6, 12, v_pickup_start, v_pickup_end, (current_date + interval '1 day')::timestamptz, true, array[]::text[]);
  end if;

  -- Supermarché
  if v_supermarche_id is not null then
    insert into public.food_items (
      merchant_id, name, description, category, original_price, discounted_price,
      discount_percentage, quantity_available, quantity_initial,
      pickup_start, pickup_end, expiry_date, is_available, badges
    ) values
      (v_supermarche_id, 'Panier de fruits et légumes', 'Mélange de fruits et légumes de saison', 'fruits_vegetables', 5000, 2500, 50, 15, 30, v_pickup_start, v_pickup_end, (current_date + interval '2 days')::timestamptz, true, array['bio']::text[]),
      (v_supermarche_id, 'Lait frais (1L)', 'Lait frais local', 'dairy', 1200, 600, 50, 20, 40, v_pickup_start, v_pickup_end, (current_date + interval '3 days')::timestamptz, true, array[]::text[]),
      (v_supermarche_id, 'Yaourts (lot de 4)', 'Yaourts nature locaux', 'dairy', 2000, 1000, 50, 12, 24, v_pickup_start, v_pickup_end, (current_date + interval '2 days')::timestamptz, true, array[]::text[]);
  end if;

  -- Hôtel
  if v_hotel_id is not null then
    insert into public.food_items (
      merchant_id, name, description, category, original_price, discounted_price,
      discount_percentage, quantity_available, quantity_initial,
      pickup_start, pickup_end, expiry_date, is_available, badges
    ) values
      (v_hotel_id, 'Buffet petit-déjeuner', 'Restes du buffet petit-déjeuner', 'prepared_meals', 8000, 3000, 63, 5, 10, v_pickup_start, v_pickup_end, current_date::timestamptz, true, array['lastItems']::text[]),
      (v_hotel_id, 'Plateau de fromages', 'Assortiment de fromages', 'dairy', 6000, 2500, 58, 3, 8, v_pickup_start, v_pickup_end, (current_date + interval '1 day')::timestamptz, true, array[]::text[]);
  end if;

  -- Épicerie
  if v_epicerie_id is not null then
    insert into public.food_items (
      merchant_id, name, description, category, original_price, discounted_price,
      discount_percentage, quantity_available, quantity_initial,
      pickup_start, pickup_end, expiry_date, is_available, badges
    ) values
      (v_epicerie_id, 'Panier mixte', 'Panier avec produits variés', 'mixed_basket', 4000, 2000, 50, 10, 20, v_pickup_start, v_pickup_end, (current_date + interval '2 days')::timestamptz, true, array[]::text[]),
      (v_epicerie_id, 'Snacks locaux', 'Assortiment de snacks gabonais', 'snacks', 1500, 750, 50, 15, 25, v_pickup_start, v_pickup_end, (current_date + interval '5 days')::timestamptz, true, array[]::text[]);
  end if;
end $$;

-- ============================================
-- ORDERS (nécessite des user_id valides)
-- ============================================
-- Note: Les user_id doivent correspondre à des utilisateurs réels
-- Pour l'instant, on crée des commandes avec des UUIDs de test
-- À adapter avec vos vrais user_id

/*
do $$
declare
  v_user1_id uuid := '00000000-0000-0000-0000-000000000005';
  v_user2_id uuid := '00000000-0000-0000-0000-000000000006';
  v_merchant_id uuid;
  v_food_item_id uuid;
  v_pickup_code text;
begin
  -- Récupérer un merchant et un food_item
  select id into v_merchant_id from public.merchants limit 1;
  select id into v_food_item_id from public.food_items limit 1;

  if v_merchant_id is not null and v_food_item_id is not null then
    -- Générer un code de retrait
    v_pickup_code := upper(substring(md5(random()::text) from 1 for 6));

    -- Créer quelques commandes de test
    insert into public.orders (
      user_id, merchant_id, food_item_id, quantity,
      total_price, original_total, savings, status,
      pickup_code, confirmed_at
    ) values
      (v_user1_id, v_merchant_id, v_food_item_id, 2, 1500, 3000, 1500, 'confirmed', v_pickup_code, now()),
      (v_user2_id, v_merchant_id, v_food_item_id, 1, 750, 1500, 750, 'pending', upper(substring(md5(random()::text) from 1 for 6)), null);
  end if;
end $$;
*/

-- ============================================
-- NOTIFICATIONS (nécessite des user_id valides)
-- ============================================
-- Note: À adapter avec vos vrais user_id

/*
insert into public.notifications (user_id, type, title, message, is_read) values
  ('00000000-0000-0000-0000-000000000005', 'order_confirmed', 'Commande confirmée', 'Votre commande a été confirmée', false),
  ('00000000-0000-0000-0000-000000000005', 'promotion', 'Nouvelle promotion', 'Découvrez nos nouveaux produits à prix réduits', false),
  ('00000000-0000-0000-0000-000000000006', 'new_food_nearby', 'Nouveaux produits près de vous', 'De nouveaux invendus sont disponibles dans votre quartier', true);
*/

-- ============================================
-- FAVORITES (nécessite des user_id valides)
-- ============================================
-- Note: À adapter avec vos vrais user_id

/*
do $$
declare
  v_user_id uuid := '00000000-0000-0000-0000-000000000005';
  v_merchant_id uuid;
begin
  select id into v_merchant_id from public.merchants limit 1;
  if v_merchant_id is not null then
    insert into public.favorites (user_id, merchant_id) values
      (v_user_id, v_merchant_id);
  end if;
end $$;
*/

-- ============================================
-- IMPACT LOGS (sera généré automatiquement par les triggers)
-- ============================================

-- ============================================
-- PRICING HISTORY
-- ============================================
do $$
declare
  v_food_item_id uuid;
begin
  select id into v_food_item_id from public.food_items limit 1;
  if v_food_item_id is not null then
    insert into public.pricing_history (
      food_item_id, original_price, discounted_price, discount_percentage, recommendation
    ) values
      (v_food_item_id, 1500, 750, 50, '{"reason": "Initial pricing", "algorithm": "time_based"}'::jsonb);
  end if;
end $$;

-- ============================================
-- MONTHLY AGGREGATES (exemple)
-- ============================================
-- Note: À adapter avec vos vrais user_id

/*
insert into public.monthly_aggregates (user_id, year, month, meals, co2_avoided_kg) values
  ('00000000-0000-0000-0000-000000000005', extract(year from now())::integer, extract(month from now())::integer, 5, 12.5),
  ('00000000-0000-0000-0000-000000000005', extract(year from now())::integer, extract(month from now() - interval '1 month')::integer, 8, 20.0),
  ('00000000-0000-0000-0000-000000000006', extract(year from now())::integer, extract(month from now())::integer, 3, 7.5);
*/

-- Message de confirmation
do $$
begin
  raise notice 'Seed terminé avec succès!';
  raise notice 'Merchants créés: %', (select count(*) from public.merchants);
  raise notice 'Food items créés: %', (select count(*) from public.food_items);
  raise notice 'N''oubliez pas de créer les utilisateurs auth.users et d''adapter les user_id dans les tables profiles, orders, etc.';
end $$;
