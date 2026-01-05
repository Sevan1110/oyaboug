-- ============================================
-- Combined Migration Script - Execute in Supabase SQL Editor
-- Oyaboung Platform - Anti-gaspillage alimentaire
-- Date: 2026-01-04
-- ============================================

-- This script combines both migration files for easy execution
-- Execute this in your Supabase project's SQL Editor

-- ============================================
-- PART 1: INITIAL SCHEMA (from 20260104000000_initial_schema.sql)
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('user', 'merchant', 'admin')) DEFAULT 'user',
  address TEXT,
  city TEXT,
  quartier TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  preferences JSONB DEFAULT '{
    "notifications_enabled": true,
    "email_notifications": true,
    "sms_notifications": false,
    "favorite_categories": [],
    "max_distance_km": 10
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. MERCHANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.merchants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT CHECK (business_type IN (
    'restaurant', 'bakery', 'grocery', 'supermarket',
    'hotel', 'caterer', 'other'
  )) NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  quartier TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  opening_hours JSONB,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================
-- 3. FOOD_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.food_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN (
    'bread_pastry', 'prepared_meals', 'fruits_vegetables',
    'dairy', 'meat_fish', 'beverages', 'snacks',
    'mixed_basket', 'other'
  )) NOT NULL,
  original_price INTEGER NOT NULL CHECK (original_price > 0), -- in XAF
  discounted_price INTEGER NOT NULL CHECK (discounted_price > 0), -- in XAF
  discount_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    ROUND(((original_price - discounted_price)::DECIMAL / original_price) * 100, 2)
  ) STORED,
  quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
  quantity_initial INTEGER NOT NULL CHECK (quantity_initial > 0),
  image_url TEXT,
  images TEXT[],
  pickup_start TIME NOT NULL,
  pickup_end TIME NOT NULL,
  expiry_date DATE,
  is_available BOOLEAN DEFAULT true,
  badges TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (discounted_price <= original_price),
  CHECK (quantity_available <= quantity_initial),
  CHECK (pickup_start < pickup_end)
);

-- ============================================
-- 4. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price INTEGER NOT NULL CHECK (total_price > 0), -- in XAF
  original_total INTEGER NOT NULL CHECK (original_total > 0), -- in XAF
  savings INTEGER GENERATED ALWAYS AS (original_total - total_price) STORED, -- in XAF
  status TEXT CHECK (status IN (
    'pending', 'confirmed', 'ready', 'picked_up', 'completed', 'cancelled', 'no_show'
  )) DEFAULT 'pending',
  pickup_code TEXT UNIQUE,
  pickup_time TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. PRICING_RECOMMENDATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pricing_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  original_price INTEGER NOT NULL,
  recommended_price INTEGER NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  factors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(food_item_id)
);

-- ============================================
-- 6. USER_FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (
    (merchant_id IS NOT NULL AND food_item_id IS NULL) OR
    (merchant_id IS NULL AND food_item_id IS NOT NULL)
  ),
  UNIQUE(user_id, merchant_id),
  UNIQUE(user_id, food_item_id)
);

-- ============================================
-- 7. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN (
    'order_status', 'new_item', 'merchant_nearby', 'promotion', 'system'
  )) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. IMPACT_STATS TABLE (Global stats)
-- ============================================
CREATE TABLE IF NOT EXISTS public.impact_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_food_saved_kg DECIMAL(10,2) DEFAULT 0,
  total_money_saved_xaf INTEGER DEFAULT 0,
  total_co2_avoided_kg DECIMAL(10,2) DEFAULT 0,
  total_meals_saved INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_active_merchants INTEGER DEFAULT 0,
  total_active_users INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. USER_IMPACT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_impact (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  food_saved_kg DECIMAL(8,2) DEFAULT 0,
  money_saved_xaf INTEGER DEFAULT 0,
  co2_avoided_kg DECIMAL(8,2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);

-- ============================================
-- 10. MERCHANT_IMPACT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.merchant_impact (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  food_saved_kg DECIMAL(8,2) DEFAULT 0,
  revenue_from_waste_xaf INTEGER DEFAULT 0,
  co2_avoided_kg DECIMAL(8,2) DEFAULT 0,
  orders_fulfilled INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  waste_reduction_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(merchant_id, date)
);

-- ============================================
-- PART 2: ADDITIONAL TABLES (from 20260104000001_additional_tables.sql)
-- ============================================

-- ============================================
-- 1. ADMIN_ACTIVITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT CHECK (action IN (
    'merchant_validated', 'merchant_refused', 'merchant_suspended',
    'user_banned', 'user_unbanned', 'system_config_updated',
    'report_generated', 'bulk_action_performed'
  )) NOT NULL,
  target_type TEXT CHECK (target_type IN ('merchant', 'user', 'system')) NOT NULL,
  target_id UUID,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  response TEXT, -- Merchant response
  response_at TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, order_id)
);

