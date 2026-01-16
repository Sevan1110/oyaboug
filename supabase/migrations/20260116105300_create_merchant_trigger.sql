-- Create a function to handle new user verification and profile creation
create or replace function public.handle_new_user()
returns trigger
security definer
as $$
begin
  -- If the user role is 'merchant', create a merchant profile
  if new.raw_user_meta_data->>'role' = 'merchant' then
    insert into public.merchants (
      user_id,
      email,
      business_name,
      business_type,
      description,
      phone,
      address,
      city,
      quartier,
      latitude,
      longitude,
      logo_url,
      is_verified,
      is_active,
      is_refused
    )
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'business_name', 'Nouveau Commerce'),
      coalesce(new.raw_user_meta_data->>'business_type', 'other'),
      coalesce(new.raw_user_meta_data->>'description', ''),
      coalesce(new.raw_user_meta_data->>'phone', ''),
      coalesce(new.raw_user_meta_data->>'address', 'À compléter'),
      coalesce(new.raw_user_meta_data->>'city', 'Libreville'),
      coalesce(new.raw_user_meta_data->>'quartier', 'À compléter'),
      (new.raw_user_meta_data->>'latitude')::float,
      (new.raw_user_meta_data->>'longitude')::float,
      new.raw_user_meta_data->>'logo_url',
      false, -- is_verified default
      false, -- is_active default (waiting for validation)
      false  -- is_refused default
    );
  end if;

  -- You can add logic here for regular users if needed (e.g. creating a public.profiles entry)
  
  return new;
end;
$$ language plpgsql;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
