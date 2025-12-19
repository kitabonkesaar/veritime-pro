-- Add trip_rate column if it doesn't exist
do $$ begin
  alter table public.profiles add column trip_rate numeric default 0;
exception when duplicate_column then null; end $$;

-- Ensure RLS policies allow admins to update profiles
drop policy if exists "Admins can update any profile" on profiles;
create policy "Admins can update any profile"
  on profiles for update using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
