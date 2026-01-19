-- Fix RLS policy for order cancellation - Version 2
-- This migration explicitly allows users to cancel their own orders

-- First, drop ALL existing update policies for orders
DROP POLICY IF EXISTS "Users can update own pending orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

-- Create a comprehensive policy that allows:
-- 1. Users to update their own orders when status is pending or confirmed
-- 2. This includes changing status to cancelled
CREATE POLICY "users_update_own_orders_v2"
  ON public.orders
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status IN ('pending', 'confirmed')
  );

-- Note: The USING clause checks the CURRENT state (before update)
-- This allows the update to proceed if the order is currently pending or confirmed
-- The user can then change it to cancelled
