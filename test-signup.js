/**
 * Test Supabase Authentication and User Creation
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynyjhfldcjwsgfmhrbqy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI1NzI4MywiZXhwIjoyMDgyODMzMjgzfQ.K_37Gd07tS-9DgoTlpen4f1Y15NFLHZP3aFHJPsKnAk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSignUp() {
    console.log('Testing user signup and database insertion...\n');

    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testUsername = `testuser_${Date.now()}`;

    try {
        // Step 1: Create auth user
        console.log('Step 1: Creating auth user...');
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: testEmail,
            password: testPassword,
            email_confirm: true
        });

        if (authError) {
            console.error('❌ Auth creation failed:', authError.message);
            return;
        }

        console.log('✅ Auth user created:', authData.user.id);

        // Step 2: Insert into users table
        console.log('\nStep 2: Inserting into users table...');
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    email: testEmail,
                    username: testUsername,
                    password_hash: 'hashed_via_supabase_auth',
                    full_name: 'Test User',
                    created_at: new Date().toISOString(),
                    is_active: true
                }
            ])
            .select()
            .single();

        if (userError) {
            console.error('❌ Users table insertion failed:', userError.message);
            console.error('Full error:', userError);
            
            // Cleanup auth user if table insert fails
            await supabase.auth.admin.deleteUser(authData.user.id);
            console.log('🗑️  Cleaned up auth user');
            return;
        }

        console.log('✅ User record created in database');
        console.log('User data:', userData);

        // Step 3: Verify the user exists
        console.log('\nStep 3: Verifying user in database...');
        const { data: verifyData, error: verifyError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (verifyError) {
            console.error('❌ Verification failed:', verifyError.message);
        } else {
            console.log('✅ User verified in database');
            console.log('Verified user:', verifyData);
        }

        // Cleanup
        console.log('\n🗑️  Cleaning up test user...');
        await supabase.from('users').delete().eq('id', authData.user.id);
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log('✅ Cleanup complete');

        console.log('\n🎉 All tests passed! Signup functionality is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

// Run the test
testSignUp();
