-- Create Profiles table
create table profiles (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  slug text unique not null,
  name text not null,
  bio text,
  avatar_url text,
  theme jsonb default '{"background": "from-purple-500 via-rose-500 to-orange-500", "cardStyle": "glass"}'::jsonb
);

-- Create Links table
create table links (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  subtitle text,
  url text not null,
  icon text,
  featured boolean default false,
  sort_order integer default 0
);

-- Enable RLS (Row Level Security)
alter table profiles enable row level security;
alter table links enable row level security;

-- Create policies (Allow Public Read, Restrict Write to Authenticated)
-- For simplicity in this demo, we will allow anonymous insert/update for now if you want to test from admin without login,
-- BUT best practice is to restrict write.
-- Let's set public read for everyone.
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Public links are viewable by everyone." on links
  for select using (true);

-- Insert sample data (FireStick Guide Pro)
insert into profiles (slug, name, bio, avatar_url, theme)
values
  ('firestick-guide', 'FireStick Guide Pro', 'Unlock the beauty of life.', '/avatar.svg', '{"background": "from-purple-500 via-rose-500 to-orange-500", "cardStyle": "glass"}');

-- Insert sample links for FireStick
insert into links (profile_id, title, subtitle, url, icon, featured, sort_order)
select id, '📺 IPTV Free Trial (24h)', 'High speed, 4K supported, No buffering', 'https://example.com/iptv-trial', 'PlayCircle', true, 1
from profiles where slug = 'firestick-guide';

insert into links (profile_id, title, subtitle, url, icon, featured, sort_order)
select id, '🔑 Software License Deals', 'Get 50% off on premium software', 'https://example.com/software', 'Key', true, 2
from profiles where slug = 'firestick-guide';

-- Insert sample data (Tech Daily)
insert into profiles (slug, name, bio, avatar_url, theme)
values
  ('tech-review', 'Tech Daily', 'Daily reviews of the latest gadgets.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechDaily', '{"background": "from-blue-500 to-cyan-500", "cardStyle": "glass"}');

-- Insert sample links for Tech Daily
insert into links (profile_id, title, url, icon, featured, sort_order)
select id, '📱 Best Smartphones 2024', 'https://example.com/phones', 'Smartphone', false, 1
from profiles where slug = 'tech-review';

insert into links (profile_id, title, url, icon, featured, sort_order)
select id, '💻 Laptop Deals', 'https://example.com/laptops', 'Laptop', true, 2
from profiles where slug = 'tech-review';
