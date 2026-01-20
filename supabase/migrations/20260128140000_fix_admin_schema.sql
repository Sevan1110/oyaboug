-- Add missing columns to merchants table
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refused_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refusal_reason TEXT;

-- Recreate admin_activities table with correct schema
DROP TABLE IF EXISTS admin_activities;

CREATE TABLE admin_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Optional foreign keys can be added here if needed, but keeping it loose for now
  -- admin_id UUID REFERENCES profiles(id),
  -- merchant_id UUID REFERENCES merchants(id)
  CONSTRAINT valid_activity_type CHECK (type IN ('merchant_registration', 'merchant_validated', 'merchant_refused', 'sale_completed', 'product_added', 'test_activity'))
);

-- Enable RLS
ALTER TABLE admin_activities ENABLE ROW LEVEL SECURITY;

-- Allow admins to insert and view
CREATE POLICY "Admins can view activities" 
ON admin_activities FOR SELECT 
TO authenticated 
USING (
  exists (
    select 1 from profiles 
    where profiles.user_id = auth.uid() 
    and profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can insert activities" 
ON admin_activities FOR INSERT 
TO authenticated 
WITH CHECK (
  exists (
    select 1 from profiles 
    where profiles.user_id = auth.uid() 
    and profiles.role = 'admin'
  )
);

-- Note: No update/delete policies for now, assuming audit log is append-only for admins.
