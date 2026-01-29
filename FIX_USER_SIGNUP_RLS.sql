-- Fix RLS Policies for User Signup
-- Run this in Supabase SQL Editor to allow users to be created during signup

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON users;
DROP POLICY IF EXISTS "Allow signup" ON users;

-- Create new policy that allows INSERT during signup
-- This policy allows users to insert their own record when signing up
CREATE POLICY "Enable insert for authentication" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Alternative: If you want to allow service role to insert (recommended for signup flow)
-- This allows the backend/service to create user records
CREATE POLICY "Allow signup" ON users
  FOR INSERT
  WITH CHECK (true);

-- Update existing SELECT policy to allow users to read their own data
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users
  FOR SELECT 
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- Ensure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Show current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';
