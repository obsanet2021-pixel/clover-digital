-- ============================================================
-- CLOVER DIGITAL - Supabase RLS Policies for Storage & Tables
-- Run this in the Supabase Dashboard SQL Editor
-- ============================================================

-- ============================================================
-- PART 1: STORAGE BUCKET POLICIES (fixes "new row violates 
-- row-level security policy" error on image upload)
-- ============================================================
-- NOTE: Since the admin dashboard uses a custom auth system (not
-- Supabase Auth's signInWithPassword), the user is recognized as
-- 'anon' by Supabase. So we need policies for BOTH anon and
-- authenticated roles.

-- First, drop existing policies if they exist (to make this re-runnable)
DROP POLICY IF EXISTS "Allow authenticated uploads to portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated selects on portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates on portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes on portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read on portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon uploads to portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon selects on portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon updates on portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon deletes on portfolio-images" ON storage.objects;

-- 1. Allow anon users (admin dashboard) to upload files to portfolio-images bucket
CREATE POLICY "Allow anon uploads to portfolio-images"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
    bucket_id = 'portfolio-images'
);

-- 2. Allow anon users to select/view files in portfolio-images bucket
CREATE POLICY "Allow anon selects on portfolio-images"
ON storage.objects
FOR SELECT
TO anon
USING (
    bucket_id = 'portfolio-images'
);

-- 3. Allow anon users to update files in portfolio-images bucket
CREATE POLICY "Allow anon updates on portfolio-images"
ON storage.objects
FOR UPDATE
TO anon
USING (
    bucket_id = 'portfolio-images'
)
WITH CHECK (
    bucket_id = 'portfolio-images'
);

-- 4. Allow anon users to delete files from portfolio-images bucket
CREATE POLICY "Allow anon deletes on portfolio-images"
ON storage.objects
FOR DELETE
TO anon
USING (
    bucket_id = 'portfolio-images'
);

-- 5. Also allow authenticated users (if Supabase Auth is used later)
CREATE POLICY "Allow authenticated uploads to portfolio-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-images');

CREATE POLICY "Allow authenticated selects on portfolio-images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Allow authenticated updates on portfolio-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio-images')
WITH CHECK (bucket_id = 'portfolio-images');

CREATE POLICY "Allow authenticated deletes on portfolio-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio-images');

-- ============================================================
-- PART 2: PORTFOLIO_PROJECTS TABLE POLICIES
-- ============================================================

-- Drop existing portfolio_projects policies to make this re-runnable
DROP POLICY IF EXISTS "Allow authenticated read on portfolio_projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Allow authenticated insert on portfolio_projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Allow authenticated update on portfolio_projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Allow authenticated delete on portfolio_projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Allow public read published on portfolio_projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Allow anon full access to portfolio_projects" ON public.portfolio_projects;

-- Allow authenticated users to read all projects
CREATE POLICY "Allow authenticated read on portfolio_projects"
ON public.portfolio_projects
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert projects
CREATE POLICY "Allow authenticated insert on portfolio_projects"
ON public.portfolio_projects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update projects
CREATE POLICY "Allow authenticated update on portfolio_projects"
ON public.portfolio_projects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete projects
CREATE POLICY "Allow authenticated delete on portfolio_projects"
ON public.portfolio_projects
FOR DELETE
TO authenticated
USING (true);

-- Allow public/anonymous users to read only published projects
CREATE POLICY "Allow public read published on portfolio_projects"
ON public.portfolio_projects
FOR SELECT
TO anon
USING (status = 'published');

-- ============================================================
-- PART 3: ADMIN_USERS TABLE POLICIES
-- ============================================================

-- Drop existing admin_users policies to make this re-runnable
DROP POLICY IF EXISTS "Allow authenticated read on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow anon to read admin_users" ON public.admin_users;

-- Allow authenticated users to read admin_users (for login verification)
CREATE POLICY "Allow authenticated read on admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);

-- ============================================================
-- VERIFICATION QUERIES (run these to confirm policies exist)
-- ============================================================

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check table policies
SELECT * FROM pg_policies WHERE tablename IN ('portfolio_projects', 'admin_users');
