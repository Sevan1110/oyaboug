-- Enable Admins to view ALL food items (active, inactive, sold out)
-- This overrides the "Anyone can view available food items" limitation for Admins.

create policy "Admins can view all food items"
  on public.food_items for select
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );
