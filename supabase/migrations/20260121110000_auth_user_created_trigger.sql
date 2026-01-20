-- ==========================================
-- Automatic Profile Creation for Auth Users
-- ==========================================

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email, role, full_name, phone)
  values (
    new.id,
    new.email,
    case 
      when new.email = 'sevankedesh11@gmail.com' then 'admin'
      else coalesce(new.raw_user_meta_data->>'role', 'user')
    end,
    new.raw_user_meta_data->>'full_name',
    new.phone
  )
  on conflict (user_id) do update set
    role = excluded.role,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    phone = coalesce(public.profiles.phone, excluded.phone);
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- Trigger to run after a new user is created in auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
