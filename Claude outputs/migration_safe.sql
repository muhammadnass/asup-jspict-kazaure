-- =========================================================
-- ASUP Migration (safe version — skips existing policies)
-- Run in Supabase Dashboard > SQL Editor
-- =========================================================

-- 1. Add missing columns to members table
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS email        text,
  ADD COLUMN IF NOT EXISTS department   text,
  ADD COLUMN IF NOT EXISTS is_approved  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS user_id      uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS cv_url       text,
  ADD COLUMN IF NOT EXISTS title        text;

-- 2. Departments table
CREATE TABLE IF NOT EXISTS departments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL UNIQUE,
  display_order int NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "public read departments" ON departments FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admins insert departments" ON departments FOR INSERT WITH CHECK (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admins update departments" ON departments FOR UPDATE USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admins delete departments" ON departments FOR DELETE USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Research outputs table
CREATE TABLE IF NOT EXISTS research_outputs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id  uuid REFERENCES members(id) ON DELETE CASCADE,
  title      text NOT NULL,
  abstract   text NOT NULL DEFAULT '',
  file_url   text,
  published  boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE research_outputs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "public read research" ON research_outputs
    FOR SELECT USING (published = true OR (auth.uid() IS NOT NULL AND member_id IN (SELECT id FROM members WHERE user_id = auth.uid())));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members insert research" ON research_outputs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members update research" ON research_outputs
    FOR UPDATE USING (auth.uid() IS NOT NULL AND member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admins manage research" ON research_outputs FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Fix members RLS — drop old policies, add new self-service ones
DROP POLICY IF EXISTS "public read members"   ON members;
DROP POLICY IF EXISTS "admins write members"  ON members;
DROP POLICY IF EXISTS "admins update members" ON members;
DROP POLICY IF EXISTS "admins delete members" ON members;

DO $$ BEGIN
  CREATE POLICY "public read approved members" ON members
    FOR SELECT USING (is_approved = true OR auth.uid() = user_id OR is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members can insert own" ON members
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members can update own" ON members
    FOR UPDATE USING (auth.uid() = user_id OR is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admins delete members" ON members FOR DELETE USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. member-cvs bucket + policies (safe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-cvs', 'member-cvs', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "members upload own cv" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'member-cvs' AND auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "public read cvs" ON storage.objects
    FOR SELECT USING (bucket_id = 'member-cvs');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members update own cv" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'member-cvs'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. research-outputs bucket + policies (safe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('research-outputs', 'research-outputs', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "members upload research" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'research-outputs' AND auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "public read research files" ON storage.objects
    FOR SELECT USING (bucket_id = 'research-outputs');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. Seed default departments
INSERT INTO departments (name, display_order) VALUES
  ('Department of Computer Science', 1),
  ('Department of Information Technology', 2),
  ('Department of Cyber Security', 3),
  ('Department of Software Engineering', 4),
  ('Department of Networking', 5),
  ('Department of General Studies', 6)
ON CONFLICT (name) DO NOTHING;

-- Done! Existing members will have is_approved = false.
-- Go to Admin > Members to approve them.
