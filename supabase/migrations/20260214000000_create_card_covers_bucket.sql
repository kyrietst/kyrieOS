-- Create a new storage bucket for card covers
insert into storage.buckets (id, name, public)
values ('card-covers', 'card-covers', true)
on conflict (id) do nothing;

-- Set up RLS policies for the bucket
-- 1. Allow public read access (so covers can be displayed)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'card-covers' );

-- 2. Allow authenticated users to upload files
create policy "Authenticated Insert"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'card-covers' );

-- 3. Allow authenticated users to update/delete their own files (or any file for simplicity in this MVP)
-- Note: "using" clause checks existing rows, "with check" checks new rows
create policy "Authenticated Update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'card-covers' );

create policy "Authenticated Delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'card-covers' );
