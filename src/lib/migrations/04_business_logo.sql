-- Run this in your Supabase SQL Editor to add logo upload support.

-- 1. Table to store the active business logo URL
CREATE TABLE IF NOT EXISTS business_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE IF EXISTS business_logos ENABLE ROW LEVEL SECURITY;

-- Public can view the logo
DROP POLICY IF EXISTS "Public can view business logo" ON business_logos;
CREATE POLICY "Public can view business logo"
  ON business_logos FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin can manage the logo
DROP POLICY IF EXISTS "Admin full access business logos" ON business_logos;
CREATE POLICY "Admin full access business logos"
  ON business_logos FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- 2. Storage bucket for logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read logos
DROP POLICY IF EXISTS "Public read logos" ON storage.objects;
CREATE POLICY "Public read logos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'business-logos');

-- Admin can upload/update/delete logos
DROP POLICY IF EXISTS "Admin manage logos" ON storage.objects;
CREATE POLICY "Admin manage logos"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'business-logos' AND auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (bucket_id = 'business-logos' AND auth.uid() IN (SELECT user_id FROM admin_users));
