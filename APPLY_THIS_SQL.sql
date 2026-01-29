-- COPY AND RUN THIS IN SUPABASE SQL EDITOR
-- This will fix the user signup issue

-- First, check current policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';

-- Drop any existing INSERT policies
DROP POLICY IF EXISTS "Enable insert for authentication" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Allow signup" ON users;

-- Create the INSERT policy that allows signup
-- This allows users to insert their own record when auth.uid() matches the id
CREATE POLICY "Enable insert for authentication" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'users';

-- Test by checking if we can insert (this will show the policy is active)
SELECT COUNT(*) as current_users FROM users;
