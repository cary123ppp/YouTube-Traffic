-- Fix Storage RLS policies to allow uploads
-- This is necessary because "Public Bucket" only allows READ access, not WRITE.

-- 1. Enable RLS on objects (it should be enabled by default, but good to ensure)
-- alter table storage.objects enable row level security;

-- 2. Create policy to allow public uploads to 'Youtube images' bucket
create policy "Allow public uploads to Youtube images"
on storage.objects for insert
with check ( bucket_id = 'Youtube images' );

-- 3. Create policy to allow public updates (if you overwrite images)
create policy "Allow public updates to Youtube images"
on storage.objects for update
with check ( bucket_id = 'Youtube images' );

-- 4. Create policy to allow public reads (usually redundant if bucket is Public, but safe to add)
create policy "Allow public reads from Youtube images"
on storage.objects for select
using ( bucket_id = 'Youtube images' );
