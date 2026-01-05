-- ============================================
-- Initial Migration - Oyaboung Platform
-- Anti-gaspillage alimentaire - Gabon
-- Date: 2026-01-04
-- ============================================

-- Enable necessary extensions
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Not needed, using gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
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
CREATE TABLE public.merchants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE public.food_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE public.pricing_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE public.user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE public.impact_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE public.user_impact (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE public.merchant_impact (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_city_quartier ON public.profiles(city, quartier);
CREATE INDEX idx_profiles_location ON public.profiles USING gist (point(longitude, latitude));

-- Merchants indexes
CREATE INDEX idx_merchants_user_id ON public.merchants(user_id);
CREATE INDEX idx_merchants_business_type ON public.merchants(business_type);
CREATE INDEX idx_merchants_city_quartier ON public.merchants(city, quartier);
CREATE INDEX idx_merchants_location ON public.merchants USING gist (point(longitude, latitude));
CREATE INDEX idx_merchants_is_verified ON public.merchants(is_verified);
CREATE INDEX idx_merchants_is_active ON public.merchants(is_active);

-- Food items indexes
CREATE INDEX idx_food_items_merchant_id ON public.food_items(merchant_id);
CREATE INDEX idx_food_items_category ON public.food_items(category);
CREATE INDEX idx_food_items_is_available ON public.food_items(is_available);
CREATE INDEX idx_food_items_pickup_time ON public.food_items(pickup_start, pickup_end);
CREATE INDEX idx_food_items_created_at ON public.food_items(created_at DESC);

-- Orders indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_merchant_id ON public.orders(merchant_id);
CREATE INDEX idx_orders_food_item_id ON public.orders(food_item_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_pickup_code ON public.orders(pickup_code);

-- Favorites indexes
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_merchant_id ON public.user_favorites(merchant_id);
CREATE INDEX idx_user_favorites_food_item_id ON public.user_favorites(food_item_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_impact ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_impact ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Merchants policies
CREATE POLICY "Anyone can view active merchants" ON public.merchants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Merchants can view their own merchant profile" ON public.merchants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Merchants can update their own merchant profile" ON public.merchants
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can create merchant profiles" ON public.merchants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Food items policies
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
CREATE POLICY "Users can manage their own favorites" ON public.user_favorites
  FOR ALL USING (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Impact stats policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view impact stats" ON public.impact_stats
  FOR SELECT TO authenticated USING (true);

-- User impact policies
CREATE POLICY "Users can view their own impact" ON public.user_impact
  FOR SELECT USING (user_id = auth.uid());

-- Merchant impact policies
CREATE POLICY "Merchants can view their own impact" ON public.merchant_impact
  FOR SELECT USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
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

CREATE TRIGGER update_order_timestamps_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_order_timestamps();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert initial impact stats for today
INSERT INTO public.impact_stats (date, total_food_saved_kg, total_money_saved_xaf, total_co2_avoided_kg, total_meals_saved, total_orders, total_active_merchants, total_active_users)
VALUES (CURRENT_DATE, 0, 0, 0, 0, 0, 0, 0)
ON CONFLICT (date) DO NOTHING;
