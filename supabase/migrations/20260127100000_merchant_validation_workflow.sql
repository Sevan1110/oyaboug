-- ==========================================
-- Merchant Validation Workflow - Notifications
-- Date: 2026-01-27
-- Purpose: Automatically notify admins when a new merchant registers
-- ==========================================

BEGIN;

-- ==========================================
-- STEP 1: Function to Notify Admin
-- ==========================================

CREATE OR REPLACE FUNCTION public.notify_admin_new_merchant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_admin_user_id uuid;
BEGIN
  -- Only trigger for new merchant applications (no user_id yet)
  IF NEW.user_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Get all admin user IDs
  FOR v_admin_user_id IN 
    SELECT user_id FROM public.profiles WHERE role = 'admin'
  LOOP
    -- Insert notification for each admin
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      data,
      is_read,
      created_at
    )
    VALUES (
      v_admin_user_id,
      'merchant_pending',
      'Nouvelle demande marchand',
      format('Le commerce "%s" (%s, %s) demande à rejoindre la plateforme', 
        NEW.business_name, 
        NEW.business_type,
        NEW.city
      ),
      jsonb_build_object(
        'merchant_id', NEW.id,
        'business_name', NEW.business_name,
        'business_type', NEW.business_type,
        'email', NEW.email,
        'city', NEW.city,
        'phone', NEW.phone,
        'action_url', '/admin/validations'
      ),
      false,
      now()
    );
  END LOOP;

  -- Log the action
  RAISE LOG 'Admin notified for new merchant: % (ID: %)', NEW.business_name, NEW.id;

  RETURN NEW;
END;
$$;

-- ==========================================
-- STEP 2: Trigger on Merchant Insert
-- ==========================================

DROP TRIGGER IF EXISTS trigger_notify_admin_merchant ON public.merchants;

CREATE TRIGGER trigger_notify_admin_merchant
  AFTER INSERT ON public.merchants
  FOR EACH ROW
  WHEN (NEW.user_id IS NULL AND NEW.is_verified = false)
  EXECUTE FUNCTION public.notify_admin_new_merchant();

-- ==========================================
-- STEP 3: Add merchant_pending to notification types
-- ==========================================

-- Update the notification type check constraint if needed
-- This assumes the constraint exists from previous migrations
DO $$
BEGIN
  -- Check if the constraint exists and includes merchant_pending
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'notifications_type_check'
    AND contype = 'c'
    AND (
      pg_get_constraintdef(oid) LIKE '%merchant_pending%'
    )
  ) THEN
    -- Drop old constraint
    ALTER TABLE public.notifications 
      DROP CONSTRAINT IF EXISTS notifications_type_check;
    
    -- Add new constraint with merchant_pending
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_type_check
      CHECK (type IN (
        'order_confirmed',
        'order_ready',
        'order_cancelled',
        'new_food_nearby',
        'merchant_verified',
        'merchant_pending',
        'merchant_refused',
        'promotion',
        'system'
      ));
  END IF;
END $$;

-- ==========================================
-- STEP 4: Update RLS Policy for Notifications
-- ==========================================

-- Ensure merchants table allows anonymous inserts (already done in previous migration)
-- But let's verify the policy exists

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'merchants' 
    AND policyname = 'Enable insert for registration'
  ) THEN
    CREATE POLICY "Enable insert for registration"
      ON public.merchants
      FOR INSERT
      WITH CHECK (
        user_id IS NULL
        AND is_verified = false
        AND is_refused = false
      );
  END IF;
END $$;

COMMIT;

-- ==========================================
-- Migration Complete
-- ==========================================

-- Test query (run manually if needed):
-- SELECT * FROM public.notifications WHERE type = 'merchant_pending' ORDER BY created_at DESC LIMIT 5;
