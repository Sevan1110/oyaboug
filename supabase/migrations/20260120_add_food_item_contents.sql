-- Add contents column to food_items table for Mixed Baskets
-- This column stores the list of items inside a basket as a JSONB array
ALTER TABLE public.food_items 
ADD COLUMN IF NOT EXISTS contents JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.food_items.contents IS 'List of items inside a basket (for category mixed_basket). Stores array of {name, quantity, ...}';
