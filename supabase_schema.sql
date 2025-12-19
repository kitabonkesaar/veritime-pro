-- ==============================================================================
-- Supabase Schema for VeriTime Pro
-- ==============================================================================
-- Instructions:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/igchmamvzfidfseqgfwl
-- 2. Click on the "SQL Editor" tab (icon looks like a terminal/code file).
-- 3. Click "New Query".
-- 4. Paste the content of this file into the query editor.
-- 5. Click "Run" to apply the schema.
-- ==============================================================================

-- 1. PROFILES TABLE
-- Linked to auth.users, stores extra user details
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text check (role in ('admin', 'employee')) default 'employee',
  hourly_rate numeric default 0,
  trip_rate numeric default 0,
  monthly_salary numeric default 0,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add trip_rate column if it doesn't exist (migration for existing tables)
do $$ begin
  alter table public.profiles add column trip_rate numeric default 0;
exception when duplicate_column then null; end $$;

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
do $$ begin
  create policy "Public profiles are viewable by everyone."
    on profiles for select using ( true );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert their own profile."
    on profiles for insert with check ( auth.uid() = id );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update own profile."
    on profiles for update using ( auth.uid() = id );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can update any profile"
    on profiles for update using ( 
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
      )
    );
exception when duplicate_object then null; end $$;


-- 2. ATTENDANCE LOGS TABLE
create table if not exists public.attendance_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  clock_in_time timestamptz,
  clock_in_photo_url text,
  clock_out_time timestamptz,
  clock_out_photo_url text,
  total_hours numeric,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.attendance_logs enable row level security;

-- Policies for Attendance Logs
do $$ begin
  create policy "Users can view their own logs"
    on attendance_logs for select using ( auth.uid() = user_id );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can view all logs"
    on attendance_logs for select using ( 
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert their own logs"
    on attendance_logs for insert with check ( auth.uid() = user_id );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update their own logs"
    on attendance_logs for update using ( auth.uid() = user_id );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can delete logs"
    on attendance_logs for delete using (
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
      )
    );
exception when duplicate_object then null; end $$;


-- 3. PAYROLL RECORDS TABLE
create table if not exists public.payroll_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  month text not null, -- Format: YYYY-MM
  total_hours numeric default 0,
  regular_pay numeric default 0,
  overtime_hours numeric default 0,
  overtime_pay numeric default 0,
  gross_pay numeric default 0,
  status text check (status in ('generated', 'paid')) default 'generated',
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.payroll_records enable row level security;

-- Policies for Payroll Records
do $$ begin
  create policy "Users can view their own payroll"
    on payroll_records for select using ( auth.uid() = user_id );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can view all payroll records"
    on payroll_records for select using ( 
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can manage payroll records"
    on payroll_records for all using ( 
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
      )
    );
exception when duplicate_object then null; end $$;


-- 4. APP SETTINGS TABLE (Singleton)
create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  company_name text default 'My Company',
  working_hours_start time default '09:00:00',
  working_hours_end time default '17:00:00',
  overtime_rate numeric default 1.5,
  auto_checkout boolean default true,
  auto_checkout_time time default '23:00:00',
  notifications_enabled boolean default true,
  require_photo boolean default true,
  updated_at timestamptz default now()
);

-- Insert default settings if not exists
insert into public.app_settings (id) values (1) on conflict (id) do nothing;

-- Enable RLS
alter table public.app_settings enable row level security;

-- Policies for App Settings
do $$ begin
  create policy "Settings are viewable by everyone"
    on app_settings for select using ( true );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can update settings"
    on app_settings for update using ( 
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
      )
    );
exception when duplicate_object then null; end $$;


-- 5. STORAGE BUCKETS
insert into storage.buckets (id, name, public) 
values ('attendance-photos', 'attendance-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage Policies (attendance-photos)
do $$ begin
  create policy "Attendance photos are publicly accessible"
    on storage.objects for select using ( bucket_id = 'attendance-photos' );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can upload attendance photos"
    on storage.objects for insert with check ( bucket_id = 'attendance-photos' and auth.uid() = owner );
exception when duplicate_object then null; end $$;

-- Storage Policies (avatars)
do $$ begin
  create policy "Avatars are publicly accessible"
    on storage.objects for select using ( bucket_id = 'avatars' );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can upload their own avatar"
    on storage.objects for insert with check ( bucket_id = 'avatars' and auth.uid() = owner );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update their own avatar"
    on storage.objects for update using ( bucket_id = 'avatars' and auth.uid() = owner );
exception when duplicate_object then null; end $$;


-- 6. TRIGGERS & FUNCTIONS

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update 'updated_at' timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for profiles
drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Trigger for app_settings
drop trigger if exists on_settings_updated on public.app_settings;
create trigger on_settings_updated
  before update on public.app_settings
  for each row execute procedure public.handle_updated_at();
