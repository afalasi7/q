insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('videos', 'videos', false, 524288000, array['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm']),
  ('exports', 'exports', false, 524288000, array['video/mp4']),
  ('thumbnails', 'thumbnails', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('music', 'music', true, 52428800, array['audio/mpeg', 'audio/mp4', 'audio/wav']),
  ('template-assets', 'template-assets', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "videos_insert_own" on storage.objects;
create policy "videos_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'videos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "videos_read_own" on storage.objects;
create policy "videos_read_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'videos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "exports_insert_own" on storage.objects;
create policy "exports_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'exports'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "exports_read_own" on storage.objects;
create policy "exports_read_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'exports'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "thumbnails_insert_own" on storage.objects;
create policy "thumbnails_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'thumbnails'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "thumbnails_public_read" on storage.objects;
create policy "thumbnails_public_read"
on storage.objects
for select
to public
using (bucket_id in ('thumbnails', 'music', 'template-assets'));