-- ============================================
-- 3. IMPACT_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.impact_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  action TEXT CHECK (action IN (
    'food_saved', 'waste_prevented', 'co2_reduced', 'order_completed',
    'merchant_joined', 'user_joined', 'food_item_added'
  )) NOT NULL,
  quantity_kg DECIMAL(8,2),
  co2_kg DECIMAL(8,2),
  money_saved_xaf INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. PRICING_HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pricing_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  original_price INTEGER NOT NULL,
  discounted_price INTEGER NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL,
  reason TEXT CHECK (reason IN (
    'time_based', 'quantity_based', 'seasonal', 'manual', 'ai_recommended'
  )) NOT NULL,
  ai_confidence DECIMAL(3,2),
  factors JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. USER_ROLES TABLE (for complex role management)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'moderator', 'merchant', 'user')) NOT NULL,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  UNIQUE(user_id, role)
);

-- ============================================
-- UPDATE MERCHANTS TABLE (add missing fields for admin)
-- ============================================
ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS is_refused BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refused_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refusal_reason TEXT,
ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS refused_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS siret TEXT,
ADD COLUMN IF NOT EXISTS owner_name TEXT;

-- ============================================
-- INDEXES (only create if they don't exist)
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city_quartier ON public.profiles(city, quartier);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING gist (point(longitude, latitude));

-- Merchants indexes
CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON public.merchants(user_id);
CREATE INDEX IF NOT EXISTS idx_merchants_business_type ON public.merchants(business_type);
CREATE INDEX IF NOT EXISTS idx_merchants_city_quartier ON public.merchants(city, quartier);
CREATE INDEX IF NOT EXISTS idx_merchants_location ON public.merchants USING gist (point(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_merchants_is_verified ON public.merchants(is_verified);
CREATE INDEX IF NOT EXISTS idx_merchants_is_active ON public.merchants(is_active);

-- Food items indexes
CREATE INDEX IF NOT EXISTS idx_food_items_merchant_id ON public.food_items(merchant_id);
CREATE INDEX IF NOT EXISTS idx_food_items_category ON public.food_items(category);
CREATE INDEX IF NOT EXISTS idx_food_items_is_available ON public.food_items(is_available);
CREATE INDEX IF NOT EXISTS idx_food_items_pickup_time ON public.food_items(pickup_start, pickup_end);
CREATE INDEX IF NOT EXISTS idx_food_items_created_at ON public.food_items(created_at DESC);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON public.orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_food_item_id ON public.orders(food_item_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_code ON public.orders(pickup_code);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_merchant_id ON public.user_favorites(merchant_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_food_item_id ON public.user_favorites(food_item_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Additional tables indexes
CREATE INDEX IF NOT EXISTS idx_admin_activities_admin_id ON public.admin_activities(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activities_action ON public.admin_activities(action);
CREATE INDEX IF NOT EXISTS idx_admin_activities_target_type ON public.admin_activities(target_type);
CREATE INDEX IF NOT EXISTS idx_admin_activities_created_at ON public.admin_activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_merchant_id ON public.reviews(merchant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_food_item_id ON public.reviews(food_item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_impact_logs_user_id ON public.impact_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_impact_logs_merchant_id ON public.impact_logs(merchant_id);
CREATE INDEX IF NOT EXISTS idx_impact_logs_order_id ON public.impact_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_impact_logs_action ON public.impact_logs(action);
CREATE INDEX IF NOT EXISTS idx_impact_logs_created_at ON public.impact_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pricing_history_food_item_id ON public.pricing_history(food_item_id);
CREATE INDEX IF NOT EXISTS idx_pricing_history_created_at ON public.pricing_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON public.user_roles(is_active);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables (skip if already enabled)
DO $$ BEGIN
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.pricing_recommendations ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.impact_stats ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.user_impact ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.merchant_impact ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.impact_logs ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.pricing_history ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

-- ============================================
-- RLS POLICIES (drop and recreate to avoid conflicts)
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Merchants policies
DROP POLICY IF EXISTS "Anyone can view active merchants" ON public.merchants;
DROP POLICY IF EXISTS "Merchants can view their own merchant profile" ON public.merchants;
DROP POLICY IF EXISTS "Merchants can update their own merchant profile" ON public.merchants;
DROP POLICY IF EXISTS "Users can create merchant profiles" ON public.merchants;

CREATE POLICY "Anyone can view active merchants" ON public.merchants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Merchants can view their own merchant profile" ON public.merchants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Merchants can update their own merchant profile" ON public.merchants
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can create merchant profiles" ON public.merchants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Food items policies
DROP POLICY IF EXISTS "Anyone can view available food items" ON public.food_items;
DROP POLICY IF EXISTS "Merchants can view their own food items" ON public.food_items;
DROP POLICY IF EXISTS "Merchants can manage their own food items" ON public.food_items;

CREATE POLICY "Anyone can view available food items" ON public.food_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Merchants can view their own food items" ON public.food_items
  FOR SELECT USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Merchants can manage their own food items" ON public.food_items
  FOR ALL USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

-- Orders policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their pending orders" ON public.orders;
DROP POLICY IF EXISTS "Merchants can view orders for their items" ON public.orders;
DROP POLICY IF EXISTS "Merchants can update order status" ON public.orders;

CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their pending orders" ON public.orders
  FOR UPDATE USING (user_id = auth.uid() AND status IN ('pending', 'confirmed'));

CREATE POLICY "Merchants can view orders for their items" ON public.orders
  FOR SELECT USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Merchants can update order status" ON public.orders
  FOR UPDATE USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

-- Favorites policies
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.user_favorites;

CREATE POLICY "Users can manage their own favorites" ON public.user_favorites
  FOR ALL USING (user_id = auth.uid());

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Impact stats policies (read-only for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can view impact stats" ON public.impact_stats;

CREATE POLICY "Authenticated users can view impact stats" ON public.impact_stats
  FOR SELECT TO authenticated USING (true);

-- User impact policies
DROP POLICY IF EXISTS "Users can view their own impact" ON public.user_impact;

CREATE POLICY "Users can view their own impact" ON public.user_impact
  FOR SELECT USING (user_id = auth.uid());

-- Merchant impact policies
DROP POLICY IF EXISTS "Merchants can view their own impact" ON public.merchant_impact;

CREATE POLICY "Merchants can view their own impact" ON public.merchant_impact
  FOR SELECT USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

-- Admin activities policies
DROP POLICY IF EXISTS "Admins can view all admin activities" ON public.admin_activities;
DROP POLICY IF EXISTS "Admins can insert admin activities" ON public.admin_activities;

CREATE POLICY "Admins can view all admin activities" ON public.admin_activities
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert admin activities" ON public.admin_activities
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Reviews policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews for their completed orders" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Merchants can respond to reviews of their items" ON public.reviews;

CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their completed orders" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = auth.uid() AND status = 'completed'
    )
  );

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Merchants can respond to reviews of their items" ON public.reviews
  FOR UPDATE TO authenticated USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

-- Impact logs policies (read-only for authenticated users)
DROP POLICY IF EXISTS "Authenticated users can view impact logs" ON public.impact_logs;
DROP POLICY IF EXISTS "System can insert impact logs" ON public.impact_logs;

CREATE POLICY "Authenticated users can view impact logs" ON public.impact_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert impact logs" ON public.impact_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Pricing history policies
DROP POLICY IF EXISTS "Merchants can view pricing history for their items" ON public.pricing_history;
DROP POLICY IF EXISTS "System can insert pricing history" ON public.pricing_history;

CREATE POLICY "Merchants can view pricing history for their items" ON public.pricing_history
  FOR SELECT TO authenticated USING (
    food_item_id IN (
      SELECT id FROM public.food_items
      WHERE merchant_id IN (
        SELECT id FROM public.merchants WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert pricing history" ON public.pricing_history
  FOR INSERT TO authenticated WITH CHECK (true);

-- User roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to generate pickup codes
CREATE OR REPLACE FUNCTION generate_pickup_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    -- Generate a 6-character alphanumeric code
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    -- Check if it already exists
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE pickup_code = code) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_merchants_updated_at ON public.merchants;
DROP TRIGGER IF EXISTS update_food_items_updated_at ON public.food_items;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_impact_stats_updated_at ON public.impact_stats;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchants_updated_at
  BEFORE UPDATE ON public.merchants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_items_updated_at
  BEFORE UPDATE ON public.food_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impact_stats_updated_at
  BEFORE UPDATE ON public.impact_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to generate pickup code for new orders
CREATE OR REPLACE FUNCTION set_pickup_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' AND NEW.pickup_code IS NULL THEN
    NEW.pickup_code := generate_pickup_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_pickup_code_on_confirm ON public.orders;

CREATE TRIGGER generate_pickup_code_on_confirm
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION set_pickup_code();

-- Trigger to set timestamps based on status changes
CREATE OR REPLACE FUNCTION update_order_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    NEW.confirmed_at := NOW();
  ELSIF NEW.status = 'picked_up' AND OLD.status != 'picked_up' THEN
    NEW.picked_up_at := NOW();
  ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_order_timestamps_trigger ON public.orders;

CREATE TRIGGER update_order_timestamps_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_order_timestamps();

-- Function to update review counts on merchants
CREATE OR REPLACE FUNCTION update_merchant_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update merchant rating and review count
  UPDATE public.merchants
  SET
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE merchant_id = COALESCE(NEW.merchant_id, OLD.merchant_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE merchant_id = COALESCE(NEW.merchant_id, OLD.merchant_id)
    )
  WHERE id = COALESCE(NEW.merchant_id, OLD.merchant_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_merchant_rating_on_review ON public.reviews;

CREATE TRIGGER update_merchant_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_merchant_rating();

-- Function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_admin_id UUID,
  p_action TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.admin_activities (
    admin_id, action, target_type, target_id,
    description, metadata, ip_address, user_agent
  ) VALUES (
    p_admin_id, p_action, p_target_type, p_target_id,
    p_description, p_metadata, p_ip_address, p_user_agent
  ) RETURNING id INTO activity_id;

  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log impact events
CREATE OR REPLACE FUNCTION log_impact_event(
  p_user_id UUID DEFAULT NULL,
  p_merchant_id UUID DEFAULT NULL,
  p_order_id UUID DEFAULT NULL,
  p_action TEXT,
  p_quantity_kg DECIMAL DEFAULT NULL,
  p_co2_kg DECIMAL DEFAULT NULL,
  p_money_saved_xaf INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.impact_logs (
    user_id, merchant_id, order_id, action,
    quantity_kg, co2_kg, money_saved_xaf, metadata
  ) VALUES (
    p_user_id, p_merchant_id, p_order_id, p_action,
    p_quantity_kg, p_co2_kg, p_money_saved_xaf, p_metadata
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert initial impact stats for today
INSERT INTO public.impact_stats (date, total_food_saved_kg, total_money_saved_xaf, total_co2_avoided_kg, total_meals_saved, total_orders, total_active_merchants, total_active_users)
VALUES (CURRENT_DATE, 0, 0, 0, 0, 0, 0, 0)
ON CONFLICT (date) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All tables and configurations have been successfully created/updated!';
  RAISE NOTICE '🌐 Your Oyaboung database is now ready for the anti-waste platform.';
END $$;</content>
<parameter name="filePath">c:\Users\Sevan\Desktop\Projects\IFUMB\oyaboug\food\supabase\complete_migration.sql