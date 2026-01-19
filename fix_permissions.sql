-- Fix RLS policies to allow editing
-- IMPORTANT: This allows ANYONE with the API key to edit data. 
-- In a production app with Auth, you would restrict this to logged-in users.

-- 1. Drop existing read-only policies to avoid conflicts (optional, but cleaner)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Public links are viewable by everyone." on links;

-- 2. Create full-access policies for Profiles
create policy "Enable all access for profiles" on profiles
  for all using (true) with check (true);

-- 3. Create full-access policies for Links
create policy "Enable all access for links" on links
  for all using (true) with check (true);
