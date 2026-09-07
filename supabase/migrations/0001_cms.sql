-- ============================================================
-- Kingsmere Property — CMS migration
-- Run this entire file ONCE in the Supabase SQL editor
-- (Dashboard → SQL → New query → paste → Run)
-- Safe to re-run: everything is IF NOT EXISTS / ON CONFLICT.
-- ============================================================

-- 1. Editable site content (one JSON document per section) ----
create table if not exists site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Per-page SEO ---------------------------------------------
create table if not exists seo_pages (
  page_slug text primary key,
  meta_title text not null default '',
  meta_description text not null default '',
  keywords text not null default '',
  og_image_url text,
  updated_at timestamptz not null default now()
);

-- 3. Homepage section layout ----------------------------------
create table if not exists homepage_sections (
  section_key text primary key,
  enabled boolean not null default true,
  sort_order int not null default 0
);

-- 4. Public media storage bucket ------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- 5. Row level security ----------------------------------------
alter table site_content enable row level security;
alter table seo_pages enable row level security;
alter table homepage_sections enable row level security;

-- Everyone can read content (the public website needs it)...
create policy "site_content public read" on site_content
  for select using (true);
create policy "seo_pages public read" on seo_pages
  for select using (true);
create policy "homepage_sections public read" on homepage_sections
  for select using (true);

-- ...but only signed-in users (admins) can write.
create policy "site_content admin insert" on site_content
  for insert with check (auth.role() = 'authenticated');
create policy "site_content admin update" on site_content
  for update using (auth.role() = 'authenticated');
create policy "site_content admin delete" on site_content
  for delete using (auth.role() = 'authenticated');

create policy "seo_pages admin insert" on seo_pages
  for insert with check (auth.role() = 'authenticated');
create policy "seo_pages admin update" on seo_pages
  for update using (auth.role() = 'authenticated');
create policy "seo_pages admin delete" on seo_pages
  for delete using (auth.role() = 'authenticated');

create policy "homepage_sections admin insert" on homepage_sections
  for insert with check (auth.role() = 'authenticated');
create policy "homepage_sections admin update" on homepage_sections
  for update using (auth.role() = 'authenticated');
create policy "homepage_sections admin delete" on homepage_sections
  for delete using (auth.role() = 'authenticated');

-- 6. Storage policies: public read, admin write -----------------
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');
create policy "media admin insert" on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "media admin update" on storage.objects
  for update using (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "media admin delete" on storage.objects
  for delete using (bucket_id = 'media' and auth.role() = 'authenticated');
