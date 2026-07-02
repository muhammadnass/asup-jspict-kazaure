-- =========================================================
-- ASUP Jigawa State Polytechnic ICT Kazaure — database schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor)
-- =========================================================

-- ---------- ADMINS ----------
-- Whitelist of auth.users allowed to write content. Sign the person
-- up normally via Supabase Auth, then add their user id here.
create table if not exists admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

-- ---------- MEMBERS ----------
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role text not null default 'Member',
  bio text not null default '',
  photo_url text,
  display_order int not null default 0,
  created_at timestamptz default now()
);

-- ---------- CONTENT POSTS (History / Struggles / Publications) ----------
create table if not exists content_posts (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('history', 'struggles', 'publications')),
  title text not null,
  body text not null default '',
  year int,
  published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- ARCHIVES (digitized hard-copy records) ----------
create table if not exists archive_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  document_url text not null,
  thumbnail_url text,
  record_date date,
  created_at timestamptz default now()
);

-- =========================================================
-- Row Level Security
-- Public visitors: read-only on published/public rows.
-- Admins (present in the `admins` table): full CRUD.
-- =========================================================

alter table admins enable row level security;
alter table members enable row level security;
alter table content_posts enable row level security;
alter table archive_items enable row level security;

-- Helper: is the current auth user an admin?
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- admins table: only admins can see the list; no public access needed.
create policy "admins can read admin list" on admins
  for select using (is_admin());

-- members: public can read, only admins can write
create policy "public read members" on members
  for select using (true);
create policy "admins write members" on members
  for insert with check (is_admin());
create policy "admins update members" on members
  for update using (is_admin());
create policy "admins delete members" on members
  for delete using (is_admin());

-- content_posts: public can read published rows, admins see/manage everything
create policy "public read published posts" on content_posts
  for select using (published = true or is_admin());
create policy "admins write posts" on content_posts
  for insert with check (is_admin());
create policy "admins update posts" on content_posts
  for update using (is_admin());
create policy "admins delete posts" on content_posts
  for delete using (is_admin());

-- archive_items: public can read, only admins can write
create policy "public read archives" on archive_items
  for select using (true);
create policy "admins write archives" on archive_items
  for insert with check (is_admin());
create policy "admins update archives" on archive_items
  for update using (is_admin());
create policy "admins delete archives" on archive_items
  for delete using (is_admin());

-- =========================================================
-- Storage buckets (create via Dashboard > Storage, or here)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('member-photos', 'member-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('archive-documents', 'archive-documents', true)
on conflict (id) do nothing;

-- Public read on both buckets
create policy "public read member photos" on storage.objects
  for select using (bucket_id = 'member-photos');
create policy "public read archive documents" on storage.objects
  for select using (bucket_id = 'archive-documents');

-- Only admins can upload/replace/delete files
create policy "admins upload member photos" on storage.objects
  for insert with check (bucket_id = 'member-photos' and is_admin());
create policy "admins modify member photos" on storage.objects
  for update using (bucket_id = 'member-photos' and is_admin());
create policy "admins delete member photos" on storage.objects
  for delete using (bucket_id = 'member-photos' and is_admin());

create policy "admins upload archive documents" on storage.objects
  for insert with check (bucket_id = 'archive-documents' and is_admin());
create policy "admins modify archive documents" on storage.objects
  for update using (bucket_id = 'archive-documents' and is_admin());
create policy "admins delete archive documents" on storage.objects
  for delete using (bucket_id = 'archive-documents' and is_admin());

-- =========================================================
-- After running this file:
-- 1. Go to Authentication > Users, create the admin's account
--    (email + password) — or have them sign up once via /admin/login
--    if you enable self sign-up temporarily.
-- 2. Copy their user id, then run:
--    insert into admins (user_id, full_name) values ('paste-uuid-here', 'Admin Name');
-- =========================================================
