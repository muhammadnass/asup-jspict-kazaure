-- =========================================================
-- ASUP Jigawa — Migration: add missing columns + departments
-- Run this in Supabase Dashboard > SQL Editor
-- =========================================================

-- 1. Add missing columns to members table
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS email        text,
  ADD COLUMN IF NOT EXISTS department   text,
  ADD COLUMN IF NOT EXISTS is_approved  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS user_id      uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS cv_url       text,
  ADD COLUMN IF NOT EXISTS title        text;

-- 2. Create departments table (admin-configured)
CREATE TABLE IF NOT EXISTS departments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL UNIQUE,
  display_order int NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read departments" ON departments
  FOR SELECT USING (true);
CREATE POLICY "admins insert departments" ON departments
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admins update departments" ON departments
  FOR UPDATE USING (is_admin());
CREATE POLICY "admins delete departments" ON departments
  FOR DELETE USING (is_admin());

-- 3. Create research_outputs table (replaces old publications category)
CREATE TABLE IF NOT EXISTS research_outputs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     uuid REFERENCES members(id) ON DELETE CASCADE,
  title         text NOT NULL,
  abstract      text NOT NULL DEFAULT '',
  file_url      text,
  published     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
ALTER TABLE research_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read research" ON research_outputs
  FOR SELECT USING (published = true OR (auth.uid() IS NOT NULL AND member_id IN (SELECT id FROM members WHERE user_id = auth.uid())));
CREATE POLICY "members insert research" ON research_outputs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
CREATE POLICY "members update research" ON research_outputs
  FOR UPDATE USING (auth.uid() IS NOT NULL AND member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
CREATE POLICY "admins manage research" ON research_outputs
  FOR ALL USING (is_admin());

-- 4. Drop old RLS policies for members and replace with new ones
DROP POLICY IF EXISTS "public read members"          ON members;
DROP POLICY IF EXISTS "admins write members"         ON members;
DROP POLICY IF EXISTS "admins update members"        ON members;
DROP POLICY IF EXISTS "admins delete members"        ON members;

-- Public can only see approved members
CREATE POLICY "public read approved members" ON members
  FOR SELECT USING (is_approved = true OR auth.uid() = user_id OR is_admin());

-- Members can insert their own row (self-registration)
CREATE POLICY "members can insert own" ON members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Members can update their own row
CREATE POLICY "members can update own" ON members
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());

-- Only admins can delete
CREATE POLICY "admins delete members" ON members
  FOR DELETE USING (is_admin());

-- 5. Storage bucket for CVs (skip if already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-cvs', 'member-cvs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage: members can upload their own CV
CREATE POLICY "members upload own cv" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'member-cvs'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "public read cvs" ON storage.objects
  FOR SELECT USING (bucket_id = 'member-cvs');
CREATE POLICY "members update own cv" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'member-cvs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage: members can upload their own photos
CREATE POLICY "members upload own photo" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'member-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "members update own photo" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'member-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. Seed a few default departments (admin can add/remove more from admin panel)
INSERT INTO departments (name, display_order) VALUES
  ('Department of Computer Science', 1),
  ('Department of Information Technology', 2),
  ('Department of Cyber Security', 3),
  ('Department of Software Engineering', 4),
  ('Department of Networking', 5),
  ('Department of General Studies', 6)
ON CONFLICT (name) DO NOTHING;

-- =========================================================
-- After running this:
--   1. Existing member rows will have is_approved = false
--      → go to Admin > Members and approve each one manually
--   2. Storage policies for member-photos may conflict if you
--      already have "admins upload member photos" — drop the
--      old one in Dashboard > Storage > Policies if needed
-- =========================================================
