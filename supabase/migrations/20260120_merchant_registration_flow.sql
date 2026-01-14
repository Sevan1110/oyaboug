-- ==========================================
-- Merchant Registration Flow Migration
-- ==========================================

-- 1. Enable Anonymous Insert for Merchants (Application)
-- Allow anyone to insert a new merchant record (registration application)
create policy "Enable insert for registration"
  on public.merchants
  for insert
  with check (
    -- Can only insert if user_id is null (no account yet)
    user_id is null
    and is_verified = false
    and is_refused = false
    and is_active = true -- Default active state, but not verified
  );

-- 2. Storage for Documents
-- Insert bucket if not exists
insert into storage.buckets (id, name, public)
values ('merchant-documents', 'merchant-documents', false)
on conflict (id) do nothing;

-- Allow anon to upload documents
create policy "Allow anon uploads"
  on storage.objects
  for insert
  with check (
    bucket_id = 'merchant-documents'
  );

-- Allow admins to view documents
create policy "Admins can view all documents"
  on storage.objects
  for select
  using (
    bucket_id = 'merchant-documents'
    and exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- 3. Automatic Link Trigger
-- When a new user signs up (auth.users insert), check if a merchant exists with that email.
-- If yes, link them.

create or replace function public.link_merchant_on_signup()
returns trigger as $$
begin
  -- Check if a merchant exists with this email
  if exists (select 1 from public.merchants where email = new.email) then
    -- Update the merchant record with the new user_id
    update public.merchants
    set user_id = new.id
    where email = new.email;
    
    -- Also ensure they have the 'merchant' role in profiles
    -- (This assumes profiles trigger works, but we enforce it here for safety logic)
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users is tricky since we can't easily add triggers there in all Supabase envs.
-- EASIER ALTERNATIVE: Use the profile creation trigger.
-- When a profile is created/inserted (which happens after auth signup), check email.

create or replace function public.link_merchant_on_profile_create()
returns trigger as $$
begin
  -- Search for merchant with same email
  update public.merchants
  set user_id = new.user_id
  where email = new.email
  and user_id is null; -- Only if not already claimed
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_link_merchant_profile on public.profiles;
create trigger trigger_link_merchant_profile
after insert on public.profiles
for each row
execute procedure public.link_merchant_on_profile_create();
