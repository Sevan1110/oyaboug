-- ============================================
-- Additional Tables Migration
-- Oyaboung Platform - Anti-gaspillage alimentaire
-- Date: 2026-01-04
-- ============================================

-- ============================================
-- 1. ADMIN_ACTIVITIES TABLE
-- ============================================
CREATE TABLE public.admin_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE public.impact_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE public.pricing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
-- INDEXES FOR NEW TABLES
-- ============================================

-- Admin activities indexes
CREATE INDEX idx_admin_activities_admin_id ON public.admin_activities(admin_id);
CREATE INDEX idx_admin_activities_action ON public.admin_activities(action);
CREATE INDEX idx_admin_activities_target_type ON public.admin_activities(target_type);
CREATE INDEX idx_admin_activities_created_at ON public.admin_activities(created_at DESC);

-- Reviews indexes
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_merchant_id ON public.reviews(merchant_id);
CREATE INDEX idx_reviews_food_item_id ON public.reviews(food_item_id);
CREATE INDEX idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

-- Impact logs indexes
CREATE INDEX idx_impact_logs_user_id ON public.impact_logs(user_id);
CREATE INDEX idx_impact_logs_merchant_id ON public.impact_logs(merchant_id);
CREATE INDEX idx_impact_logs_order_id ON public.impact_logs(order_id);
CREATE INDEX idx_impact_logs_action ON public.impact_logs(action);
CREATE INDEX idx_impact_logs_created_at ON public.impact_logs(created_at DESC);

-- Pricing history indexes
CREATE INDEX idx_pricing_history_food_item_id ON public.pricing_history(food_item_id);
CREATE INDEX idx_pricing_history_created_at ON public.pricing_history(created_at DESC);

-- User roles indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_roles_is_active ON public.user_roles(is_active);

-- ============================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Admin activities policies
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
CREATE POLICY "Authenticated users can view impact logs" ON public.impact_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert impact logs" ON public.impact_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Pricing history policies
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
-- FUNCTIONS AND TRIGGERS FOR NEW TABLES
-- ============================================

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

CREATE TRIGGER update_merchant_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_merchant_rating();

-- Function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_admin_id UUID,
  p_action TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT '',
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
  p_action TEXT DEFAULT 'unknown',
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
-- INITIAL DATA FOR NEW TABLES
-- ============================================

-- Insert default super admin role (will be updated with actual user ID)
-- This should be run after creating the first admin user
-- INSERT INTO public.user_roles (user_id, role, granted_by)
-- SELECT id, 'super_admin', id FROM public.profiles WHERE email = 'admin@oyaboung.com' LIMIT 1;
