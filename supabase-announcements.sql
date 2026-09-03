-- Run this in the Supabase SQL editor before using the announcements tab.
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  pdf_url text,
  is_published boolean not null default true,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "Students can view published announcements"
  on public.announcements for select
  to authenticated
  using (is_published = true or exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  ));

create policy "Admins can create announcements"
  on public.announcements for insert
  to authenticated
  with check (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  ) and created_by = auth.uid());

create policy "Admins can update announcements"
  on public.announcements for update
  to authenticated
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  ));

create policy "Admins can delete announcements"
  on public.announcements for delete
  to authenticated
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  ));

-- The existing campus-images bucket is reused for PDFs. If it is private in your
-- project, configure a signed URL instead of getPublicUrl in AdminDashboard.tsx.
insert into storage.buckets (id, name, public)
values ('campus-images', 'campus-images', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload announcement PDFs"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'campus-images' and (storage.foldername(name))[1] = 'announcements');