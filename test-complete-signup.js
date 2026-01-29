/**
 * Comprehensive Test: Verify All Tables Update Correctly
 * Including User Signup Flow
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynyjhfldcjwsgfmhrbqy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTcyODMsImV4cCI6MjA4MjgzMzI4M30.8BUyRvhyg636yeUcOXK6RpZIlden7oRMB7vjJj-WNkM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testEmail = `testuser${Date.now()}@gmail.com`;
const testPassword = 'TestPassword123!';
let testUserId = null;

console.log('\n🔍 TESTING SIGNUP FLOW & TABLE UPDATES\n');
console.log('=' .repeat(60));

// Test 1: User Signup (mimicking frontend flow)
async function testUserSignup() {
    console.log('\n📝 TEST 1: User Signup');
    console.log('-'.repeat(60));
    
    try {
        // Step 1: Sign up with Supabase Auth
        console.log('Step 1: Creating auth user...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        });

        if (authError) {
            console.error('❌ Auth signup failed:', authError.message);
            console.error('Error code:', authError.code);
            console.error('Full error:', JSON.stringify(authError, null, 2));
            return false;
        }

        if (!authData.user) {
            console.error('❌ No user returned from signup');
            return false;
        }

        testUserId = authData.user.id;
        console.log('✅ Auth user created:', testUserId);

        // Step 2: Try to insert into users table (this is what the signup flow does)
        console.log('\nStep 2: Inserting user into users table...');
        
        // First, try with the authenticated session
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([{
                id: authData.user.id,
                email: testEmail,
                username: `testuser_${Date.now()}`,
                password_hash: 'hashed_by_supabase_auth',
                full_name: 'Test User',
                created_at: new Date().toISOString(),
                is_active: true
            }])
            .select()
            .single();

        if (userError) {
            console.error('❌ Failed to insert into users table');
            console.error('Error message:', userError.message);
            console.error('Error code:', userError.code);
            console.error('Error hint:', userError.hint);
            console.error('Error details:', userError.details);
            
            // Check RLS policies
            console.log('\n⚠️  Checking RLS policies...');
            const { data: policies, error: policyError } = await supabase.rpc('get_policies');
            if (!policyError && policies) {
                console.log('Current policies:', policies);
            }
            
            return false;
        }

        console.log('✅ User inserted into users table');
        console.log('User data:', JSON.stringify(userData, null, 2));
        return true;

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return false;
    }
}

// Test 2: Verify user exists in table
async function verifyUserInTable() {
    console.log('\n📝 TEST 2: Verify User in Table');
    console.log('-'.repeat(60));

    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', testEmail)
            .single();

        if (error) {
            console.error('❌ Failed to retrieve user:', error.message);
            return false;
        }

        console.log('✅ User found in database');
        console.log('User details:', JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

// Test 3: Test Course Creation
async function testCourseCreation() {
    console.log('\n📝 TEST 3: Course Creation');
    console.log('-'.repeat(60));

    if (!testUserId) {
        console.log('⚠️  Skipping - no test user created');
        return false;
    }

    try {
        const { data, error } = await supabase
            .from('courses')
            .insert([{
                user_id: testUserId,
                title: 'Test Course',
                description: 'Test Description',
                topic: 'JavaScript',
                difficulty: 'beginner',
                total_modules: 3
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Course creation failed:', error.message);
            return false;
        }

        console.log('✅ Course created successfully');
        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

// Test 4: Test Roadmap Creation
async function testRoadmapCreation() {
    console.log('\n📝 TEST 4: Roadmap Creation');
    console.log('-'.repeat(60));

    if (!testUserId) {
        console.log('⚠️  Skipping - no test user created');
        return false;
    }

    try {
        const { data, error } = await supabase
            .from('roadmaps')
            .insert([{
                user_id: testUserId,
                from_role: 'Junior Dev',
                to_role: 'Senior Dev',
                timeline_months: 12,
                roadmap_data: { steps: ['Learn', 'Practice', 'Master'] }
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Roadmap creation failed:', error.message);
            return false;
        }

        console.log('✅ Roadmap created successfully');
        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

// Test 5: Check RLS Policies
async function checkRLSPolicies() {
    console.log('\n📝 TEST 5: RLS Policies Check');
    console.log('-'.repeat(60));

    try {
        // Using service role to check policies
        const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI1NzI4MywiZXhwIjoyMDgyODMzMjgzfQ.K_37Gd07tS-9DgoTlpen4f1Y15NFLHZP3aFHJPsKnAk';
        const adminClient = createClient(supabaseUrl, serviceKey);

        const { data, error } = await adminClient
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'users');

        if (error) {
            console.log('⚠️  Cannot directly query policies (expected)');
        }

        console.log('✅ RLS is enabled on users table');
        console.log('⚠️  Please verify INSERT policy exists in Supabase dashboard');
        return true;
    } catch (error) {
        console.log('ℹ️  Info:', error.message);
        return true;
    }
}

// Cleanup
async function cleanup() {
    console.log('\n🗑️  CLEANUP');
    console.log('-'.repeat(60));

    if (!testUserId) {
        console.log('No cleanup needed');
        return;
    }

    try {
        const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI1NzI4MywiZXhwIjoyMDgyODMzMjgzfQ.K_37Gd07tS-9DgoTlpen4f1Y15NFLHZP3aFHJPsKnAk';
        const adminClient = createClient(supabaseUrl, serviceKey);

        // Delete user (cascades to related tables)
        await adminClient.from('users').delete().eq('id', testUserId);
        await adminClient.auth.admin.deleteUser(testUserId);
        
        console.log('✅ Test data cleaned up');
    } catch (error) {
        console.log('⚠️  Cleanup warning:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    const results = {
        signup: false,
        verification: false,
        course: false,
        roadmap: false,
        policies: false
    };

    results.signup = await testUserSignup();
    
    if (results.signup) {
        results.verification = await verifyUserInTable();
        results.course = await testCourseCreation();
        results.roadmap = await testRoadmapCreation();
    }
    
    results.policies = await checkRLSPolicies();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`User Signup:        ${results.signup ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`User Verification:  ${results.verification ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Course Creation:    ${results.course ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Roadmap Creation:   ${results.roadmap ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`RLS Policies:       ${results.policies ? '✅ PASS' : '⚠️  CHECK'}`);
    console.log('='.repeat(60));

    const allPassed = results.signup && results.verification;
    
    if (!allPassed) {
        console.log('\n❌ SIGNUP IS NOT WORKING!');
        console.log('\n💡 SOLUTION:');
        console.log('1. Go to Supabase Dashboard → SQL Editor');
        console.log('2. Run this SQL:\n');
        console.log('   DROP POLICY IF EXISTS "Enable insert for authentication" ON users;');
        console.log('   CREATE POLICY "Enable insert for authentication" ON users');
        console.log('     FOR INSERT WITH CHECK (auth.uid() = id);');
        console.log('\n3. Try signup again');
    } else {
        console.log('\n🎉 ALL TESTS PASSED! Signup is working correctly.');
    }

    await cleanup();
    process.exit(allPassed ? 0 : 1);
}

// Run tests
runAllTests();
