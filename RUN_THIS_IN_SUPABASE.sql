-- ============================================
-- FIX USER SIGNUP - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================

-- Step 1: Check current policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as command,
    qual as using_expression,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Step 2: Drop existing INSERT policies that might conflict
DROP POLICY IF EXISTS "Enable insert for authentication" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Allow signup" ON users;
DROP POLICY IF EXISTS "Users can insert during signup" ON users;

-- Step 3: Create the correct INSERT policy for signup
-- This allows users to insert their own record when auth.uid() matches the id
CREATE POLICY "Users can insert during signup" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Step 4: Verify RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 5: Check the policies were created correctly
SELECT 
    policyname,
    cmd as command,
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd;

-- Step 6: Show current user count
SELECT COUNT(*) as total_users FROM users;

-- ============================================
-- Expected Output:
-- You should see a policy named "Users can insert during signup" 
-- with command = INSERT
-- ============================================
